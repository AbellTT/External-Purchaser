from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal


class Basket(models.Model):
    """
    Represents a procurement basket where organizations pool their orders.
    This is the core feature of the platform.
    """
    
    class BasketType(models.TextChoices):
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        SIX_MONTH = 'SIX_MONTH', 'Six Month'
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open for Orders'
        CLOSING_SOON = 'CLOSING_SOON', 'Closing Soon'
        CLOSED = 'CLOSED', 'Closed'
        PROCUREMENT = 'PROCUREMENT', 'In Procurement'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    # Basic Information
    name = models.CharField(max_length=255)
    basket_type = models.CharField(
        max_length=20,
        choices=BasketType.choices
    )
    description = models.TextField(blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    # Timeline
    opens_at = models.DateTimeField()
    closes_at = models.DateTimeField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    
    # Target and Progress
    target_participants = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        help_text="Target number of participating organizations"
    )
    current_participants = models.IntegerField(default=0)
    
    # Pricing Milestones (defined by admin)
    price_tiers = models.JSONField(
        default=list,
        help_text="List of price tiers based on quantity/participants"
    )
    # Example: [
    #   {"min_participants": 5, "discount_percent": 5},
    #   {"min_participants": 10, "discount_percent": 10},
    #   {"min_participants": 20, "discount_percent": 15}
    # ]
    
    # Totals (calculated)
    total_estimated_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_final_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        null=True,
        blank=True
    )
    
    # Admin
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_baskets'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'baskets'
        verbose_name = 'Basket'
        verbose_name_plural = 'Baskets'
        ordering = ['-opens_at']
        indexes = [
            models.Index(fields=['status', 'closes_at']),
            models.Index(fields=['basket_type', 'status']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_basket_type_display()})"
    
    def is_open(self):
        """Check if basket is currently open for orders."""
        now = timezone.now()
        return (
            self.status == self.Status.OPEN and
            self.opens_at <= now <= self.closes_at
        )
    
    def is_closing_soon(self, hours=24):
        """Check if basket is closing within specified hours."""
        if not self.is_open():
            return False
        time_remaining = self.closes_at - timezone.now()
        return time_remaining.total_seconds() <= hours * 3600
    
    def get_current_discount_tier(self):
        """Get the current applicable discount based on participants."""
        applicable_tier = None
        for tier in sorted(self.price_tiers, key=lambda x: x['min_participants']):
            if self.current_participants >= tier['min_participants']:
                applicable_tier = tier
            else:
                break
        return applicable_tier
    
    def get_next_discount_tier(self):
        """Get the next discount milestone."""
        current_discount = self.get_current_discount_tier()
        current_min = current_discount['min_participants'] if current_discount else 0
        
        for tier in sorted(self.price_tiers, key=lambda x: x['min_participants']):
            if tier['min_participants'] > current_min:
                return tier
        return None


class BasketProduct(models.Model):
    """
    Products included in a basket with basket-specific pricing.
    """
    
    basket = models.ForeignKey(
        Basket,
        on_delete=models.CASCADE,
        related_name='basket_products'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='basket_products'
    )
    
    # Supplier (selected for this basket)
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.PROTECT,
        related_name='basket_products'
    )
    
    # Base Pricing
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Current Estimated Price (changes as basket fills)
    current_estimated_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Final Locked Price (set when basket closes)
    final_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Quantity Tracking
    total_quantity_ordered = models.IntegerField(default=0)
    minimum_basket_quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Minimum total quantity for this product in the basket"
    )
    
    # Status
    is_available = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'basket_products'
        verbose_name = 'Basket Product'
        verbose_name_plural = 'Basket Products'
        unique_together = ['basket', 'product']
        ordering = ['product__name']
    
    def __str__(self):
        return f"{self.product.name} in {self.basket.name}"
    
    def calculate_estimated_price(self):
        """Calculate estimated price based on current basket progress."""
        discount_tier = self.basket.get_current_discount_tier()
        if discount_tier:
            discount_percent = discount_tier.get('discount_percent', 0)
            discount_multiplier = Decimal('1.00') - (Decimal(str(discount_percent)) / Decimal('100'))
            return self.base_price * discount_multiplier
        return self.base_price


class BasketParticipant(models.Model):
    """
    Track which organizations are participating in a basket.
    """
    
    basket = models.ForeignKey(
        Basket,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='basket_participations'
    )
    
    # Participation Details
    joined_at = models.DateTimeField(auto_now_add=True)
    has_placed_order = models.BooleanField(default=False)
    
    # Order Summary
    total_order_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_items = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'basket_participants'
        verbose_name = 'Basket Participant'
        verbose_name_plural = 'Basket Participants'
        unique_together = ['basket', 'organization']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.organization.name} in {self.basket.name}"
