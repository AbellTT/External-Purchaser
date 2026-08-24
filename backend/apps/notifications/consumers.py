import json

from channels.generic.websocket import AsyncWebsocketConsumer


class BroadcastConsumer(AsyncWebsocketConsumer):
    """
    Mirrors the legacy standalone websocket_server.py behaviour:
    - accepts every connection
    - receives all broadcast events via the channel layer group
    - ignores inbound client messages (heartbeat only)
    """

    async def connect(self):
        await self.channel_layer.group_add('broadcast', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('broadcast', self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Inbound client messages are intentionally ignored, same as before.
        pass

    async def broadcast_event(self, event):
        await self.send(text_data=json.dumps(event['data']))
