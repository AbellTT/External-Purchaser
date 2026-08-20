from rest_framework import serializers

from .models import Brand, Category, Product


class BrandSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    imageUrl = serializers.CharField(source='image_url', required=False, allow_blank=True)
    inStock = serializers.BooleanField(source='is_in_stock', required=False)
    stockQuantity = serializers.IntegerField(source='stock_quantity', min_value=0, required=False)
    price = serializers.DecimalField(source='direct_purchase_price', max_digits=10, decimal_places=2, coerce_to_string=False)
    regularMarketPrice = serializers.DecimalField(source='regular_market_price', max_digits=10, decimal_places=2, coerce_to_string=False)
    merkatoRetailerPrice = serializers.DecimalField(source='merkato_retailer_price', max_digits=10, decimal_places=2, coerce_to_string=False)
    babiPlatformPrice = serializers.DecimalField(source='babi_platform_price', max_digits=10, decimal_places=2, coerce_to_string=False, required=False, allow_null=True)
    supplierCost = serializers.DecimalField(source='supplier_cost', max_digits=10, decimal_places=2, coerce_to_string=False, required=False, allow_null=True)

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'imageUrl', 'inStock', 'stockQuantity', 'price',
            'regularMarketPrice', 'merkatoRetailerPrice', 'babiPlatformPrice', 'supplierCost', 'is_active'
        ]
        extra_kwargs = {'is_active': {'required': False}}


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    category = serializers.CharField(source='category.name')
    unit = serializers.CharField(source='unit_of_measure')
    inStock = serializers.SerializerMethodField()
    brands = BrandSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'unit', 'inStock', 'brands']

    def get_inStock(self, obj):
        return obj.is_available and obj.brands.filter(
            is_active=True, is_in_stock=True, stock_quantity__gt=0
        ).exists()


class CatalogProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    category = serializers.CharField(source='category.name')
    unit = serializers.CharField(source='unit_of_measure')

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'unit']


class CreateCatalogProductSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=100)
    unit = serializers.CharField(max_length=50)
    description = serializers.CharField(required=False, allow_blank=True)


class CreateBrandSerializer(BrandSerializer):
    class Meta(BrandSerializer.Meta):
        fields = [field for field in BrandSerializer.Meta.fields if field != 'id']
