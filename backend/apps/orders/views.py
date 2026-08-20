import random
import string
from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import (
    OrderSerializer, CreateOrderRequestSerializer,
)
from apps.products.models import Product, Brand
from apps.organizations.models import Organization


def _generate_order_number():
    """Generates order number adhering to ORD-YYYY/MM/DD-XXXXX format."""
    now = timezone.now()
    date_part = now.strftime('%Y/%m/%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"ORD-{date_part}-{random_str}"


class OrderListView(views.APIView):
    """
    Handles user order listing & direct purchase creation.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        status_filter = request.query_params.get('status', '').strip()
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 10)), 1), 100)

        base_queryset = Order.objects.prefetch_related('items__product', 'items__brand', 'organization', 'delivery_address').all()
        
        if user and not user.is_staff:
            from django.db.models import Q
            if user.organization:
                base_queryset = base_queryset.filter(Q(organization=user.organization) | Q(placed_by=user))
            else:
                base_queryset = base_queryset.filter(placed_by=user)

        # Compute global summary metrics for ALL delivered orders of this user (independent of current status filter or pagination)
        delivered_qs = base_queryset.filter(status__iexact='delivered')
        summary_stats = {
            'totalSpend': float(delivered_qs.aggregate(s=Sum('total_amount'))['s'] or Decimal('0.00')),
            'savingsVsRegular': float(delivered_qs.aggregate(s=Sum('savings_vs_regular'))['s'] or Decimal('0.00')),
            'savingsVsMerkato': float(delivered_qs.aggregate(s=Sum('savings_vs_merkato'))['s'] or Decimal('0.00')),
        }

        filtered_queryset = base_queryset
        if status_filter and status_filter != 'all':
            filtered_queryset = filtered_queryset.filter(status__iexact=status_filter)

        total = filtered_queryset.count()
        start = (page - 1) * page_size
        orders_page = filtered_queryset[start:start + page_size]
        serialized = OrderSerializer(orders_page, many=True).data

        return Response({
            'success': True,
            'data': {
                'orders': serialized,
                'summaryStats': summary_stats,
                'pagination': {
                    'currentPage': page,
                    'totalPages': max((total + page_size - 1) // page_size, 1),
                    'totalOrders': total,
                    'pageSize': page_size,
                    'hasMore': page * page_size < total,
                }
            }
        })

    def post(self, request):
        serializer = CreateOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user if request.user.is_authenticated else None
        user_org = getattr(user, 'organization', None) if user else None

        if not user_org and user:
            user_org, _ = Organization.objects.get_or_create(
                name=f"{user.email.split('@')[0].capitalize()} Organization",
                defaults={
                    'tin_number': ''.join(random.choices(string.digits, k=10)),
                    'phone_number': '0911234567',
                    'organization_type': 'Private Company',
                    'city': 'Addis Ababa',
                    'region': 'Addis Ababa City Administration',
                }
            )

        order_number = _generate_order_number()
        order = Order.objects.create(
            order_number=order_number,
            order_type=Order.OrderType.DIRECT,
            organization=user_org,
            status='pending',
            customer_notes=data.get('notes', ''),
            placed_by=user,
            customer_name=user_org.name if user_org else (user.email if user else 'Institutional Buyer'),
            customer_phone=user_org.phone_number if user_org else '0911234567',
            customer_tin=user_org.tin_number if user_org else '1234567890',
            shipping_address=user_org.address_formatted if (user_org and user_org.address_formatted) else 'Main Office, Addis Ababa',
        )

        subtotal = Decimal('0.00')
        savings_vs_merkato = Decimal('0.00')
        savings_vs_regular = Decimal('0.00')

        for item_data in data['items']:
            product = Product.objects.filter(pk=item_data['productId']).first()
            if not product:
                continue

            brand = None
            if item_data.get('brandId'):
                brand = Brand.objects.filter(pk=item_data['brandId']).first()

            qty = item_data['quantity']
            unit_price = Decimal(str(item_data['price']))
            line_total = unit_price * qty
            subtotal += line_total

            regular_price = brand.regular_market_price if (brand and brand.regular_market_price) else unit_price
            merkato_price = brand.merkato_retailer_price if (brand and brand.merkato_retailer_price) else unit_price

            item_savings_merkato = max(Decimal('0.00'), (merkato_price - unit_price) * qty)
            item_savings_regular = max(Decimal('0.00'), (regular_price - unit_price) * qty)

            savings_vs_merkato += item_savings_merkato
            savings_vs_regular += item_savings_regular

            OrderItem.objects.create(
                order=order,
                product=product,
                brand=brand,
                brand_name=brand.name if brand else '',
                unit_name=product.unit_of_measure or 'piece',
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
                original_price=regular_price,
            )

        delivery_fee = Decimal('250.00') if subtotal < Decimal('5000.00') else Decimal('0.00')
        order.subtotal = subtotal
        order.delivery_fee = delivery_fee
        order.total_amount = subtotal + delivery_fee
        order.savings_vs_merkato = savings_vs_merkato
        order.savings_vs_regular = savings_vs_regular
        order.estimated_savings = savings_vs_merkato + savings_vs_regular
        order.save()

        return Response({
            'success': True,
            'data': {
                'orderId': str(order.pk),
                'orderNumber': order.order_number,
                'total': float(order.total_amount),
                'status': order.status,
                'order': OrderSerializer(order).data,
            }
        }, status=status.HTTP_201_CREATED)


class AdminOrderListView(views.APIView):
    """
    Returns all institutional purchase orders for admin order processing.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_filter = request.query_params.get('status', '').strip()
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 20)), 1), 100)

        queryset = Order.objects.prefetch_related('items__product', 'items__brand', 'organization', 'delivery_address').all()

        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status__iexact=status_filter)

        total = queryset.count()
        start = (page - 1) * page_size
        orders_page = queryset[start:start + page_size]

        return Response({
            'success': True,
            'data': {
                'orders': OrderSerializer(orders_page, many=True).data,
                'pagination': {
                    'currentPage': page,
                    'totalPages': max((total + page_size - 1) // page_size, 1),
                    'totalOrders': total,
                    'pageSize': page_size,
                }
            }
        })


class OrderDetailView(views.APIView):
    """
    Retrieve single order or update order status.
    """
    permission_classes = [AllowAny]

    def _get_order(self, pk):
        order = Order.objects.filter(pk=pk).first() if str(pk).isdigit() else None
        if not order:
            order = Order.objects.filter(order_number=pk).first()
        return order

    def get(self, request, pk):
        order = self._get_order(pk)
        if not order:
            return Response({'success': False, 'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'data': OrderSerializer(order).data})

    def patch(self, request, pk):
        order = self._get_order(pk)
        if not order:
            return Response({'success': False, 'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status.lower() == 'cancelled':
            return Response({'success': False, 'error': 'Cancelled orders are final and cannot be modified.'}, status=status.HTTP_400_BAD_REQUEST)

        new_status = request.data.get('status', '').strip().lower()
        valid_statuses = ['pending', 'accepted', 'out-for-delivery', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response({
                'success': False,
                'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = new_status

        if new_status == 'accepted' and not order.confirmed_at:
            order.confirmed_at = timezone.now()
        elif new_status == 'delivered' and not order.delivered_at:
            order.delivered_at = timezone.now()

        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user if request.user.is_authenticated else None,
            notes=request.data.get('notes', f'Status updated to {new_status}')
        )

        return Response({
            'success': True,
            'data': OrderSerializer(order).data
        })


class OrderCancelView(views.APIView):
    """
    Cancels an order permanently.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        order = Order.objects.filter(pk=pk).first() if str(pk).isdigit() else None
        if not order:
            order = Order.objects.filter(order_number=pk).first()
        if not order:
            return Response({'success': False, 'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status.lower() not in ['pending', 'accepted']:
            return Response({
                'success': False,
                'error': f'Orders can only be cancelled while in pending or accepted status (current status: {order.status}).'
            }, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        order.status = 'cancelled'
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status='cancelled',
            changed_by=request.user if request.user.is_authenticated else None,
            notes='Order cancelled permanently'
        )

        return Response({
            'success': True,
            'message': 'Order cancelled permanently.',
            'data': OrderSerializer(order).data
        })


class OrderReorderView(views.APIView):
    """
    Duplicates an order and creates a new direct purchase order.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        original_order = Order.objects.filter(pk=pk).first() if str(pk).isdigit() else None
        if not original_order:
            original_order = Order.objects.filter(order_number=pk).first()
        if not original_order:
            return Response({'success': False, 'error': 'Original order not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user if request.user.is_authenticated else original_order.placed_by
        new_order_number = _generate_order_number()

        new_order = Order.objects.create(
            order_number=new_order_number,
            order_type=Order.OrderType.DIRECT,
            organization=original_order.organization,
            delivery_address=original_order.delivery_address,
            status='pending',
            customer_notes=f"Reorder of {original_order.order_number}",
            placed_by=user,
            customer_name=original_order.customer_name,
            customer_phone=original_order.customer_phone,
            customer_tin=original_order.customer_tin,
            shipping_address=original_order.shipping_address,
        )

        subtotal = Decimal('0.00')
        savings_vs_merkato = Decimal('0.00')
        savings_vs_regular = Decimal('0.00')

        for item in original_order.items.all():
            brand = item.brand
            unit_price = item.unit_price
            if brand and brand.direct_purchase_price:
                unit_price = brand.direct_purchase_price

            qty = item.quantity
            line_total = unit_price * qty
            subtotal += line_total

            regular_price = brand.regular_market_price if (brand and brand.regular_market_price) else unit_price
            merkato_price = brand.merkato_retailer_price if (brand and brand.merkato_retailer_price) else unit_price

            savings_vs_merkato += max(Decimal('0.00'), (merkato_price - unit_price) * qty)
            savings_vs_regular += max(Decimal('0.00'), (regular_price - unit_price) * qty)

            OrderItem.objects.create(
                order=new_order,
                product=item.product,
                brand=brand,
                brand_name=item.brand_name,
                unit_name=item.unit_name,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
                original_price=regular_price,
            )

        delivery_fee = Decimal('250.00') if subtotal < Decimal('5000.00') else Decimal('0.00')
        new_order.subtotal = subtotal
        new_order.delivery_fee = delivery_fee
        new_order.total_amount = subtotal + delivery_fee
        new_order.savings_vs_merkato = savings_vs_merkato
        new_order.savings_vs_regular = savings_vs_regular
        new_order.estimated_savings = savings_vs_merkato + savings_vs_regular
        new_order.save()

        return Response({
            'success': True,
            'message': f'Reorder created successfully: {new_order.order_number}',
            'data': OrderSerializer(new_order).data
        }, status=status.HTTP_201_CREATED)
