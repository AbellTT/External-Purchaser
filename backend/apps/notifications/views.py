import threading
import json
import urllib.request
from django.utils import timezone
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model

from .models import Notification
from .serializers import NotificationSerializer

User = get_user_model()


def _send_ws_event(event_data):
    """Async thread worker to notify HTTP broadcast server (port 8003)."""
    try:
        data = json.dumps(event_data).encode('utf-8')
        req = urllib.request.Request(
            'http://127.0.0.1:8003/',
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=2)
    except Exception as e:
        pass


def _notify_ws(event_data):
    threading.Thread(target=_send_ws_event, args=(event_data,), daemon=True).start()


def send_user_notification(user, title, message, notification_type=Notification.NotificationType.ANNOUNCEMENT, action_url='', basket=None, order=None):
    """
    Creates a Notification record for a single user and broadcasts a targeted WebSocket event.
    """
    if not user or not user.is_authenticated:
        return None

    try:
        n = Notification.objects.create(
            user=user,
            organization=getattr(user, 'organization', None),
            notification_type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            basket=basket,
            order=order,
            is_read=False,
        )

        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        payload = NotificationSerializer(n).data

        _notify_ws({
            'type': 'NEW_NOTIFICATION',
            'userId': user.id,
            'userEmail': user.email,
            'unreadCount': unread_count,
            'notification': payload,
        })
        return n
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None


def send_global_notification(title, message, notification_type=Notification.NotificationType.ANNOUNCEMENT, action_url='', basket=None):
    """
    Broadcasts a notification to ALL active users on MBE External Purchaser.
    """
    try:
        active_users = User.objects.filter(is_active=True)
        for u in active_users:
            send_user_notification(
                user=u,
                title=title,
                message=message,
                notification_type=notification_type,
                action_url=action_url,
                basket=basket
            )
    except Exception as e:
        print(f"Error sending global notification: {e}")


def send_basket_completed_notifications(basket, committer_user):
    """
    Sends personalized 100% full notifications when a basket reaches target quantity:
    - Committer receives: 'Basket Complete! Your participation is secured...'
    - All other users receive: 'Basket 100% Full — Group Discount Guaranteed!'
    """
    if not basket:
        return

    try:
        active_users = User.objects.filter(is_active=True)
        for u in active_users:
            if committer_user and u.id == committer_user.id:
                # Personalized message for the user who completed the basket
                send_user_notification(
                    user=u,
                    title="Basket Complete!",
                    message=(
                        f'Your basket "{basket.name}" is complete. '
                        f'Your participation is secured, and you will be contacted for the next details.'
                    ),
                    notification_type=Notification.NotificationType.DISCOUNT_UNLOCKED,
                    action_url='/dashboard/baskets',
                    basket=basket
                )
            else:
                # Invitation message for other users who haven't committed
                send_user_notification(
                    user=u,
                    title="Basket 100% Full — Group Discount Guaranteed!",
                    message=(
                        f'Basket "{basket.name}" has reached 100% of its target quantity. '
                        f'The group discount is now locked in. You can still join and receive the guaranteed discount.'
                    ),
                    notification_type=Notification.NotificationType.DISCOUNT_UNLOCKED,
                    action_url='/dashboard/baskets',
                    basket=basket
                )
    except Exception as e:
        print(f"Error sending basket completed notifications: {e}")


class NotificationListView(views.APIView):
    """
    GET /api/notifications/?page=1&pageSize=10&category=all
    Lists paginated notifications for the authenticated user and returns unread count.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        category = request.query_params.get('category', 'all').lower()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('pageSize', 10))

        qs = Notification.objects.filter(user=user)

        # Category filtering
        if category == 'unread':
            qs = qs.filter(is_read=False)
        elif category == 'order':
            qs = qs.filter(notification_type__in=[
                Notification.NotificationType.ORDER_CONFIRMED,
                Notification.NotificationType.ORDER_SHIPPED,
                Notification.NotificationType.ORDER_DELIVERED,
                Notification.NotificationType.DELIVERY_SCHEDULED,
            ])
        elif category == 'price':
            qs = qs.filter(notification_type=Notification.NotificationType.PRICE_ALERT)
        elif category == 'basket':
            qs = qs.filter(notification_type__in=[
                Notification.NotificationType.BASKET_OPENED,
                Notification.NotificationType.BASKET_CLOSING_SOON,
                Notification.NotificationType.BASKET_CLOSED,
                Notification.NotificationType.DISCOUNT_UNLOCKED,
            ])
        elif category == 'account':
            qs = qs.filter(notification_type__in=[
                Notification.NotificationType.ORGANIZATION_APPROVED,
                Notification.NotificationType.ORGANIZATION_REJECTED,
                Notification.NotificationType.ANNOUNCEMENT,
            ])

        total_items = qs.count()
        unread_count = Notification.objects.filter(user=user, is_read=False).count()

        start = (page - 1) * page_size
        end = start + page_size
        paginated_qs = qs[start:end]

        serializer = NotificationSerializer(paginated_qs, many=True)
        total_pages = max(1, (total_items + page_size - 1) // page_size)

        return Response({
            'success': True,
            'data': {
                'notifications': serializer.data,
                'unreadCount': unread_count,
                'page': page,
                'pageSize': page_size,
                'totalItems': total_items,
                'totalPages': total_pages,
            }
        })


class MarkNotificationReadView(views.APIView):
    """
    POST /api/notifications/<id>/read/
    Marks a single notification as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk, user=request.user)
            n.mark_as_read()
            unread_count = Notification.objects.filter(user=request.user, is_read=False).count()

            _notify_ws({
                'type': 'NOTIFICATION_READ',
                'userId': request.user.id,
                'unreadCount': unread_count,
                'notificationId': n.id,
            })

            return Response({
                'success': True,
                'unreadCount': unread_count,
                'data': NotificationSerializer(n).data,
            })
        except Notification.DoesNotExist:
            return Response({'success': False, 'error': 'Notification not found.'}, status=404)


class MarkAllNotificationsReadView(views.APIView):
    """
    POST /api/notifications/read-all/
    Marks all notifications as read for current user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        unread = Notification.objects.filter(user=request.user, is_read=False)
        unread.update(is_read=True, read_at=timezone.now())

        _notify_ws({
            'type': 'NOTIFICATION_READ_ALL',
            'userId': request.user.id,
            'unreadCount': 0,
        })

        return Response({
            'success': True,
            'message': 'All notifications marked as read.',
            'unreadCount': 0,
        })
