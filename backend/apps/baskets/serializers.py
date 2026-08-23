from rest_framework import serializers
from .models import Basket, BasketParticipant
from apps.products.models import Product, Brand


class BasketParticipantSerializer(serializers.ModelSerializer):
    userName = serializers.SerializerMethodField()
    organizationName = serializers.SerializerMethodField()

    class Meta:
        model = BasketParticipant
        fields = ['id', 'userName', 'organizationName', 'committed_quantity', 'joined_at']

    def get_userName(self, obj):
        if obj.user:
            return obj.user.email
        return ''

    def get_organizationName(self, obj):
        if obj.organization:
            return obj.organization.name
        return ''


class BasketSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    productCategory = serializers.SerializerMethodField()
    unitOfMeasure = serializers.SerializerMethodField()
    brandName = serializers.CharField(source='brand.name', read_only=True)
    durationType = serializers.CharField(source='duration_type')
    targetQuantity = serializers.IntegerField(source='target_quantity')
    currentQuantity = serializers.IntegerField(source='current_quantity')
    merkatoRetailerPrice = serializers.DecimalField(
        source='merkato_retailer_price', max_digits=10, decimal_places=2
    )
    regularMarketPrice = serializers.DecimalField(
        source='regular_market_price', max_digits=10, decimal_places=2
    )
    babiPlatformPrice = serializers.DecimalField(
        source='babi_platform_price', max_digits=10, decimal_places=2,
        allow_null=True, required=False
    )
    supplierCost = serializers.DecimalField(
        source='supplier_cost', max_digits=10, decimal_places=2,
        allow_null=True, required=False
    )
    progressPercentage = serializers.FloatField(
        source='progress_percentage', read_only=True
    )
    isTargetReached = serializers.BooleanField(
        source='is_target_reached', read_only=True
    )
    publishedAt = serializers.DateTimeField(source='published_at', read_only=True)
    closedAt = serializers.DateTimeField(source='closed_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    # Delivery fields
    deliveryDate = serializers.DateField(source='delivery_date', allow_null=True, required=False)
    carrierName = serializers.CharField(source='carrier_name', allow_blank=True, required=False)
    trackingNumber = serializers.CharField(source='tracking_number', allow_blank=True, required=False)
    deliveryNotes = serializers.CharField(source='delivery_notes', allow_blank=True, required=False)
    deliveryStatus = serializers.CharField(source='delivery_status', required=False)

    participantCount = serializers.SerializerMethodField()
    participants = BasketParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Basket
        fields = [
            'id', 'name', 'durationType', 'status',
            'productName', 'productCategory', 'unitOfMeasure', 'brandName',
            'targetQuantity', 'currentQuantity',
            'merkatoRetailerPrice', 'regularMarketPrice',
            'babiPlatformPrice', 'supplierCost',
            'progressPercentage', 'isTargetReached',
            'publishedAt', 'closedAt', 'createdAt',
            'deliveryDate', 'carrierName', 'trackingNumber', 'deliveryNotes', 'deliveryStatus',
            'participantCount', 'participants',
        ]

    def get_productCategory(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return ''

    def get_unitOfMeasure(self, obj):
        if obj.product and obj.product.unit_of_measure:
            return obj.product.unit_of_measure
        return 'units'

    def get_participantCount(self, obj):
        return obj.participants.count()


class BasketListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views (no participants detail)."""
    productName = serializers.CharField(source='product.name', read_only=True)
    productCategory = serializers.SerializerMethodField()
    unitOfMeasure = serializers.SerializerMethodField()
    brandName = serializers.CharField(source='brand.name', read_only=True)
    durationType = serializers.CharField(source='duration_type')
    targetQuantity = serializers.IntegerField(source='target_quantity')
    currentQuantity = serializers.IntegerField(source='current_quantity')
    merkatoRetailerPrice = serializers.DecimalField(
        source='merkato_retailer_price', max_digits=10, decimal_places=2
    )
    regularMarketPrice = serializers.DecimalField(
        source='regular_market_price', max_digits=10, decimal_places=2
    )
    babiPlatformPrice = serializers.DecimalField(
        source='babi_platform_price', max_digits=10, decimal_places=2,
        allow_null=True, required=False
    )
    supplierCost = serializers.DecimalField(
        source='supplier_cost', max_digits=10, decimal_places=2,
        allow_null=True, required=False
    )
    progressPercentage = serializers.FloatField(
        source='progress_percentage', read_only=True
    )
    isTargetReached = serializers.BooleanField(
        source='is_target_reached', read_only=True
    )
    publishedAt = serializers.DateTimeField(source='published_at', read_only=True)
    closedAt = serializers.DateTimeField(source='closed_at', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    # Delivery fields
    deliveryDate = serializers.DateField(source='delivery_date', allow_null=True, required=False)
    carrierName = serializers.CharField(source='carrier_name', allow_blank=True, required=False)
    trackingNumber = serializers.CharField(source='tracking_number', allow_blank=True, required=False)
    deliveryNotes = serializers.CharField(source='delivery_notes', allow_blank=True, required=False)
    deliveryStatus = serializers.CharField(source='delivery_status', required=False)

    participantCount = serializers.SerializerMethodField()
    participatingOrganizations = serializers.SerializerMethodField()

    class Meta:
        model = Basket
        fields = [
            'id', 'name', 'durationType', 'status',
            'productName', 'productCategory', 'unitOfMeasure', 'brandName',
            'targetQuantity', 'currentQuantity',
            'merkatoRetailerPrice', 'regularMarketPrice',
            'babiPlatformPrice', 'supplierCost',
            'progressPercentage', 'isTargetReached',
            'publishedAt', 'closedAt', 'createdAt',
            'deliveryDate', 'carrierName', 'trackingNumber', 'deliveryNotes', 'deliveryStatus',
            'participantCount', 'participatingOrganizations',
        ]

    def get_productCategory(self, obj):
        if obj.product and obj.product.category:
            return obj.product.category.name
        return ''

    def get_unitOfMeasure(self, obj):
        if obj.product and obj.product.unit_of_measure:
            return obj.product.unit_of_measure
        return 'units'

    def get_participantCount(self, obj):
        return obj.participants.count()

    def get_participatingOrganizations(self, obj):
        org_names = []
        for p in obj.participants.select_related('organization', 'user').all():
            name = p.organization.name if p.organization else (p.user.email if p.user else 'Anonymous')
            if name and name not in org_names:
                org_names.append(name)
        return org_names
