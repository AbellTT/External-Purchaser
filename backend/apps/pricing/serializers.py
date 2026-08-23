from rest_framework import serializers
from .models import BiMonthlyMarketData, WeeklySpotPrice, FinancialLossAnalysis, ProcurementGuidance


class BiMonthlyMarketDataSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    brandName = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    minAveragePrice = serializers.DecimalField(source='min_average_price', max_digits=10, decimal_places=2)
    maxAveragePrice = serializers.DecimalField(source='max_average_price', max_digits=10, decimal_places=2)
    minWeeklyIncrease = serializers.DecimalField(source='min_weekly_increase', max_digits=10, decimal_places=2)
    maxWeeklyIncrease = serializers.DecimalField(source='max_weekly_increase', max_digits=10, decimal_places=2)
    minWeeklyDiscount = serializers.DecimalField(source='min_weekly_discount', max_digits=10, decimal_places=2)
    maxWeeklyDiscount = serializers.DecimalField(source='max_weekly_discount', max_digits=10, decimal_places=2)

    class Meta:
        model = BiMonthlyMarketData
        fields = [
            'id', 'product', 'productName', 'brand', 'brandName', 'year', 'period',
            'minAveragePrice', 'maxAveragePrice',
            'minWeeklyIncrease', 'maxWeeklyIncrease',
            'minWeeklyDiscount', 'maxWeeklyDiscount',
            'updated_at',
        ]


class WeeklySpotPriceSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    brandName = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    weekNumber = serializers.IntegerField(source='week_number')
    weekLabel = serializers.CharField(source='week_label')
    directPurchasePrice = serializers.DecimalField(source='direct_purchase_price', max_digits=10, decimal_places=2, allow_null=True)

    class Meta:
        model = WeeklySpotPrice
        fields = [
            'id', 'product', 'productName', 'brand', 'brandName',
            'year', 'month', 'weekNumber', 'weekLabel',
            'directPurchasePrice', 'recorded_at',
        ]


class FinancialLossAnalysisSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    brandName = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    peakSurgePrice = serializers.DecimalField(source='peak_surge_price', max_digits=10, decimal_places=2)
    discountedOptimalPrice = serializers.DecimalField(source='discounted_optimal_price', max_digits=10, decimal_places=2)
    singleCompanyLoss = serializers.DecimalField(source='single_company_loss', max_digits=12, decimal_places=2)
    aggregate500CompaniesLoss = serializers.DecimalField(source='aggregate_500_companies_loss', max_digits=14, decimal_places=2)

    class Meta:
        model = FinancialLossAnalysis
        fields = [
            'id', 'product', 'productName', 'brand', 'brandName',
            'basePrice', 'peakSurgePrice', 'discountedOptimalPrice',
            'singleCompanyLoss', 'aggregate500CompaniesLoss',
            'updated_at',
        ]


class ProcurementGuidanceSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    brandName = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    firstBestSeason = serializers.CharField(source='first_best_season')
    secondBestSeason = serializers.CharField(source='second_best_season')
    thirdBestSeason = serializers.CharField(source='third_best_season')
    seasonalBuyingGuideNotes = serializers.CharField(source='seasonal_buying_guide_notes', allow_blank=True)
    recommendationSummary = serializers.CharField(source='recommendation_summary', allow_blank=True)

    class Meta:
        model = ProcurementGuidance
        fields = [
            'id', 'product', 'productName', 'brand', 'brandName',
            'firstBestSeason', 'secondBestSeason', 'thirdBestSeason',
            'seasonalBuyingGuideNotes', 'recommendationSummary',
            'updated_at',
        ]
