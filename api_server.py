import os
# Set TUI environment variable immediately to suppress raw stdout/stderr console logging from imports
os.environ["XIPHOS_TUI"] = "1"

import asyncio
import threading
import time
import yaml
from datetime import datetime, timedelta
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from bridge.proxy import mt5
from core.config import settings
from execution.connection import mt5_conn
from execution.orders import modify_sl, open_trade
from execution.trailing import trail_positions
from indicators.moving_averages import get_m30_indicators
from monitoring.scheduler import scheduler
from risk.RiskSlotManager import RiskSlotManager
from risk.CorrelationGuard import CorrelationGuard
from risk.SignalPriorityEngine import SignalPriorityEngine
from main import process_m30_cycle, last_cycle_data
from state_manager import StateManager
from mt5_executor import MT5Executor
from storage.database import db
from core.correlation_engine import correlation_engine

app = FastAPI(title="Xiphos Institutional Web API")

# Configure CORS to allow Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state_manager = StateManager()
mt5_executor = MT5Executor()

# Bot Loop Control
_bot_running = False
_bot_thread = None
_web_sockets: Set[WebSocket] = set()
_log_history = []

# Resource Tracking
class CPUTracker:
    def __init__(self):
        self.last_time = time.perf_counter()
        self.last_cpu_time = time.process_time()
        
    def get_cpu_percent(self) -> float:
        now = time.perf_counter()
        cpu_now = time.process_time()
        time_diff = now - self.last_time
        cpu_diff = cpu_now - self.last_cpu_time
        
        self.last_time = now
        self.last_cpu_time = cpu_now
        
        if time_diff > 0:
            cores = os.cpu_count() or 1
            return (cpu_diff / time_diff) * 100.0 / cores
        return 0.0

cpu_tracker = CPUTracker()

def get_memory_usage_mb() -> float:
    try:
        if os.name == 'nt':
            import ctypes
            class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                _fields_ = [
                    ("cb", ctypes.c_ulong),
                    ("PageFaultCount", ctypes.c_ulong),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t)
                ]
            counters = PROCESS_MEMORY_COUNTERS()
            process = ctypes.windll.kernel32.GetCurrentProcess()
            if ctypes.windll.psapi.GetProcessMemoryInfo(process, ctypes.byref(counters), ctypes.sizeof(counters)):
                return counters.WorkingSetSize / (1024 * 1024)
        else:
            import resource
            return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0
    except Exception:
        pass
    return 0.0

# Loguru interceptor
def websocket_log_sink(message):
    try:
        record = message.record
        level = record["level"].name
        ts = record["time"].strftime("%H:%M:%S")
        text = f"{ts} | {level:<8} | {record['message']}"
        
        log_item = {
            "timestamp": ts,
            "level": level,
            "message": record['message'],
            "formatted": text
        }
        _log_history.append(log_item)
        if len(_log_history) > 1000:
            _log_history.pop(0)
            
        # Broadcast immediately to clients
        payload = {
            "type": "log_event",
            "data": log_item
        }
        asyncio.run_coroutine_threadsafe(broadcast_to_websockets(payload), loop=main_event_loop)
    except Exception:
        pass

# Register interceptor (suppressing internal logging loop errors)
logger.add(websocket_log_sink, colorize=False)

def _bot_loop():
    global _bot_running
    logger.info("Bot execution loop started via API.")
    scheduler.add_m30_job(process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    
    try:
        process_m30_cycle()
    except Exception as e:
        logger.error(f"Immediate startup cycle error: {e}")
        
    try:
        while _bot_running:
            time.sleep(0.5)
    finally:
        scheduler.stop()
        logger.info("Bot execution loop stopped via API.")

def start_bot_execution():
    global _bot_running, _bot_thread
    if _bot_running:
        return
    _bot_running = True
    _bot_thread = threading.Thread(target=_bot_loop, daemon=True)
    _bot_thread.start()

def stop_bot_execution():
    global _bot_running
    if not _bot_running:
        return
    _bot_running = False

# WebSocket management
async def broadcast_to_websockets(payload: dict):
    if not _web_sockets:
        return
    disconnected = set()
    for ws in _web_sockets:
        try:
            await ws.send_json(payload)
        except Exception:
            disconnected.add(ws)
    for ws in disconnected:
        _web_sockets.remove(ws)

# Vincent AI Chat logic
def query_vincent_ai(text: str) -> str:
    text_lower = text.lower()
    
    # Check for skipped trades
    if "skipped" in text_lower or "skip" in text_lower or "block" in text_lower:
        gates = last_cycle_data.get("gates", {})
        if gates.get("gate_1_risk_slot") == "FAIL":
            return (
                "Vincent AI: The last evaluation cycle skipped potential entries because all 4 risk-bearing trade slots are fully utilized. "
                f"Currently: {gates.get('gate_1_details')}. New signals will be processed only when existing trades trail to breakeven or close."
            )
        elif gates.get("gate_2_correlation") == "FAIL" or "correlation" in text_lower:
            return (
                "Vincent AI: Execution was blocked by the Correlation Guard (Gate 2). "
                "An active risk-bearing position already exists within the same asset class category. "
                "Xiphos prevents opening multiple risk-bearing positions in highly correlated symbols to avoid systemic risk clustering."
            )
        elif gates.get("gate_3_fan_alignment") == "FAIL":
            return (
                "Vincent AI: No trades were entered because the system did not detect a valid Moving Average Fan Alignment (Gate 3). "
                "For a valid BUY signal, we require: Close > EMA13 > EMA50 > SMA200. "
                "For a valid SELL signal: Close < EMA13 < EMA50 < SMA200. The filters are strictly locked."
            )
        return (
            "Vincent AI: I've scanned the recent evaluation log. If a trade was skipped, it was due to safety gates. "
            "Currently, the system is monitoring all 5 gates. Gate 1 (Risk Slots) and Gate 2 (Correlation) are our primary risk inhibitors."
        )
        
    # Check for current risk
    if "risk" in text_lower or "exposure" in text_lower or "slots" in text_lower:
        slots_limit = settings.trading.max_risk_trades
        slots_available = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
        slots_used = slots_limit - slots_available
        risk_free = RiskSlotManager.get_risk_free_count(magic_filter=[135001, 135002])
        return (
            f"Vincent AI: Our current portfolio risk profile is actively monitored. "
            f"We are utilizing {slots_used} of {slots_limit} maximum risk-bearing slots. "
            f"We have {risk_free} risk-free positions (Stop Loss moved to or beyond entry price)."
        )
        
    # Check for setups / ranked signals
    if "strongest" in text_lower or "setup" in text_lower or "priority" in text_lower or "rank" in text_lower:
        signals = last_cycle_data.get("ranked_signals", [])
        if not signals:
            return "Vincent AI: No active setups are currently ranked by the Signal Priority Engine. The last evaluation cycle did not yield any qualified MA Fan Alignments."
        
        sig_desc = []
        for s in signals:
            sig_desc.append(f"{s['symbol']} ({s['direction']} at {s['price']:.5f}, Rank #{s['priority']})")
        return f"Vincent AI: The Multi-Signal Priority Engine (Gate 4) has ranked the following active setups: {', '.join(sig_desc)}. Ranking is sorted by absolute distance to the SMA200 scaled by points."
        
    # Explain strategy entry rules
    if "entered" in text_lower or "entry" in text_lower or "why did we enter" in text_lower:
        return (
            "Vincent AI: Xiphos enters trades based on M30 Candle Close Fan Alignments. "
            "A position consists of two trades: Trade A (Scalper, Magic 135001) which uses EMA50 for trailing, and Trade B (Runner, Magic 135002) which uses SMA200 for trailing. "
            "Entries are only allowed when the price escapes SMA200 and aligns with short-term and medium-term EMAs."
        )

    # Help / Fallback
    return (
        "Vincent AI: I am the XIPHOS AI Command Assistant. You can ask me:\n"
        "- 'Why was the last setup skipped?'\n"
        "- 'What is our current risk profile?'\n"
        "- 'What are the strongest setups right now?'\n"
        "- 'Why did we enter these positions?'"
    )

# Active state compilation helper
def compile_system_state():
    account = mt5.account_info()
    is_connected = account is not None
    
    latency = 0.0
    if is_connected:
        start_ping = time.perf_counter()
        mt5.terminal_info()
        latency = (time.perf_counter() - start_ping) * 1000.0

    # Account info payload
    acc_data = {}
    if account:
        acc_data = {
            "balance": account.balance,
            "equity": account.equity,
            "margin_free": account.margin_free,
            "margin_level": account.margin_level if hasattr(account, 'margin_level') else 100.0,
            "profit": account.profit
        }
    else:
        acc_data = {
            "balance": 0.0,
            "equity": 0.0,
            "margin_free": 0.0,
            "margin_level": 0.0,
            "profit": 0.0
        }

    # Positions compiling
    positions = mt5.positions_get() or []
    pos_list = []
    for pos in positions:
        typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
        role = "Scalper" if pos.magic == settings.magic_numbers.scalper else "Runner" if pos.magic == settings.magic_numbers.runner else str(pos.magic)
        is_free = pos.sl > 0 and ((pos.type == mt5.ORDER_TYPE_BUY and pos.sl >= pos.price_open) or (pos.type == mt5.ORDER_TYPE_SELL and pos.sl <= pos.price_open))
        pos_list.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": typ,
            "volume": pos.volume,
            "price_open": pos.price_open,
            "price_current": pos.price_current,
            "sl": pos.sl,
            "tp": pos.tp,
            "profit": pos.profit,
            "role": role,
            "risk_status": "FREE" if is_free else "RISK"
        })

    # Orders compiling (pending orders)
    orders = mt5.orders_get() or []
    ord_list = []
    for ord in orders:
        typ_ord = "BUY_LIMIT" if ord.type == mt5.ORDER_TYPE_BUY_LIMIT else \
                  "SELL_LIMIT" if ord.type == mt5.ORDER_TYPE_SELL_LIMIT else \
                  "BUY_STOP" if ord.type == mt5.ORDER_TYPE_BUY_STOP else \
                  "SELL_STOP" if ord.type == mt5.ORDER_TYPE_SELL_STOP else str(ord.type)
        ord_list.append({
            "ticket": ord.ticket,
            "symbol": ord.symbol,
            "type": typ_ord,
            "volume": ord.volume,
            "price_open": ord.price_open,
            "sl": ord.sl,
            "tp": ord.tp,
            "comment": ord.comment or ""
        })

    # Market watch indicators data compiling
    mw_list = []
    all_symbols = []
    for bucket in settings.correlation_groups.values():
        all_symbols.extend(bucket)
        
    for sym in all_symbols[:15]: # Cap symbols to 15 for payload size
        tick = mt5.symbol_info_tick(sym)
        if tick:
            ind_data = get_m30_indicators(sym)
            e13 = e50 = s200 = 0.0
            point = mt5.symbol_info(sym).point if mt5.symbol_info(sym) else 0.00001
            if ind_data and point > 0:
                e13 = (tick.bid - ind_data['ema_fast']) / point
                e50 = (tick.bid - ind_data['ema_medium']) / point
                s200 = (tick.bid - ind_data['sma_slow']) / point
                
            mw_list.append({
                "symbol": sym,
                "price": tick.bid,
                "e13_dist": e13,
                "e50_dist": e50,
                "s200_dist": s200,
                "signal": "NONE"
            })

    # System Performance
    mem_mb = get_memory_usage_mb()
    cpu_pct = cpu_tracker.get_cpu_percent()

    return {
        "bot_running": _bot_running,
        "mt5_connected": is_connected,
        "api_latency": latency,
        "account": acc_data,
        "positions": pos_list,
        "orders": ord_list,
        "market_watch": mw_list,
        "gates": last_cycle_data.get("gates", {}),
        "ranked_signals": last_cycle_data.get("ranked_signals", []),
        "last_cycle_time": last_cycle_data.get("time", ""),
        "system_stats": {
            "cpu": cpu_pct,
            "memory": mem_mb
        },
        "correlation_matrix": correlation_engine.get_matrix()
    }

# Periodical update dispatcher loop
async def periodical_websocket_broadcaster():
    while True:
        try:
            if _web_sockets:
                state = compile_system_state()
                payload = {
                    "type": "state_update",
                    "data": state
                }
                await broadcast_to_websockets(payload)
        except Exception as e:
            pass
        await asyncio.sleep(1.0)

# Websocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    _web_sockets.add(websocket)
    
    # Send initial state immediately
    try:
        state = compile_system_state()
        await websocket.send_json({
            "type": "state_update",
            "data": state
        })
        # Send initial logs
        await websocket.send_json({
            "type": "log_history",
            "data": _log_history
        })
    except Exception:
        pass
        
    try:
        while True:
            data = await websocket.receive_json()
            cmd_type = data.get("type")
            cmd_data = data.get("data", {})
            
            if cmd_type == "start_bot":
                start_bot_execution()
            elif cmd_type == "stop_bot":
                stop_bot_execution()
            elif cmd_type == "force_cycle":
                threading.Thread(target=process_m30_cycle, daemon=True).start()
            elif cmd_type == "panic_close":
                # Run panic close on a background thread
                threading.Thread(target=close_all_positions, daemon=True).start()
            elif cmd_type == "chat_message":
                msg_text = cmd_data.get("text", "")
                response = query_vincent_ai(msg_text)
                await websocket.send_json({
                    "type": "chat_response",
                    "data": {
                        "user_message": msg_text,
                        "bot_response": response,
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                })
            elif cmd_type == "modify_sl":
                ticket = int(cmd_data["ticket"])
                symbol = cmd_data["symbol"]
                new_sl = float(cmd_data["new_sl"])
                threading.Thread(target=modify_sl, args=(ticket, symbol, new_sl), daemon=True).start()
            elif cmd_type == "modify_tp":
                ticket = int(cmd_data["ticket"])
                symbol = cmd_data["symbol"]
                new_tp = float(cmd_data["new_tp"])
                threading.Thread(target=modify_position_tp, args=(ticket, symbol, new_tp), daemon=True).start()
            elif cmd_type == "close_position":
                ticket = int(cmd_data["ticket"])
                symbol = cmd_data["symbol"]
                threading.Thread(target=close_single_position, args=(ticket, symbol), daemon=True).start()
            elif cmd_type == "breakeven":
                ticket = int(cmd_data["ticket"])
                symbol = cmd_data["symbol"]
                threading.Thread(target=move_to_breakeven, args=(ticket, symbol), daemon=True).start()
            elif cmd_type == "partial_close":
                ticket = int(cmd_data["ticket"])
                symbol = cmd_data["symbol"]
                threading.Thread(target=close_partial_position, args=(ticket, symbol), daemon=True).start()
            elif cmd_type == "place_order":
                symbol = cmd_data.get("symbol")
                type_str = cmd_data.get("type")
                volume = float(cmd_data.get("volume", 0.01))
                price = float(cmd_data.get("price"))
                sl = float(cmd_data.get("sl", 0.0))
                tp = float(cmd_data.get("tp", 0.0))
                threading.Thread(target=place_limit_order, args=(symbol, type_str, volume, price, sl, tp), daemon=True).start()
            elif cmd_type == "cancel_order":
                ticket = int(cmd_data.get("ticket"))
                threading.Thread(target=cancel_pending_order, args=(ticket,), daemon=True).start()
    except WebSocketDisconnect:
        _web_sockets.remove(websocket)
    except Exception:
        if websocket in _web_sockets:
            _web_sockets.remove(websocket)

# Helper execution functions for WebSocket calls
def close_all_positions():
    logger.warning("PANIC CLOSE initiated from Web Interface!")
    positions = mt5.positions_get()
    if not positions:
        return
    closed = 0
    for pos in positions:
        tick = mt5.symbol_info_tick(pos.symbol)
        if not tick: continue
        action = mt5.TRADE_ACTION_DEAL
        type_mt5 = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
        price = tick.bid if pos.type == mt5.ORDER_TYPE_BUY else tick.ask
        req = {
            "action": action,
            "symbol": pos.symbol,
            "volume": pos.volume,
            "type": type_mt5,
            "position": pos.ticket,
            "price": price,
            "deviation": 20,
            "magic": pos.magic,
            "comment": "Panic Close via Web UI",
        }
        res = mt5_executor._retry_wrapper(mt5.order_send, req)
        if res and res.retcode == mt5.TRADE_RETCODE_DONE:
            closed += 1
    logger.info(f"Panic close completed. {closed}/{len(positions)} trades closed.")
    stop_bot_execution()

def close_single_position(ticket: int, symbol: str):
    pos = mt5.positions_get(ticket=ticket)
    if not pos: return
    pos = pos[0]
    tick = mt5.symbol_info_tick(symbol)
    if not tick: return
    type_mt5 = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
    price = tick.bid if pos.type == mt5.ORDER_TYPE_BUY else tick.ask
    req = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": pos.symbol,
        "volume": pos.volume,
        "type": type_mt5,
        "position": pos.ticket,
        "price": price,
        "deviation": 20,
        "magic": pos.magic,
        "comment": "Manual Close via Web UI",
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Position {ticket} closed manually.")

def modify_position_tp(ticket: int, symbol: str, new_tp: float):
    positions = mt5.positions_get(ticket=ticket)
    if not positions: return
    pos = positions[0]
    req = {
        "action": mt5.TRADE_ACTION_SLTP,
        "symbol": symbol,
        "sl": float(pos.sl) if pos.sl else 0.0,
        "tp": float(new_tp),
        "position": ticket
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Position {ticket} TP updated to {new_tp}.")

def move_to_breakeven(ticket: int, symbol: str):
    positions = mt5.positions_get(ticket=ticket)
    if not positions: return
    pos = positions[0]
    res = modify_sl(ticket, symbol, pos.price_open)
    if res:
        logger.info(f"Position {ticket} moved to breakeven at {pos.price_open:.5f}.")

def close_partial_position(ticket: int, symbol: str):
    positions = mt5.positions_get(ticket=ticket)
    if not positions: return
    pos = positions[0]
    half_vol = round(pos.volume / 2.0, 2)
    if half_vol < 0.01: return
    tick = mt5.symbol_info_tick(symbol)
    if not tick: return
    type_mt5 = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
    price = tick.bid if pos.type == mt5.ORDER_TYPE_BUY else tick.ask
    req = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": pos.symbol,
        "volume": half_vol,
        "type": type_mt5,
        "position": pos.ticket,
        "price": price,
        "deviation": 20,
        "magic": pos.magic,
        "comment": "Partial Close via Web UI",
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Position {ticket} partially closed (50% = {half_vol} lots).")

def place_limit_order(symbol: str, type_str: str, volume: float, price: float, sl: float, tp: float):
    mt5_type = None
    if type_str == "BUY_LIMIT":
        mt5_type = mt5.ORDER_TYPE_BUY_LIMIT
    elif type_str == "SELL_LIMIT":
        mt5_type = mt5.ORDER_TYPE_SELL_LIMIT
    elif type_str == "BUY_STOP":
        mt5_type = mt5.ORDER_TYPE_BUY_STOP
    elif type_str == "SELL_STOP":
        mt5_type = mt5.ORDER_TYPE_SELL_STOP
        
    if mt5_type is None:
        logger.error(f"Invalid order type for limit placement: {type_str}")
        return
        
    req = {
        "action": mt5.TRADE_ACTION_PENDING,
        "symbol": symbol,
        "volume": volume,
        "type": mt5_type,
        "price": price,
        "sl": sl,
        "tp": tp,
        "type_time": mt5.ORDER_TIME_GTC,
        "comment": "Limit order via Web UI",
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Pending order placed: {type_str} {volume} lots of {symbol} at {price}")
    else:
        err_msg = getattr(res, "comment", "Unknown MT5 error") if res else "No response"
        logger.error(f"Failed to place pending order: {err_msg}")

def cancel_pending_order(ticket: int):
    req = {
        "action": mt5.TRADE_ACTION_REMOVE,
        "order": ticket,
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Pending order {ticket} cancelled successfully.")
    else:
        err_msg = getattr(res, "comment", "Unknown MT5 error") if res else "No response"
        logger.error(f"Failed to cancel pending order {ticket}: {err_msg}")

# REST API routes
@app.get("/api/settings")
def get_web_settings():
    with open("config/settings.yaml", "r") as f:
        return yaml.safe_load(f)

@app.post("/api/settings")
async def save_web_settings(req_settings: dict):
    with open("config/settings.yaml", "w") as f:
        yaml.dump(req_settings, f)
    # Update running config dynamically
    if "trading" in req_settings:
        settings.trading.max_risk_trades = int(req_settings["trading"].get("max_risk_trades", settings.trading.max_risk_trades))
        settings.trading.lot_size = float(req_settings["trading"].get("lot_size", settings.trading.lot_size))
    logger.info("Configuration updated dynamically via Web settings API.")
    return {"status": "success"}

@app.get("/api/history")
def get_web_history(limit: int = 50):
    return state_manager.get_trade_history(limit=limit)

@app.get("/api/performance")
def get_web_performance():
    return {
        "global": state_manager.get_performance_metrics(),
        "strategy": state_manager.get_strategy_performance_metrics()
    }

# FastAPI Startup event to bind and run event loops
main_event_loop = None

@app.on_event("startup")
async def startup_event():
    global main_event_loop
    main_event_loop = asyncio.get_running_loop()
    
    # Establish MT5 connection
    if mt5_conn.connect():
        logger.info("MT5 interface initialized in API server.")
    else:
        logger.error("MT5 connection failed in API server.")
        
    # Auto start trading loop
    start_bot_execution()
    
    # Start the periodical websocket broadcaster as a background task
    asyncio.create_task(periodical_websocket_broadcaster())

@app.on_event("shutdown")
async def shutdown_event():
    stop_bot_execution()
    mt5_conn.disconnect()
    logger.info("API server offline.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
