from django.urls import path
from . import views

urlpatterns = [
    # Admin endpoints
    path('admin/market-data/', views.AdminMarketDataView.as_view(), name='admin-market-data'),
    path('admin/financial-loss/', views.AdminFinancialLossView.as_view(), name='admin-financial-loss'),
    path('admin/guidance/', views.AdminProcurementGuidanceView.as_view(), name='admin-procurement-guidance'),

    # User endpoints
    path('market-intelligence/', views.UserMarketIntelligenceView.as_view(), name='user-market-intelligence'),
    path('procurement-calendar/', views.UserProcurementCalendarView.as_view(), name='user-procurement-calendar'),
]
