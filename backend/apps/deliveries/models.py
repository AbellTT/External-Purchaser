from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Delivery(models.Model):
    """
    Represents a delivery for one or more orders.
    Orders from the same basket to nearby organizations may be grouped.
    """
    
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    # Delivery Number
    delivery_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Related Basket (if applicable)
    basket = models.ForeignKey(
        'baskets.Basket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deliveries'
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )
    
    # Schedule
    scheduled_date = models.DateField()
    scheduled_time_slot = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g., '9:00 AM - 12:00 PM'"
    )
    actual_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_time = models.TimeField(null=True, blank=True)
    
    # Driver Assignment (Future feature)
    driver = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'DELIVERY_STAFF'},
        related_name='deliveries'
    )
    vehicle_info = models.CharField(max_length=255, blank=True)
    
    # Delivery Route (for optimization)
    route_order = models.IntegerField(
        default=0,
        help_text="Order in the delivery route"
    )
    estimated_distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Notes
    delivery_instructions = models.TextField(blank=True)
    delivery_notes = models.TextField(blank=True)
    
    # Proof of Delivery
    received_by_name = models.CharField(max_length=200, blank=True)
    received_by_signature = models.ImageField(
        upload_to='delivery_signatures/',
        null=True,
        blank=True
    )
    delivery_photo = models.ImageField(
        upload_to='delivery_photos/',
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'deliveries'
        verbose_name = 'Delivery'
        verbose_name_plural = 'Deliveries'
        ordering = ['-scheduled_date', 'route_order']
        indexes = [
            models.Index(fields=['delivery_number']),
            models.Index(fields=['status', 'scheduled_date']),
        ]
    
    def __str__(self):
        return f"Delivery {self.delivery_number}"


class DeliveryOrder(models.Model):
    """
    Links deliveries to orders (many-to-many with additional data).
    """
    
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='delivery_orders'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='delivery_orders'
    )
    
    # Delivery Status for this specific order
    is_delivered = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Issues
    has_issues = models.BooleanField(default=False)
    issue_description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'delivery_orders'
        verbose_name = 'Delivery Order'
        verbose_name_plural = 'Delivery Orders'
        unique_together = ['delivery', 'order']
    
    def __str__(self):
        return f"Delivery {self.delivery.delivery_number} - Order {self.order.order_number}"


class DeliveryStatusHistory(models.Model):
    """
    Track delivery status changes.
    """
    
    delivery = models.ForeignKey(
        Delivery,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    
    changed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='delivery_status_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_status_history'
        verbose_name = 'Delivery Status History'
        verbose_name_plural = 'Delivery Status Histories'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"Delivery {self.delivery.delivery_number}: {self.old_status} → {self.new_status}"
