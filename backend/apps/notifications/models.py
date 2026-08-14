from django.db import models
from django.utils import timezone


class Notification(models.Model):
    """
    User notifications for important events.
    """
    
    class NotificationType(models.TextChoices):
        BASKET_OPENED = 'BASKET_OPENED', 'Basket Opened'
        BASKET_CLOSING_SOON = 'BASKET_CLOSING_SOON', 'Basket Closing Soon'
        BASKET_CLOSED = 'BASKET_CLOSED', 'Basket Closed'
        DISCOUNT_UNLOCKED = 'DISCOUNT_UNLOCKED', 'New Discount Unlocked'
        ORDER_CONFIRMED = 'ORDER_CONFIRMED', 'Order Confirmed'
        ORDER_SHIPPED = 'ORDER_SHIPPED', 'Order Shipped'
        ORDER_DELIVERED = 'ORDER_DELIVERED', 'Order Delivered'
        DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED', 'Delivery Scheduled'
        PRICE_ALERT = 'PRICE_ALERT', 'Price Alert'
        ORGANIZATION_APPROVED = 'ORGANIZATION_APPROVED', 'Organization Approved'
        ORGANIZATION_REJECTED = 'ORGANIZATION_REJECTED', 'Organization Rejected'
        ANNOUNCEMENT = 'ANNOUNCEMENT', 'General Announcement'
    
    # Recipient
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Notification Details
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related Objects (optional references)
    basket = models.ForeignKey(
        'baskets.Basket',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    delivery = models.ForeignKey(
        'deliveries.Delivery',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    # Action URL (for deep linking in frontend)
    action_url = models.CharField(max_length=500, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery Status
    is_sent = models.BooleanField(default=True)
    sent_via_email = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['organization', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class Announcement(models.Model):
    """
    Platform-wide or organization-specific announcements.
    """
    
    class AnnouncementType(models.TextChoices):
        INFO = 'INFO', 'Information'
        SUCCESS = 'SUCCESS', 'Success'
        WARNING = 'WARNING', 'Warning'
        ERROR = 'ERROR', 'Error'
    
    class TargetAudience(models.TextChoices):
        ALL = 'ALL', 'All Users'
        ORGANIZATIONS = 'ORGANIZATIONS', 'All Organizations'
        ADMINS = 'ADMINS', 'Administrators Only'
        SPECIFIC_ORG = 'SPECIFIC_ORG', 'Specific Organization'
    
    # Content
    title = models.CharField(max_length=255)
    content = models.TextField()
    announcement_type = models.CharField(
        max_length=20,
        choices=AnnouncementType.choices,
        default=AnnouncementType.INFO
    )
    
    # Targeting
    target_audience = models.CharField(
        max_length=20,
        choices=TargetAudience.choices,
        default=TargetAudience.ALL
    )
    target_organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcements'
    )
    
    # Display
    is_pinned = models.BooleanField(default=False)
    show_banner = models.BooleanField(
        default=False,
        help_text="Show as banner on dashboard"
    )
    
    # Validity Period
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Tracking
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_announcements'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'announcements'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title
    
    def is_currently_valid(self):
        """Check if announcement is currently valid."""
        if not self.is_active:
            return False
        
        now = timezone.now()
        if now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        
        return True


class EmailLog(models.Model):
    """
    Log of emails sent by the system for tracking and debugging.
    """
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SENT = 'SENT', 'Sent'
        FAILED = 'FAILED', 'Failed'
        BOUNCED = 'BOUNCED', 'Bounced'
    
    # Recipient
    recipient_email = models.EmailField()
    recipient_user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_logs'
    )
    
    # Email Details
    subject = models.CharField(max_length=255)
    body = models.TextField()
    email_type = models.CharField(max_length=50)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'email_logs'
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_email', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Email to {self.recipient_email}: {self.subject}"
