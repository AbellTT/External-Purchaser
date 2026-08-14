from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Supplier(models.Model):
    """
    Represents wholesale suppliers (primarily from Merkato).
    """
    
    class SupplierType(models.TextChoices):
        WHOLESALER = 'WHOLESALER', 'Wholesaler'
        MANUFACTURER = 'MANUFACTURER', 'Manufacturer'
        DISTRIBUTOR = 'DISTRIBUTOR', 'Distributor'
    
    # Basic Information
    name = models.CharField(max_length=255, db_index=True)
    supplier_type = models.CharField(
        max_length=20,
        choices=SupplierType.choices,
        default=SupplierType.WHOLESALER
    )
    business_license = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=100, blank=True)
    
    # Contact Information
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20)
    alternative_phone = models.CharField(max_length=20, blank=True)
    
    # Location
    address = models.TextField()
    merkato_location = models.CharField(max_length=255, blank=True)  # Specific Merkato area
    city = models.CharField(max_length=100, default='Addis Ababa')
    
    # Banking Information
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=100, blank=True)
    account_holder_name = models.CharField(max_length=200, blank=True)
    
    # Performance Tracking
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_orders = models.IntegerField(default=0)
    successful_deliveries = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suppliers'
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def calculate_rating(self):
        """Calculate supplier rating based on performance."""
        if self.total_orders > 0:
            return (self.successful_deliveries / self.total_orders) * 5
        return None


class SupplierContact(models.Model):
    """
    Contact persons at supplier companies.
    """
    
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='contacts'
    )
    
    # Contact Information
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    
    # Status
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supplier_contacts'
        verbose_name = 'Supplier Contact'
        verbose_name_plural = 'Supplier Contacts'
        ordering = ['-is_primary', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.supplier.name}"


class SupplierProduct(models.Model):
    """
    Mapping between suppliers and products with supplier-specific pricing.
    """
    
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='supplier_products'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='supplier_products'
    )
    
    # Supplier-Specific Information
    supplier_sku = models.CharField(max_length=100, blank=True)  # Supplier's product code
    supplier_product_name = models.CharField(max_length=255, blank=True)
    
    # Current Pricing
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Minimum Order
    minimum_order_quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    
    # Lead Time
    lead_time_days = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text="Number of days needed to fulfill order"
    )
    
    # Availability
    is_available = models.BooleanField(default=True)
    last_supplied_date = models.DateField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_preferred = models.BooleanField(
        default=False,
        help_text="Preferred supplier for this product"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'supplier_products'
        verbose_name = 'Supplier Product'
        verbose_name_plural = 'Supplier Products'
        unique_together = ['supplier', 'product']
        ordering = ['-is_preferred', 'unit_price']
    
    def __str__(self):
        return f"{self.supplier.name} - {self.product.name}"
