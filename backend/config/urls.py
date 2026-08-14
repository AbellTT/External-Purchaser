"""
URL configuration for babi procurement platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App URLs
    path('api/users/', include('apps.users.urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/suppliers/', include('apps.suppliers.urls')),
    path('api/baskets/', include('apps.baskets.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/deliveries/', include('apps.deliveries.urls')),
    path('api/pricing/', include('apps.pricing.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
