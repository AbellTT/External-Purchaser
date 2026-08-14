from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone


class PriceHistory(models.Model):
    """
    Historical pricing data for products.
    This is crucial for the "2-year price history" and market intelligence features.
    """
    
    class PriceType(models.TextChoices):
        WHOLESALE = 'WHOLESALE', 'Wholesale Price'
        RETAIL = 'RETAIL', 'Retail Price'
        BASKET = 'BASKET', 'Basket Price'
        DIRECT = 'DIRECT', 'Direct Purchase Price'
        MARKET_SURVEY = 'MARKET_SURVEY', 'Market Survey Price'
    
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='price_history'
    )
    
    # Price Details
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    price_type = models.CharField(
        max_length=20,
        choices=PriceType.choices
    )
    
    # Source
    supplier = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='price_history'
    )
    basket = models.ForeignKey(
        'baskets.Basket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='price_history'
    )
    
    # Date
    effective_date = models.DateField(db_index=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    # Additional Context
    quantity = models.IntegerField(
        null=True,
        blank=True,
        help_text="Quantity at which this price was available"
    )
    notes = models.TextField(blank=True)
    
    # Tracking
    recorded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_prices'
    )
    
    class Meta:
        db_table = 'price_history'
        verbose_name = 'Price History'
        verbose_name_plural = 'Price Histories'
        ordering = ['-effective_date', '-recorded_at']
        indexes = [
            models.Index(fields=['product', 'effective_date']),
            models.Index(fields=['product', 'price_type', 'effective_date']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - ETB {self.price} on {self.effective_date}"


class PriceAnalytics(models.Model):
    """
    Pre-computed price analytics for faster queries.
    Generated periodically (daily/weekly) for dashboard performance.
    """
    
    class Period(models.TextChoices):
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        QUARTERLY = 'QUARTERLY', 'Quarterly'
        YEARLY = 'YEARLY', 'Yearly'
    
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='price_analytics'
    )
    
    # Period
    period_type = models.CharField(
        max_length=20,
        choices=Period.choices
    )
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Statistics
    min_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    avg_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    median_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Price Movement
    price_change = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Change from previous period"
    )
    price_change_percent = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Percentage change from previous period"
    )
    
    # Volatility
    price_volatility = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Standard deviation of prices in this period"
    )
    
    # Data Points
    data_points_count = models.IntegerField(default=0)
    
    # Timestamps
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'price_analytics'
        verbose_name = 'Price Analytics'
        verbose_name_plural = 'Price Analytics'
        unique_together = ['product', 'period_type', 'period_start']
        ordering = ['-period_start']
        indexes = [
            models.Index(fields=['product', 'period_type', 'period_start']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.period_type} {self.period_start}"


class PriceTrend(models.Model):
    """
    Identified price trends and seasonal patterns.
    Used for the "Market Intelligence" feature.
    """
    
    class TrendType(models.TextChoices):
        SEASONAL_HIGH = 'SEASONAL_HIGH', 'Seasonal High'
        SEASONAL_LOW = 'SEASONAL_LOW', 'Seasonal Low'
        UPWARD_TREND = 'UPWARD_TREND', 'Upward Trend'
        DOWNWARD_TREND = 'DOWNWARD_TREND', 'Downward Trend'
        STABLE = 'STABLE', 'Stable'
        VOLATILE = 'VOLATILE', 'Volatile'
    
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='price_trends'
    )
    
    # Trend Details
    trend_type = models.CharField(
        max_length=20,
        choices=TrendType.choices
    )
    
    # Time Period
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Description
    description = models.TextField(
        help_text="Human-readable description of the trend"
    )
    confidence_score = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Confidence in this trend (0-100)"
    )
    
    # Supporting Data
    supporting_data = models.JSONField(
        default=dict,
        help_text="Additional data supporting this trend"
    )
    
    # Timestamps
    identified_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'price_trends'
        verbose_name = 'Price Trend'
        verbose_name_plural = 'Price Trends'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.product.name} - {self.get_trend_type_display()}"


class MarketInsight(models.Model):
    """
    Market insights and recommendations for procurement officers.
    Examples: "Prices typically rise before school year", "Best time to buy is..."
    """
    
    class InsightType(models.TextChoices):
        SEASONAL = 'SEASONAL', 'Seasonal Pattern'
        BEST_TIME_TO_BUY = 'BEST_TIME_TO_BUY', 'Best Time to Buy'
        PRICE_ALERT = 'PRICE_ALERT', 'Price Alert'
        SAVINGS_OPPORTUNITY = 'SAVINGS_OPPORTUNITY', 'Savings Opportunity'
        GENERAL = 'GENERAL', 'General Insight'
    
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='market_insights'
    )
    category = models.ForeignKey(
        'products.Category',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='market_insights'
    )
    
    # Insight Details
    insight_type = models.CharField(
        max_length=30,
        choices=InsightType.choices
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Actionable Recommendation
    recommendation = models.TextField(blank=True)
    
    # Relevance
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(
        default=0,
        help_text="Higher number = higher priority"
    )
    
    # Valid Period
    valid_from = models.DateField(null=True, blank=True)
    valid_until = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'market_insights'
        verbose_name = 'Market Insight'
        verbose_name_plural = 'Market Insights'
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.title
    
    def is_currently_valid(self):
        """Check if insight is currently valid."""
        if not self.is_active:
            return False
        
        today = timezone.now().date()
        if self.valid_from and today < self.valid_from:
            return False
        if self.valid_until and today > self.valid_until:
            return False
        
        return True
