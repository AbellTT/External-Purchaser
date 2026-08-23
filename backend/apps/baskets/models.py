from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal


class Basket(models.Model):
    """
    Represents a procurement basket where organizations pool their orders.
    The admin creates a basket for a specific product+brand with a target quantity.
    Users commit quantity until the target is reached, then admin fulfills it.
    """

    class DurationType(models.TextChoices):
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        SIX_MONTH = 'SIX_MONTH', 'Six Month'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    # Basic Information
    name = models.CharField(max_length=255)
    duration_type = models.CharField(
        max_length=20,
        choices=DurationType.choices,
        default=DurationType.WEEKLY,
    )

    # Linked product & brand (admin selects from catalog)
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='baskets',
    )
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.PROTECT,
        related_name='baskets',
    )

    # Benchmark prices (auto-filled from brand catalog at creation time)
    merkato_retailer_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Auto-filled from brand catalog',
    )
    regular_market_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Auto-filled from brand catalog',
    )

    # Target & pooled progress
    target_quantity = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1)],
        help_text='Target commitment quantity to trigger fulfillment',
    )
    current_quantity = models.PositiveIntegerField(
        default=0,
        help_text='Total committed quantity by all participants',
    )

    # Fulfillment prices (set by admin when closing/fulfilling)
    babi_platform_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Price given to participants after fulfillment',
    )
    supplier_cost = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Wholesale cost from supplier',
    )

    # Status & Lock Flag
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    is_full_notification_sent = models.BooleanField(
        default=False,
        help_text='Flag to prevent duplicate 100% full notifications for this basket'
    )

    # Admin
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_baskets',
    )

    # Timestamps
    published_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Delivery & Logistics Details (for completed baskets)
    delivery_date = models.DateField(null=True, blank=True)
    carrier_name = models.CharField(max_length=100, blank=True, default='')
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    delivery_notes = models.TextField(blank=True, default='')
    delivery_status = models.CharField(
        max_length=50,
        default='PENDING',
        choices=[
            ('PENDING', 'Pending Logistics'),
            ('SCHEDULED', 'Scheduled for Dispatch'),
            ('IN_TRANSIT', 'In Transit'),
            ('DELIVERED', 'Delivered'),
        ]
    )

    class Meta:
        db_table = 'baskets'
        verbose_name = 'Basket'
        verbose_name_plural = 'Baskets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['duration_type', 'status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_duration_type_display()})"

    @property
    def progress_percentage(self):
        if self.target_quantity == 0:
            return 0
        return min(round((self.current_quantity / self.target_quantity) * 100, 1), 100)

    @property
    def is_target_reached(self):
        return self.current_quantity >= self.target_quantity


class BasketParticipant(models.Model):
    """
    Track which users/organizations committed quantity to a basket.
    """

    basket = models.ForeignKey(
        Basket,
        on_delete=models.CASCADE,
        related_name='participants',
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='basket_participations',
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='basket_participations',
    )

    committed_quantity = models.PositiveIntegerField(default=0)

    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'basket_participants'
        verbose_name = 'Basket Participant'
        verbose_name_plural = 'Basket Participants'
        unique_together = ['basket', 'user']
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.user.email} committed {self.committed_quantity} in {self.basket.name}"
