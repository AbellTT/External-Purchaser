from django.urls import path
from .views import (
    OrderListView, AdminOrderListView, OrderDetailView,
    OrderCancelView, OrderReorderView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('direct-purchase', OrderListView.as_view(), name='order-direct-purchase'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', OrderDetailView.as_view(), name='order-status-update'),
    path('<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('<int:pk>/reorder/', OrderReorderView.as_view(), name='order-reorder'),
    path('<str:pk>/', OrderDetailView.as_view(), name='order-detail-str'),
    path('<str:pk>/status/', OrderDetailView.as_view(), name='order-status-update-str'),
    path('<str:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel-str'),
    path('<str:pk>/reorder/', OrderReorderView.as_view(), name='order-reorder-str'),
]
