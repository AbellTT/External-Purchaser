from django.urls import path
from .views import (
    ChangePasswordView,
    RegisterView,
    LoginView,
    RefreshView,
    UserProfileView,
    LogoutView,
    AdminLoginView,
    AdminRefreshView,
    AdminLogoutView,
)

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('refresh', RefreshView.as_view(), name='refresh'),
    path('me', UserProfileView.as_view(), name='me'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('change-password', ChangePasswordView.as_view(), name='change-password'),

    # Admin Auth Routes
    path('admin/login', AdminLoginView.as_view(), name='admin-login'),
    path('admin/refresh', AdminRefreshView.as_view(), name='admin-refresh'),
    path('admin/logout', AdminLogoutView.as_view(), name='admin-logout'),
]
