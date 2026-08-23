from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone


class BiMonthlyMarketData(models.Model):
    """
    Bi-Monthly historical market pricing ranges for 6 periods per year:
    - Sept - Oct
    - Nov - Dec
    - Jan - Feb
    - Mar - Apr
    - May - Jun
    - Jul - Aug
    """
    PERIOD_CHOICES = [
        ('Sept - Oct', 'Sept - Oct'),
        ('Nov - Dec', 'Nov - Dec'),
        ('Jan - Feb', 'Jan - Feb'),
        ('Mar - Apr', 'Mar - Apr'),
        ('May - Jun', 'May - Jun'),
        ('Jul - Aug', 'Jul - Aug'),
    ]

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='bi_monthly_data'
    )
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='bi_monthly_data'
    )
    year = models.IntegerField(db_index=True, help_text="Calendar year e.g. 2026")
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)

    # Average Price Range (min -> max)
    min_average_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_average_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Weekly Increase Range (min -> max)
    min_weekly_increase = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0.0, validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_weekly_increase = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0.0, validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Weekly Discount Range (min -> max)
    min_weekly_discount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0.0, validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_weekly_discount = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0.0, validators=[MinValueValidator(Decimal('0.00'))]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bi_monthly_market_data'
        verbose_name = 'Bi-Monthly Market Data'
        verbose_name_plural = 'Bi-Monthly Market Data'
        unique_together = ['product', 'brand', 'year', 'period']
        ordering = ['year', 'period']

    def __str__(self):
        brand_name = self.brand.name if self.brand else 'All Brands'
        return f"{self.product.name} ({brand_name}) - {self.year} {self.period}"


class WeeklySpotPrice(models.Model):
    """
    Current month's weekly spot prices for a product and brand.
    Directly synchronized with Brand.babi_platform_price (Direct Purchase Price).
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='weekly_spot_prices'
    )
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='weekly_spot_prices'
    )
    year = models.IntegerField(db_index=True)
    month = models.IntegerField(db_index=True, help_text="Month number 1-12")
    week_number = models.IntegerField(help_text="Week number 1 to 5")
    week_label = models.CharField(max_length=20, help_text="e.g. Aug W1")

    direct_purchase_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    recorded_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'weekly_spot_prices'
        verbose_name = 'Weekly Spot Price'
        verbose_name_plural = 'Weekly Spot Prices'
        unique_together = ['product', 'brand', 'year', 'month', 'week_number']
        ordering = ['year', 'month', 'week_number']

    def __str__(self):
        brand_name = self.brand.name if self.brand else 'All Brands'
        return f"{self.product.name} ({brand_name}) - {self.week_label}: ETB {self.direct_purchase_price}"


class FinancialLossAnalysis(models.Model):
    """
    Financial loss analysis data for 500 companies comparison per product/brand.
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='financial_loss_analyses'
    )
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='financial_loss_analyses'
    )

    base_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    peak_surge_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    discounted_optimal_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    single_company_loss = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    aggregate_500_companies_loss = models.DecimalField(
        max_digits=14, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'financial_loss_analysis'
        verbose_name = 'Financial Loss Analysis'
        verbose_name_plural = 'Financial Loss Analyses'
        unique_together = ['product', 'brand']

    def __str__(self):
        brand_name = self.brand.name if self.brand else 'All Brands'
        return f"Loss Analysis: {self.product.name} ({brand_name}) - Annual Loss ETB {self.single_company_loss}"


class ProcurementGuidance(models.Model):
    """
    Admin guidance & procurement calendar recommendations for a product/brand.
    Can exist even if bi-monthly historical data is missing.
    """
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='procurement_guidances'
    )
    brand = models.ForeignKey(
        'products.Brand',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='procurement_guidances'
    )

    first_best_season = models.CharField(max_length=50, default='Sept - Oct')
    second_best_season = models.CharField(max_length=50, default='May - Jun')
    third_best_season = models.CharField(max_length=50, default='Jan - Feb')

    seasonal_buying_guide_notes = models.TextField(
        blank=True,
        help_text="Detailed guidance text for seasonal procurement"
    )
    recommendation_summary = models.TextField(
        blank=True,
        help_text="General recommendation text for procurement officers"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'procurement_guidance'
        verbose_name = 'Procurement Guidance'
        verbose_name_plural = 'Procurement Guidance'
        unique_together = ['product', 'brand']

    def __str__(self):
        brand_name = self.brand.name if self.brand else 'All Brands'
        return f"Procurement Guidance: {self.product.name} ({brand_name})"
