from django.urls import path
from . import views

urlpatterns = [
    # User endpoints
    path('', views.BasketListView.as_view(), name='basket-list'),
    path('<int:pk>/join/', views.BasketJoinView.as_view(), name='basket-join'),
    path('history/', views.BasketHistoryListView.as_view(), name='basket-history'),

    # Admin endpoints
    path('admin/', views.AdminBasketListView.as_view(), name='admin-basket-list'),
    path('admin/create/', views.AdminBasketCreateView.as_view(), name='admin-basket-create'),
    path('admin/<int:pk>/close/', views.AdminBasketCloseView.as_view(), name='admin-basket-close'),
    path('admin/<int:pk>/cancel/', views.AdminBasketCancelView.as_view(), name='admin-basket-cancel'),
    path('admin/<int:pk>/delivery/', views.AdminBasketDeliveryView.as_view(), name='admin-basket-delivery'),
]
