from django.urls import path

from .views import BrandDetailView, CatalogProductDetailView, CatalogProductListView, ProductBrandListView, ProductListView

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('catalog-options', CatalogProductListView.as_view(), name='catalog-product-list'),
    path('catalog-options/<int:product_id>', CatalogProductDetailView.as_view(), name='catalog-product-detail'),
    path('<int:product_id>/brands', ProductBrandListView.as_view(), name='product-brand-list'),
    path('brands/<int:brand_id>', BrandDetailView.as_view(), name='brand-detail'),
]
