from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'category',
            'title',
            'message',
            'action_url',
            'is_read',
            'read_at',
            'created_at',
        ]

    def get_category(self, obj):
        nt = obj.notification_type
        if 'ORDER' in nt or 'DELIVERY' in nt:
            return 'order'
        elif 'PRICE' in nt:
            return 'price'
        elif 'BASKET' in nt or 'DISCOUNT' in nt:
            return 'basket'
        elif 'ORGANIZATION' in nt or 'WELCOME' in nt or 'ANNOUNCEMENT' in nt:
            return 'account'
        return 'general'
