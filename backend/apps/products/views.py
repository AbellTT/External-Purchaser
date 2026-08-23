from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils.text import slugify

from rest_framework import status, views
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import Brand, Category, Product
from .serializers import (
    BrandSerializer, CatalogProductSerializer, CreateBrandSerializer,
    CreateCatalogProductSerializer, ProductSerializer,
)


def _unique_value(model, field, value):
    candidate, index = value, 2
    while model.objects.filter(**{field: candidate}).exists():
        candidate = f'{value}-{index}'
        index += 1
    return candidate



class ProductListView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('search', '').strip()
        category = request.query_params.get('category', '').strip()
        include_unavailable = request.query_params.get('includeUnavailable') == 'true'
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 12)), 1), 100)

        products = Product.objects.select_related('category').prefetch_related('brands').filter(is_available=True)
        if query:
            products = products.filter(
                Q(name__icontains=query) | Q(category__name__icontains=query) |
                Q(brands__name__icontains=query)
            ).distinct()
        if category:
            products = products.filter(category__name__iexact=category)
        if not include_unavailable:
            products = products.filter(brands__is_active=True, brands__is_in_stock=True, brands__stock_quantity__gt=0).distinct()

        total = products.count()
        start = (page - 1) * page_size
        serialized = ProductSerializer(products[start:start + page_size], many=True)
        return Response({'success': True, 'data': {'products': serialized.data, 'pagination': {
            'page': page, 'pageSize': page_size, 'total': total,
            'totalPages': max((total + page_size - 1) // page_size, 1)
        }}})


class CatalogProductListView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        products = Product.objects.select_related('category').all()
        return Response({'success': True, 'data': CatalogProductSerializer(products, many=True).data})

    def post(self, request):
        serializer = CreateCatalogProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        category_slug = slugify(data['category'])
        category, _ = Category.objects.get_or_create(
            slug=category_slug,
            defaults={'name': data['category'].strip()}
        )
        slug = _unique_value(Product, 'slug', slugify(data['name']))
        product = Product.objects.create(
            name=data['name'].strip(), slug=slug,
            sku=_unique_value(Product, 'sku', f'CAT-{slug.upper()}'),
            description=data.get('description', ''), category=category,
            unit_of_measure=data['unit'].strip(), is_available=True,
        )
        return Response({'success': True, 'data': CatalogProductSerializer(product).data}, status=status.HTTP_201_CREATED)


class CatalogProductDetailView(views.APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, product_id):
        product = Product.objects.select_related('category').filter(pk=product_id).first()
        if not product:
            return Response({'success': False, 'error': 'Product was not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CreateCatalogProductSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if 'name' in data:
            product.name = data['name'].strip()
        if 'unit' in data:
            product.unit_of_measure = data['unit'].strip()
        if 'description' in data:
            product.description = data['description']
        if 'category' in data:
            category_name = data['category'].strip()
            category, _ = Category.objects.get_or_create(
                slug=slugify(category_name), defaults={'name': category_name}
            )
            product.category = category
        product.save()
        return Response({'success': True, 'data': CatalogProductSerializer(product).data})


class ProductBrandListView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, product_id):
        product = Product.objects.filter(pk=product_id).first()
        if not product:
            return Response({'success': False, 'error': 'Product was not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CreateBrandSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            brand = serializer.save(product=product)
        except IntegrityError:
            return Response({'success': False, 'error': 'This brand already exists for the selected product.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'success': True, 'data': BrandSerializer(brand).data}, status=status.HTTP_201_CREATED)


class BrandDetailView(views.APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, brand_id):
        brand = Brand.objects.filter(pk=brand_id).first()
        if not brand:
            return Response({'success': False, 'error': 'Brand was not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BrandSerializer(brand, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'data': serializer.data})

    def delete(self, request, brand_id):
        brand = Brand.objects.filter(pk=brand_id).first()
        if not brand:
            return Response({'success': False, 'error': 'Brand was not found.'}, status=status.HTTP_404_NOT_FOUND)
        brand.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
