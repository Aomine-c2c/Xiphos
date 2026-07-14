import os

from dotenv import load_dotenv

load_dotenv()


os.environ["XIPHOS_TUI"] = "1"



import json

import asyncio

from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import StreamingResponse

from fastapi.staticfiles import StaticFiles

from loguru import logger



from bridge.proxy import mt5

TIMEFRAME_MAP = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
    "D1": mt5.TIMEFRAME_D1,
}


from api.routes import router

from api.websockets import ws_manager

from core.redis_client import RedisClient

redis_client = RedisClient()

from prometheus_fastapi_instrumentator import Instrumentator



app = FastAPI(title="Xiphos Institutional Web API (Microservice Mode)")

Instrumentator().instrument(app).expose(app)

static_out = os.path.join(os.path.dirname(__file__), "..", "web", "out")
static_out = os.path.abspath(static_out)
if os.path.isdir(static_out):
    app.mount("/app", StaticFiles(directory=static_out, html=True), name="xiphos-web")

    @app.get("/")
    async def redirect_to_app():
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/app/")

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

class SSEManager:
    def __init__(self):
        self.queues = []
    def connect(self):
        q = asyncio.Queue()
        self.queues.append(q)
        return q
    def disconnect(self, q):
        if q in self.queues:
            self.queues.remove(q)
    async def broadcast(self, payload: dict):
        for q in self.queues:
            await q.put(payload)

sse_manager = SSEManager()

_log_history = []

async def periodical_websocket_broadcaster():
    while True:
        try:
            state = redis_client.get_state()
            if state:
                payload = {"type": "state_update", "data": state}
                if ws_manager.active_connections:
                    await ws_manager.broadcast(payload)
                if sse_manager.queues:
                    await sse_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Broadcaster error: {e}")
        await asyncio.sleep(1.0)

async def redis_log_listener():
    pubsub = redis_client.subscribe_logs()
    while True:
        try:
            message = await asyncio.to_thread(pubsub.get_message, ignore_subscribe_messages=True, timeout=1.0)
            if message and message['type'] == 'message':
                log_item = json.loads(message['data'])
                _log_history.append(log_item)
                if len(_log_history) > 1000:
                    _log_history.pop(0)
                payload = {"type": "log_event", "data": log_item}
                if ws_manager.active_connections:
                    await ws_manager.broadcast(payload)
                if sse_manager.queues:
                    await sse_manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Log listener error: {e}")
            await asyncio.sleep(1.0)

async def _process_ws_command(websocket: WebSocket, data: dict):
    cmd_type = data.get("type")
    cmd_data = data.get("data", {})
    engine_commands = [
        "start_bot", "stop_bot", "force_cycle", "panic_close",
        "modify_sl", "modify_tp", "close_position", "breakeven", "partial_close",
        "place_order", "cancel_order",
        "update_mahoraga_constraint", "toggle_trading_halt", "update_journal_notes", "request_ai_analysis"
    ]
    if cmd_type in engine_commands:
        redis_client.publish_command(cmd_type, cmd_data)
        logger.info(f"Forwarded command to engine: {cmd_type}")
    elif cmd_type == "chat_message":
        msg_text = cmd_data.get("text", "")
        await websocket.send_json({
            "type": "chat_response",
            "data": {
                "user_message": msg_text,
                "bot_response": "Vincent AI: Architecture refactor active. System decoupled.",
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
        })

@app.get("/api/state")
def get_state():
    global redis_client
    if redis_client is None:
        redis_client = RedisClient()
    try:
        state = redis_client.get_state()
    except Exception:
        state = None
    if not state:
        return {"bot_running": False, "mt5_connected": False, "account": None}
    return state

@app.get("/api/chart/{symbol}")
async def get_chart_data(symbol: str, timeframe: str = "M30"):
    tf = TIMEFRAME_MAP.get(timeframe, mt5.TIMEFRAME_M30)
    rates = await asyncio.to_thread(mt5.copy_rates_from_pos, symbol, tf, 0, 100)
    if rates is None or len(rates) == 0:
        return {"error": "No data for symbol", "data": []}
    data = []
    for r in rates:
        data.append({
            "time": int(r['time']),
            "open": float(r['open']),
            "high": float(r['high']),
            "low": float(r['low']),
            "close": float(r['close'])
        })
    return {"data": data}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
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

@app.get("/api/stream")
async def sse_endpoint(request: Request):
    async def event_generator():
        q = sse_manager.connect()
        try:
            state = redis_client.get_state()
            if state:
                yield f"data: {json.dumps({'type': 'state_update', 'data': state})}\n\n"
            yield f"data: {json.dumps({'type': 'log_history', 'data': _log_history})}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    payload = await asyncio.wait_for(q.get(), timeout=2.0)
                    yield f"data: {json.dumps(payload)}\n\n"
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
        finally:
            sse_manager.disconnect(q)
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/command")
async def api_command(cmd: dict):
    cmd_type = cmd.get("type")
    cmd_data = cmd.get("data", {})
    engine_commands = [
        "start_bot", "stop_bot", "force_cycle", "panic_close",
        "modify_sl", "modify_tp", "close_position", "breakeven", "partial_close",
        "place_order", "cancel_order",
        "update_mahoraga_constraint", "toggle_trading_halt", "update_journal_notes", "request_ai_analysis"
    ]
    if cmd_type in engine_commands:
        redis_client.publish_command(cmd_type, cmd_data)
        logger.info(f"Forwarded HTTP command to engine: {cmd_type}")
        return {"status": "success"}
    elif cmd_type == "chat_message":
        msg_text = cmd_data.get("text", "")
        payload = {
            "type": "chat_response",
            "data": {
                "user_message": msg_text,
                "bot_response": "Vincent AI: Architecture refactor active. System decoupled.",
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
        }
        await sse_manager.broadcast(payload)
        await ws_manager.broadcast(payload)
        return {"status": "success"}
    return {"status": "ignored"}

_bg_tasks = set()

@app.on_event("startup")
async def startup_event():
    try:
        if mt5.initialize():
            logger.info("MT5 interface initialized in API Server.")
        else:
            logger.warning("MT5 initialization failed in API Server. Chart data may be unavailable.")
    except Exception as e:
        logger.error(f"Error during MT5 initialization in API Server: {e}")
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
    uvicorn.run(app, host="127.0.0.1", port=8001, http="h11", loop="asyncio")
