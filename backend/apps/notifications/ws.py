"""
WebSocket event broadcasting via Django Channels.

Replaces the legacy standalone broadcast server (websocket_server.py,
ports 8002/8003). Events are published to the 'broadcast' channel-layer
group and relayed to every connected WebSocket client at /ws — identical
broadcast-to-all semantics to the previous implementation.
"""
import threading


def _broadcast(event_data):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    try:
        layer = get_channel_layer()
        if layer is None:
            return
        async_to_sync(layer.group_send)(
            'broadcast',
            {'type': 'broadcast.event', 'data': event_data},
        )
    except Exception:
        # Fire-and-forget: never let WS delivery break the request flow.
        pass


def broadcast_ws_event(event_data):
    """Fire-and-forget async WebSocket event broadcast to all connected clients."""
    threading.Thread(target=_broadcast, args=(event_data,), daemon=True).start()
