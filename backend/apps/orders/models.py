from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Order(models.Model):
    """
    Represents an order placed by an organization.
    Can be part of a basket or a direct purchase.
    """
    
    class OrderType(models.TextChoices):
        BASKET = 'BASKET', 'Basket Order'
        DIRECT = 'DIRECT', 'Direct Purchase'
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING = 'PENDING', 'Pending Confirmation'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        BASKET_CLOSED = 'BASKET_CLOSED', 'Basket Closed'
        PROCUREMENT = 'PROCUREMENT', 'In Procurement'
        PACKED = 'PACKED', 'Packed'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    # Order Number
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Type and Basket Reference
    order_type = models.CharField(
        max_length=20,
        choices=OrderType.choices
    )
    basket = models.ForeignKey(
        'baskets.Basket',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Organization & Delivery Address (Nullable for Direct Purchases without full org profile)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Order Details
    delivery_address = models.ForeignKey(
        'organizations.DeliveryAddress',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Status
    status = models.CharField(
        max_length=25,
        default='pending'
    )
    
    # Pricing
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Savings (Calculated vs Merkato Retailer and vs Regular Market across all items)
    savings_vs_merkato = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    savings_vs_regular = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    estimated_savings = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Estimated savings compared to retail/last basket price"
    )
    
    # Customer/Org Contact Info snapshot
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=50, blank=True)
    customer_tin = models.CharField(max_length=50, blank=True)
    shipping_address = models.TextField(blank=True)
    
    # Notes
    customer_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    
    # Tracking
    placed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='placed_orders'
    )
    confirmed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='confirmed_orders'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['basket', 'status']),
        ]
    
    def __str__(self):
        return f"Order {self.order_number} - {self.organization.name}"
    
    def calculate_totals(self):
        """Calculate order totals based on line items."""
        items = self.items.all()
        self.subtotal = sum(item.line_total for item in items)
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount + self.delivery_fee
        return self.total_amount


class OrderItem(models.Model):
    """
    Individual line items in an order.
    """
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    
    # If from basket, reference the basket
    basket = models.ForeignKey(
        'baskets.Basket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    
    # Optional Brand reference & name snapshot
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    brand_name = models.CharField(max_length=255, blank=True)
    unit_name = models.CharField(max_length=50, blank=True, default='piece')
    
    # Supplier (Nullable for direct purchase items)
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    
    # Quantity and Pricing
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    line_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Price at time of order (for comparison)
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Original/retail price for savings calculation"
    )
    
    # Status
    is_fulfilled = models.BooleanField(default=False)
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
        ordering = ['id']
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity} - Order {self.order.order_number}"
    
    def save(self, *args, **kwargs):
        """Calculate line total before saving."""
        self.line_total = Decimal(str(self.quantity)) * self.unit_price
        super().save(*args, **kwargs)


class OrderStatusHistory(models.Model):
    """
    Track order status changes for auditing and customer updates.
    """
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    
    notes = models.TextField(blank=True)
    
    changed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_status_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_history'
        verbose_name = 'Order Status History'
        verbose_name_plural = 'Order Status Histories'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"Order {self.order.order_number}: {self.old_status} → {self.new_status}"
