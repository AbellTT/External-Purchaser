import asyncio
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import websockets

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

CONNECTED_CLIENTS = set()
MAIN_LOOP = None

async def ws_handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    logging.info(f"New WebSocket connection established. Total clients: {len(CONNECTED_CLIENTS)}")
    try:
        async for message in websocket:
            # Handle incoming ping/heartbeat
            pass
    except Exception as e:
        logging.info(f"WebSocket client disconnected: {e}")
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        logging.info(f"Client disconnected. Remaining clients: {len(CONNECTED_CLIENTS)}")

async def broadcast_event(event_data):
    if not CONNECTED_CLIENTS:
        return
    message = json.dumps(event_data)
    logging.info(f"Broadcasting message to {len(CONNECTED_CLIENTS)} clients: {message}")
    websockets_to_remove = set()
    for client in list(CONNECTED_CLIENTS):
        try:
            await client.send(message)
        except Exception:
            websockets_to_remove.add(client)
    for c in websockets_to_remove:
        CONNECTED_CLIENTS.discard(c)

class BroadcastHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            event_data = json.loads(post_data.decode('utf-8'))
            if MAIN_LOOP:
                asyncio.run_coroutine_threadsafe(broadcast_event(event_data), MAIN_LOOP)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "broadcasted"}')
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def log_message(self, format, *args):
        # Suppress standard HTTP logs for cleanliness
        return

def run_http_server():
    server = HTTPServer(('0.0.0.0', 8003), BroadcastHandler)
    logging.info("Internal HTTP Broadcast Server listening on http://0.0.0.0:8003")
    server.serve_forever()

async def main():
    global MAIN_LOOP
    MAIN_LOOP = asyncio.get_running_loop()

    # Start HTTP broadcast listener thread
    t = threading.Thread(target=run_http_server, daemon=True)
    t.start()

    async with websockets.serve(ws_handler, "0.0.0.0", 8002):
        logging.info("WebSocket Event Server running on ws://0.0.0.0:8002")
        await asyncio.Future()  # keep running forever

if __name__ == "__main__":
    asyncio.run(main())
