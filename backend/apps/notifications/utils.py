"""
Notification utility helpers.
Re-exports helpers from views and provides WS broadcast functions.
"""
import urllib.request
import json
import threading

from .views import (
    send_user_notification,
    send_global_notification,
    send_basket_completed_notifications,
)


def _send_ws_post(event_data):
    try:
        req = urllib.request.Request(
            'http://127.0.0.1:8003/',
            data=json.dumps(event_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=1)
    except Exception:
        pass


def broadcast_ws_event(event_data):
    """Fire-and-forget async WebSocket event broadcast to all connected clients."""
    threading.Thread(target=_send_ws_post, args=(event_data,), daemon=True).start()


__all__ = [
    'send_user_notification',
    'send_global_notification',
    'send_basket_completed_notifications',
    'broadcast_ws_event',
]
