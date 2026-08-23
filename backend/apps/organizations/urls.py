from django.urls import path
from . import views
from .dashboard_views import AdminDashboardOverviewView

urlpatterns = [
    # Admin endpoints
    path('admin/', views.AdminOrganizationListView.as_view(), name='admin-org-list'),
    path('admin/overview/', AdminDashboardOverviewView.as_view(), name='admin-dashboard-overview'),
    path('admin/<int:pk>/approve/', views.AdminOrganizationApproveView.as_view(), name='admin-org-approve'),
    path('admin/<int:pk>/reject/', views.AdminOrganizationRejectView.as_view(), name='admin-org-reject'),
    path('admin/tin-verify/', views.AdminTINVerifyView.as_view(), name='admin-tin-verify'),
]
