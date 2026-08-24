from django.urls import path

from .consumers import BroadcastConsumer

websocket_urlpatterns = [
    path('ws', BroadcastConsumer.as_asgi()),
]
