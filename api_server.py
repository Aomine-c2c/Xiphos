import os
from dotenv import load_dotenv
load_dotenv()

os.environ["XIPHOS_TUI"] = "1"

import json
import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from api.routes import router
from api.websockets import ws_manager
from core.redis_client import redis_client
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Xiphos Institutional Web API (Microservice Mode)")
Instrumentator().instrument(app).expose(app)

allowed_origins_raw = os.getenv("XIPHOS_ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

_log_history = []

async def periodical_websocket_broadcaster():
    while True:
        try:
            if ws_manager.active_connections:
                state = redis_client.get_state()
                if state:
                    payload = {
                        "type": "state_update",
                        "data": state
                    }
                    await ws_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Broadcaster error: {e}")
        await asyncio.sleep(1.0)

async def redis_log_listener():
    pubsub = redis_client.subscribe_logs()
    # Need to run in an executor or use aioredis, but since we're using sync redis, we use asyncio.to_thread
    while True:
        try:
            message = await asyncio.to_thread(pubsub.get_message, ignore_subscribe_messages=True, timeout=1.0)
            if message and message['type'] == 'message':
                log_item = json.loads(message['data'])
                _log_history.append(log_item)
                if len(_log_history) > 1000:
                    _log_history.pop(0)
                    
                payload = {
                    "type": "log_event",
                    "data": log_item
                }
                if ws_manager.active_connections:
                    await ws_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Log listener error: {e}")
            await asyncio.sleep(1.0)

async def _process_ws_command(websocket: WebSocket, data: dict):
    cmd_type = data.get("type")
    cmd_data = data.get("data", {})
    
    # Forward all bot and trade commands to worker engine via Redis
    engine_commands = [
        "start_bot", "stop_bot", "force_cycle", "panic_close",
        "modify_sl", "modify_tp", "close_position", "breakeven", "partial_close",
        "place_order", "cancel_order"
    ]
    
    if cmd_type in engine_commands:
        redis_client.publish_command(cmd_type, cmd_data)
        logger.info(f"Forwarded command to engine: {cmd_type}")
    elif cmd_type == "chat_message":
        # Mock Vincent AI Response
        msg_text = cmd_data.get("text", "")
        await websocket.send_json({
            "type": "chat_response",
            "data": {
                "user_message": msg_text,
                "bot_response": "Vincent AI: Architecture refactor active. System decoupled.",
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
        })

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket): # NOSONAR
    await ws_manager.connect(websocket)
    try:
        state = redis_client.get_state()
        if state:
            await websocket.send_json({"type": "state_update", "data": state})
        await websocket.send_json({"type": "log_history", "data": _log_history})
    except Exception as e:
        logger.error(f"Failed to send initial WS state: {e}")
        
    try:
        while True:
            data = await websocket.receive_json()
            await _process_ws_command(websocket, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

_bg_tasks = set()

@app.on_event("startup")
async def startup_event():
    _bg_task1 = asyncio.create_task(periodical_websocket_broadcaster())
    _bg_tasks.add(_bg_task1)
    
    _bg_task2 = asyncio.create_task(redis_log_listener())
    _bg_tasks.add(_bg_task2)
    logger.info("API server online.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("API server offline.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
