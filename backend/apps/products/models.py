from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Category(models.Model):
    """
    Product categories for organizational hierarchy.
    """
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    # Display
    icon = models.CharField(max_length=50, blank=True)  # Icon name or emoji
    display_order = models.IntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Represents stationery products available for procurement.
    """
    
    # Basic Information
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True)  # Stock Keeping Unit
    description = models.TextField()
    
    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products'
    )
    
    # Specifications
    brand = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    specifications = models.JSONField(default=dict, blank=True)  # Flexible product specs
    
    # Packaging & Units
    unit_of_measure = models.CharField(
        max_length=50,
        help_text="e.g., piece, ream, box, carton, dozen"
    )
    units_per_package = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of units in one package"
    )
    package_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g., box of 12, ream of 500 sheets"
    )
    
    # Wholesale Requirements
    minimum_order_quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Minimum quantity that can be ordered"
    )
    
    # Images
    primary_image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    # Availability
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku', 'is_available']),
            models.Index(fields=['category', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductImage(models.Model):
    """
    Additional images for products.
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='additional_images'
    )
    image = models.ImageField(upload_to='products/')
    caption = models.CharField(max_length=255, blank=True)
    display_order = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['display_order', 'id']
    
    def __str__(self):
        return f"Image for {self.product.name}"


class ProductAvailability(models.Model):
    """
    Track product availability over time.
    Used for showing out-of-stock periods in price history.
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='availability_history'
    )
    
    is_available = models.BooleanField()
    reason = models.TextField(blank=True)  # Reason for unavailability
    
    # Time Period
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_availability'
        verbose_name = 'Product Availability'
        verbose_name_plural = 'Product Availability Records'
        ordering = ['-start_date']
    
    def __str__(self):
        status = "Available" if self.is_available else "Unavailable"
        return f"{self.product.name} - {status} from {self.start_date}"
