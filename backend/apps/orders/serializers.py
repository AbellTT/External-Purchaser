from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from apps.products.models import Product, Brand


class OrderItemSerializer(serializers.ModelSerializer):
    productName = serializers.CharField(source='product.name', read_only=True)
    brandName = serializers.SerializerMethodField()
    unit = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2)
    subtotal = serializers.DecimalField(source='line_total', max_digits=12, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'productName', 'brandName', 'quantity', 'unit', 'price', 'subtotal'
        ]

    def get_brandName(self, obj):
        if obj.brand_name:
            return obj.brand_name
        if obj.brand:
            return obj.brand.name
        return 'Standard'

    def get_unit(self, obj):
        if obj.unit_name:
            return obj.unit_name
        if obj.product and obj.product.unit_of_measure:
            return obj.product.unit_of_measure
        return 'piece'


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)
    orderNumber = serializers.CharField(source='order_number', read_only=True)
    date = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    pricing = serializers.SerializerMethodField()
    delivery = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'orderNumber', 'date', 'status', 'items', 'pricing', 'delivery',
            'savings', 'customer', 'customer_notes'
        ]

    def get_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y')

    def get_pricing(self, obj):
        return {
            'itemsTotal': float(obj.subtotal),
            'deliveryFee': float(obj.delivery_fee),
            'discount': float(obj.discount_amount),
            'total': float(obj.total_amount),
        }

    def get_delivery(self, obj):
        address_str = obj.shipping_address
        if not address_str and obj.delivery_address:
            address_str = f"{obj.delivery_address.street_address}, {obj.delivery_address.city}"
        if not address_str and obj.organization and obj.organization.address_formatted:
            address_str = obj.organization.address_formatted
        if not address_str:
            address_str = "Main Office, Addis Ababa"

        return {
            'address': address_str,
            'estimatedDate': obj.confirmed_at.strftime('%b %d, %Y') if obj.confirmed_at else 'Pending dispatch',
            'actualDate': obj.delivered_at.strftime('%b %d, %Y') if obj.delivered_at else None,
        }

    def get_savings(self, obj):
        merkato_amount = float(obj.savings_vs_merkato)
        regular_amount = float(obj.savings_vs_regular)
        total = float(obj.total_amount) or 1.0

        return {
            'vsMerkatoRetailer': {
                'amount': merkato_amount,
                'percentage': round((merkato_amount / (total + merkato_amount)) * 100, 1) if merkato_amount > 0 else 0,
            },
            'vsRegularStationaryMarket': {
                'amount': regular_amount,
                'percentage': round((regular_amount / (total + regular_amount)) * 100, 1) if regular_amount > 0 else 0,
            },
        }

    def get_customer(self, obj):
        name = obj.customer_name
        phone = obj.customer_phone
        tin = obj.customer_tin

        if obj.organization:
            if not name:
                name = obj.organization.name
            if not phone:
                phone = obj.organization.phone_number
            if not tin:
                tin = obj.organization.tin_number

        if not name and obj.placed_by:
            name = obj.placed_by.email
        if not name:
            name = "Institutional Buyer"

        return {
            'name': name,
            'organization': obj.organization.name if obj.organization else name,
            'phoneNumber': phone or '0911234567',
            'tinNumber': tin or '1234567890',
            'address': self.get_delivery(obj)['address'],
        }


class CreateOrderItemInputSerializer(serializers.Serializer):
    productId = serializers.CharField()
    brandId = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class CreateOrderRequestSerializer(serializers.Serializer):
    items = CreateOrderItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)
