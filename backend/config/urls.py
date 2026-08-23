"""
URL configuration for babi procurement platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.organizations.dashboard_views import UserDashboardOverviewView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Overview
    path('api/dashboard/overview', UserDashboardOverviewView.as_view(), name='user-dashboard-overview'),
    
    # Authentication
    path('api/auth/', include('apps.users.urls')),
    
    # App URLs
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
