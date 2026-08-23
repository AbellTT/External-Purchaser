from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Sum
from django.utils import timezone
from django.core.paginator import Paginator

from .models import Basket, BasketParticipant
from .serializers import BasketSerializer, BasketListSerializer
from apps.products.models import Product, Brand
from apps.notifications.models import Notification
from apps.notifications.utils import send_basket_completed_notifications, broadcast_ws_event


# ===================== USER ENDPOINTS =====================


class BasketListView(views.APIView):
    """
    GET /api/baskets/
    Returns open/active/completed baskets for user.
    Query params: ?tab=active|open|completed&page=1&pageSize=10&search=...&duration_type=...
    """
    permission_classes = [AllowAny]

    def get(self, request):
        tab = request.query_params.get('tab', 'open').strip().lower()
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 10)), 1), 50)
        search = request.query_params.get('search', '').strip()
        duration_type = request.query_params.get('duration_type', '').strip().upper()

        user = request.user if request.user.is_authenticated else None

        if tab == 'active':
            # Baskets that are OPEN where user HAS committed quantity
            if user:
                active_ids = BasketParticipant.objects.filter(
                    user=user, committed_quantity__gt=0
                ).values_list('basket_id', flat=True)
                queryset = Basket.objects.filter(
                    id__in=active_ids, status='OPEN'
                ).select_related('product', 'product__category', 'brand')
            else:
                queryset = Basket.objects.none()

        elif tab == 'completed':
            # Baskets that are COMPLETED/CLOSED where user DID participate
            if user:
                completed_ids = BasketParticipant.objects.filter(
                    user=user, committed_quantity__gt=0
                ).values_list('basket_id', flat=True)
                queryset = Basket.objects.filter(
                    id__in=completed_ids, status__in=['COMPLETED', 'CLOSED']
                ).select_related('product', 'product__category', 'brand')
            else:
                queryset = Basket.objects.none()

        else:
            # tab == 'open' -> OPEN baskets that user HAS NOT joined yet
            if user:
                joined_ids = BasketParticipant.objects.filter(
                    user=user, committed_quantity__gt=0
                ).values_list('basket_id', flat=True)
                queryset = Basket.objects.filter(
                    status='OPEN'
                ).exclude(id__in=joined_ids).select_related('product', 'product__category', 'brand')
            else:
                queryset = Basket.objects.filter(
                    status='OPEN'
                ).select_related('product', 'product__category', 'brand')

        # Filter by duration_type if provided
        if duration_type and duration_type in ['WEEKLY', 'MONTHLY', 'SIX_MONTH']:
            queryset = queryset.filter(duration_type=duration_type)

        # Filter by search query if provided
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(product__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        queryset = queryset.order_by('-created_at')
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        serializer = BasketListSerializer(page_obj.object_list, many=True)

        # Annotate userCommittedQuantity for each basket
        user_commitments = {}
        if user:
            participants = BasketParticipant.objects.filter(
                user=user,
                basket_id__in=[b.id for b in page_obj.object_list],
            )
            for p in participants:
                user_commitments[p.basket_id] = p.committed_quantity

        baskets_data = serializer.data
        for b in baskets_data:
            b['userCommittedQuantity'] = user_commitments.get(b['id'], 0)

        return Response({
            'success': True,
            'data': {
                'baskets': baskets_data,
                'pagination': {
                    'currentPage': page_obj.number,
                    'totalPages': paginator.num_pages,
                    'totalBaskets': paginator.count,
                    'pageSize': page_size,
                },
            },
        })


class BasketJoinView(views.APIView):
    """
    POST /api/baskets/<id>/join/
    User commits quantity to an open basket (or sets quantity=0 to leave).
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            basket = Basket.objects.get(pk=pk)
        except Basket.DoesNotExist:
            return Response({'success': False, 'error': 'Basket not found.'}, status=status.HTTP_404_NOT_FOUND)

        if basket.status != 'OPEN':
            return Response({'success': False, 'error': 'This basket is no longer open for commitments.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        if not user:
            return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if hasattr(user, 'organization') and user.organization and user.organization.verification_status != 'VERIFIED':
            return Response({
                'success': False,
                'error': 'Your organization registration is currently pending admin approval. Joining procurement pools requires verified organization status.'
            }, status=status.HTTP_403_FORBIDDEN)

        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            BasketParticipant.objects.filter(basket=basket, user=user).delete()

            total = BasketParticipant.objects.filter(basket=basket).aggregate(
                total=Sum('committed_quantity')
            )['total'] or 0
            basket.current_quantity = total
            basket.save()

            return Response({
                'success': True,
                'message': f'Left basket "{basket.name}" successfully.',
                'data': {
                    'basketId': basket.id,
                    'userCommittedQuantity': 0,
                    'currentQuantity': basket.current_quantity,
                    'targetQuantity': basket.target_quantity,
                    'progressPercentage': basket.progress_percentage,
                },
            })

        participant, _ = BasketParticipant.objects.get_or_create(
            basket=basket,
            user=user,
            defaults={
                'organization': user.organization if hasattr(user, 'organization') else None,
                'committed_quantity': 0,
            },
        )

        participant.committed_quantity = quantity
        participant.save()

        # Track progress before and after update
        old_current = basket.current_quantity
        total = BasketParticipant.objects.filter(basket=basket).aggregate(
            total=Sum('committed_quantity')
        )['total'] or 0
        basket.current_quantity = total
        basket.save()

        # Notify ALL users ONCE if basket just crossed 100% capacity and notification has not been sent yet
        if basket.target_quantity > 0 and basket.current_quantity >= basket.target_quantity and not basket.is_full_notification_sent:
            basket.is_full_notification_sent = True
            basket.save(update_fields=['is_full_notification_sent'])
            send_basket_completed_notifications(basket=basket, committer_user=user)

        # Broadcast real-time basket commitment update to all connected clients
        broadcast_ws_event({
            'type': 'BASKET_UPDATED',
            'basketId': basket.id,
            'currentQuantity': basket.current_quantity,
            'targetQuantity': basket.target_quantity,
            'progressPercentage': basket.progress_percentage,
            'status': basket.status,
            'isFull': basket.current_quantity >= basket.target_quantity if basket.target_quantity > 0 else False,
        })

        return Response({
            'success': True,
            'message': f'Committed {quantity} units to {basket.name}.',
            'data': {
                'basketId': basket.id,
                'userCommittedQuantity': participant.committed_quantity,
                'currentQuantity': basket.current_quantity,
                'targetQuantity': basket.target_quantity,
                'progressPercentage': basket.progress_percentage,
            },
        })


class BasketHistoryListView(views.APIView):
    """
    GET /api/baskets/history/
    Returns completed, closed, and cancelled baskets for platform-wide historical reference.
    Query params: ?page=1&pageSize=10&search=...&duration_type=...
    """
    permission_classes = [AllowAny]

    def get(self, request):
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 10)), 1), 50)
        search = request.query_params.get('search', '').strip()
        duration_type = request.query_params.get('duration_type', '').strip().upper()

        queryset = Basket.objects.filter(
            status__in=['COMPLETED', 'CLOSED', 'CANCELLED'],
        ).select_related('product', 'product__category', 'brand')

        if duration_type and duration_type in ['WEEKLY', 'MONTHLY', 'SIX_MONTH']:
            queryset = queryset.filter(duration_type=duration_type)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(product__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        queryset = queryset.order_by('-closed_at', '-created_at')
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        serializer = BasketListSerializer(page_obj.object_list, many=True)

        return Response({
            'success': True,
            'data': {
                'baskets': serializer.data,
                'pagination': {
                    'currentPage': page_obj.number,
                    'totalPages': paginator.num_pages,
                    'totalBaskets': paginator.count,
                    'pageSize': page_size,
                },
            },
        })


# ===================== ADMIN ENDPOINTS =====================


class AdminBasketListView(views.APIView):
    """
    GET /api/baskets/admin/
    Returns all baskets for admin management with pagination, status filter, duration filter, and search.
    Query params: ?status=OPEN&duration_type=WEEKLY&search=...&page=1&pageSize=10
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_filter = request.query_params.get('status', '').strip().upper()
        duration_type = request.query_params.get('duration_type', '').strip().upper()
        search = request.query_params.get('search', '').strip()
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 10)), 1), 50)

        queryset = Basket.objects.select_related(
            'product', 'product__category', 'brand',
        ).prefetch_related('participants', 'participants__user', 'participants__organization')

        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(status=status_filter)

        if duration_type and duration_type != 'ALL' and duration_type in ['WEEKLY', 'MONTHLY', 'SIX_MONTH']:
            queryset = queryset.filter(duration_type=duration_type)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(product__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        queryset = queryset.order_by('-created_at')
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        serializer = BasketSerializer(page_obj.object_list, many=True)

        all_baskets = Basket.objects.all()
        summary = {
            'total': all_baskets.count(),
            'open': all_baskets.filter(status='OPEN').count(),
            'completed': all_baskets.filter(status__in=['COMPLETED', 'CLOSED']).count(),
            'draft': all_baskets.filter(status='DRAFT').count(),
            'cancelled': all_baskets.filter(status='CANCELLED').count(),
        }

        return Response({
            'success': True,
            'data': {
                'baskets': serializer.data,
                'pagination': {
                    'currentPage': page_obj.number,
                    'totalPages': paginator.num_pages,
                    'totalBaskets': paginator.count,
                    'pageSize': page_size,
                },
                'summary': summary,
            },
        })


class AdminBasketCreateView(views.APIView):
    """
    POST /api/baskets/admin/create/
    Creates a new basket using selected product+brand.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        duration_type = request.data.get('durationType', 'WEEKLY').upper()
        target_quantity = int(request.data.get('targetQuantity', 100))
        product_id = request.data.get('productId')
        brand_id = request.data.get('brandId')
        publish = request.data.get('publish', False)

        if not name:
            return Response({'success': False, 'error': 'Basket name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if duration_type not in ['WEEKLY', 'MONTHLY', 'SIX_MONTH']:
            return Response({'success': False, 'error': 'Invalid duration type.'}, status=status.HTTP_400_BAD_REQUEST)

        if target_quantity <= 0:
            return Response({'success': False, 'error': 'Target quantity must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'success': False, 'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            brand = Brand.objects.get(pk=brand_id, product=product)
        except Brand.DoesNotExist:
            return Response({'success': False, 'error': 'Brand not found for this product.'}, status=status.HTTP_404_NOT_FOUND)

        basket = Basket.objects.create(
            name=name,
            duration_type=duration_type,
            product=product,
            brand=brand,
            merkato_retailer_price=brand.merkato_retailer_price,
            regular_market_price=brand.regular_market_price,
            target_quantity=target_quantity,
            status='OPEN' if publish else 'DRAFT',
            published_at=timezone.now() if publish else None,
            created_by=request.user if request.user.is_authenticated else None,
        )

        serializer = BasketSerializer(basket)

        # Broadcast basket created event
        broadcast_ws_event({
            'type': 'BASKET_STATUS_CHANGED',
            'basketId': basket.id,
            'basketNumber': f"BSK-{basket.id}",
            'status': basket.status,
            'name': basket.name,
        })

        return Response({
            'success': True,
            'message': f'Basket "{name}" created successfully.',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)


class AdminBasketCloseView(views.APIView):
    """
    PATCH /api/baskets/admin/<id>/close/
    Admin fulfills a basket and sets prices.
    """
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        from django.db import transaction
        try:
            basket = Basket.objects.select_related('brand').get(pk=pk)
        except Basket.DoesNotExist:
            return Response({'success': False, 'error': 'Basket not found.'}, status=status.HTTP_404_NOT_FOUND)

        if basket.status in ['COMPLETED', 'CLOSED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': f'Basket is already {basket.status.lower()}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        babi_price = request.data.get('babiPlatformPrice')
        supplier_cost = request.data.get('supplierCost')

        if babi_price is None or supplier_cost is None:
            return Response({
                'success': False,
                'error': 'Both babiPlatformPrice and supplierCost are required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        from decimal import Decimal
        try:
            babi_price = Decimal(str(babi_price))
            supplier_cost_val = Decimal(str(supplier_cost))
        except Exception:
            return Response({
                'success': False,
                'error': 'Invalid numeric value provided for babiPlatformPrice or supplierCost.',
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            basket.babi_platform_price = babi_price
            basket.supplier_cost = supplier_cost_val
            basket.status = 'COMPLETED'
            basket.closed_at = timezone.now()
            basket.save()

            if basket.brand:
                brand = basket.brand
                brand.babi_platform_price = babi_price
                brand.supplier_cost = supplier_cost_val
                brand.save()

        serializer = BasketSerializer(basket)

        # Broadcast basket fulfilled/closed event
        broadcast_ws_event({
            'type': 'BASKET_STATUS_CHANGED',
            'basketId': basket.id,
            'basketNumber': f"BSK-{basket.id}",
            'status': 'COMPLETED',
            'name': basket.name,
            'babiPlatformPrice': float(babi_price),
            'supplierCost': float(supplier_cost_val),
        })

        return Response({
            'success': True,
            'message': f'Basket "{basket.name}" fulfilled and completed.',
            'data': serializer.data,
        })


class AdminBasketCancelView(views.APIView):
    """
    POST /api/baskets/admin/<id>/cancel/
    Admin cancels a basket.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            basket = Basket.objects.get(pk=pk)
        except Basket.DoesNotExist:
            return Response({'success': False, 'error': 'Basket not found.'}, status=status.HTTP_404_NOT_FOUND)

        if basket.status in ['COMPLETED', 'CLOSED', 'CANCELLED']:
            return Response({
                'success': False,
                'error': f'Cannot cancel a basket that is already {basket.status.lower()}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        basket.status = 'CANCELLED'
        basket.closed_at = timezone.now()
        basket.save()

        serializer = BasketSerializer(basket)

        # Broadcast basket cancelled event
        broadcast_ws_event({
            'type': 'BASKET_STATUS_CHANGED',
            'basketId': basket.id,
            'basketNumber': f"BSK-{basket.id}",
            'status': 'CANCELLED',
            'name': basket.name,
        })

        return Response({
            'success': True,
            'message': f'Basket "{basket.name}" cancelled.',
            'data': serializer.data,
        })


class AdminBasketDeliveryView(views.APIView):
    """
    POST /api/baskets/admin/<id>/delivery/
    Admin updates delivery and logistics details for a basket.
    Body: {
        "deliveryDate": "2026-09-01",
        "carrierName": "Ethio Logistics Express",
        "trackingNumber": "TRK-990812",
        "deliveryNotes": "Dispatching from Merkato main warehouse.",
        "deliveryStatus": "IN_TRANSIT"
    }
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            basket = Basket.objects.get(pk=pk)
        except Basket.DoesNotExist:
            return Response({'success': False, 'error': 'Basket not found.'}, status=status.HTTP_404_NOT_FOUND)

        delivery_date = request.data.get('deliveryDate')
        carrier_name = request.data.get('carrierName', '').strip()
        tracking_number = request.data.get('trackingNumber', '').strip()
        delivery_notes = request.data.get('deliveryNotes', '').strip()
        delivery_status = request.data.get('deliveryStatus', 'SCHEDULED').strip().upper()

        if delivery_date:
            basket.delivery_date = delivery_date
        if carrier_name:
            basket.carrier_name = carrier_name
        if tracking_number:
            basket.tracking_number = tracking_number
        if delivery_notes:
            basket.delivery_notes = delivery_notes
        if delivery_status in ['PENDING', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED']:
            basket.delivery_status = delivery_status

        basket.save()

        serializer = BasketSerializer(basket)
        return Response({
            'success': True,
            'message': f'Delivery details updated for "{basket.name}".',
            'data': serializer.data,
        })
