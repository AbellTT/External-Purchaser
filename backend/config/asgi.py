"""
ASGI config for babi procurement platform.

Serves both HTTP (Django REST API) and WebSocket (/ws realtime events)
from a single application — deployable as one process on one port.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize the Django ASGI app before importing consumer code so that
# app registry setup happens first.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter

from apps.notifications.routing import websocket_urlpatterns

# NOTE: intentionally no AllowedHostsOriginValidator here — the legacy
# standalone WebSocket server accepted all origins, and this preserves
# that behaviour exactly. Add per-origin validation as a hardening step later.
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': URLRouter(websocket_urlpatterns),
})
