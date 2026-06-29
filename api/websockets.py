import asyncio
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, payload: dict):
        if not self.active_connections:
            return
            
        disconnected = set()
        for ws in self.active_connections:
            try:
                await ws.send_json(payload)
            except Exception:
                disconnected.add(ws)
                
        for ws in disconnected:
            self.disconnect(ws)

ws_manager = WebSocketManager()
