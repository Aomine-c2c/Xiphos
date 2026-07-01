import os
from dotenv import load_dotenv
load_dotenv()

os.environ["XIPHOS_TUI"] = "1"

import json
import time
import threading
from loguru import logger

from bridge.proxy import mt5
from core.config import settings
from execution.connection import mt5_conn
from execution.orders import modify_sl
from execution.trailing import trail_positions
from monitoring.scheduler import scheduler

from core.engine import xiphos_engine
from core.state_manager import StateManager
from execution.executor import MT5Executor
from execution.queue import trade_worker

from core.correlation_engine import correlation_engine
from core.mahoraga import mahoraga_engine
from monitoring.metrics import get_memory_usage_mb, cpu_tracker, get_system_disk_usage_percent
from core.redis_client import redis_client

state_manager = StateManager()
mt5_executor = MT5Executor()

_bot_running = False

def redis_log_sink(message):
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
        redis_client.publish_log(log_item)
    except Exception:
        pass

logger.add(redis_log_sink, colorize=False)

def start_bot_execution():
    global _bot_running
    if _bot_running:
        return
    _bot_running = True
    logger.info("Bot execution loop started via API command.")
    scheduler.add_m30_job(xiphos_engine.process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    
    try:
        xiphos_engine.process_m30_cycle()
    except Exception as e:
        logger.error(f"Immediate startup cycle error: {e}")

def stop_bot_execution():
    global _bot_running
    if not _bot_running:
        return
    _bot_running = False
    scheduler.stop()
    logger.info("Bot execution loop stopped via API command.")

# Active state compilation helper
def _compile_account_data(account):
    if not account:
        return {"balance": 0.0, "equity": 0.0, "margin_free": 0.0, "margin_level": 0.0, "profit": 0.0}
    return {
        "balance": account.balance,
        "equity": account.equity,
        "margin_free": account.margin_free,
        "margin_level": account.margin_level if hasattr(account, 'margin_level') else 100.0,
        "profit": account.profit
    }

def _compile_positions_data():
    positions = mt5.positions_get() or []
    pos_list = []
    for pos in positions:
        if pos.magic <= 0:
            continue
        typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
        role_id = pos.magic % 10
        role = "Scalper" if role_id == 1 else "Runner" if role_id == 2 else f"Algo-{role_id}"
        is_free = pos.sl > 0 and ((pos.type == mt5.ORDER_TYPE_BUY and pos.sl >= pos.price_open) or (pos.type == mt5.ORDER_TYPE_SELL and pos.sl <= pos.price_open))
        pos_list.append({
            "ticket": pos.ticket, "symbol": pos.symbol, "type": typ,
            "volume": pos.volume, "price_open": pos.price_open,
            "price_current": pos.price_current, "sl": pos.sl, "tp": pos.tp,
            "profit": pos.profit, "role": role,
            "risk_status": "FREE" if is_free else "RISK"
        })
    return pos_list

def _get_order_type_str(ord_type):
    mapping = {
        mt5.ORDER_TYPE_BUY_LIMIT: "BUY_LIMIT",
        mt5.ORDER_TYPE_SELL_LIMIT: "SELL_LIMIT",
        mt5.ORDER_TYPE_BUY_STOP: "BUY_STOP",
        mt5.ORDER_TYPE_SELL_STOP: "SELL_STOP",
    }
    return mapping.get(ord_type, str(ord_type))

def _compile_orders_data():
    orders = mt5.orders_get() or []
    ord_list = []
    for ord in orders:
        ord_list.append({
            "ticket": ord.ticket, "symbol": ord.symbol, "type": _get_order_type_str(ord.type),
            "volume": ord.volume, "price_open": ord.price_open,
            "sl": ord.sl, "tp": ord.tp, "comment": ord.comment or ""
        })
    return ord_list

def _compile_market_watch_data():
    from indicators.moving_averages import get_m30_indicators
    mw_list = []
    all_symbols = []
    for bucket in settings.correlation_groups.values():
        all_symbols.extend(bucket)
        
    for sym in all_symbols[:15]:
        tick = mt5.symbol_info_tick(sym)
        if not tick:
            continue
        ind_data = get_m30_indicators(sym)
        e13 = e50 = s200 = 0.0
        s_info = mt5.symbol_info(sym)
        point = s_info.point if s_info else 0.00001
        if ind_data and point > 0:
            e13 = (tick.bid - ind_data['ema_fast']) / point
            e50 = (tick.bid - ind_data['ema_medium']) / point
            s200 = (tick.bid - ind_data['sma_slow']) / point
            
        mw_list.append({
            "symbol": sym, "price": tick.bid, "e13_dist": e13,
            "e50_dist": e50, "s200_dist": s200, "signal": "NONE"
        })
    return mw_list

def compile_system_state():
    account = mt5.account_info()
    is_connected = account is not None
    
    latency = 0.0
    if is_connected:
        start_ping = time.perf_counter()
        mt5.terminal_info()
        latency = (time.perf_counter() - start_ping) * 1000.0

    mem_mb = get_memory_usage_mb()
    cpu_pct = cpu_tracker.get_cpu_percent()
    disk_pct = get_system_disk_usage_percent()

    return {
        "bot_running": _bot_running,
        "mt5_connected": is_connected,
        "api_latency": latency,
        "account": _compile_account_data(account),
        "positions": _compile_positions_data(),
        "orders": _compile_orders_data(),
        "market_watch": _compile_market_watch_data(),
        "gates": xiphos_engine.last_cycle_data.get("gates", {}),
        "ranked_signals": xiphos_engine.last_cycle_data.get("ranked_signals", []),
        "last_cycle_time": xiphos_engine.last_cycle_data.get("time", ""),
        "system_stats": {
            "cpu": cpu_pct,
            "memory": mem_mb,
            "disk": disk_pct
        },
        "correlation_matrix": correlation_engine.get_matrix(),
        "performance_metrics": state_manager.get_performance_metrics(),
        "mahoraga_state": {sym: params.to_dict() for sym, params in mahoraga_engine.state.items()}
    }

def state_publisher_loop():
    while True:
        try:
            state = compile_system_state()
            redis_client.set_state(state)
        except Exception as e:
            logger.error(f"State compilation error: {e}")
        time.sleep(1.0)

# Helper execution functions
def close_all_positions():
    logger.warning("PANIC CLOSE initiated from commands!")
    positions = mt5.positions_get()
    if not positions:
        return
    closed = 0
    for pos in positions:
        tick = mt5.symbol_info_tick(pos.symbol)
        if not tick:
            continue
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
            "comment": "Panic Close",
        }
        res = mt5_executor._retry_wrapper(mt5.order_send, req)
        if res and res.retcode == mt5.TRADE_RETCODE_DONE:
            closed += 1
    logger.info(f"Panic close completed. {closed}/{len(positions)} trades closed.")
    stop_bot_execution()

def close_single_position(ticket: int, symbol: str):
    pos = mt5.positions_get(ticket=ticket)
    if not pos:
        return
    pos = pos[0]
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        return
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
        "comment": "Manual Close",
    }
    res = mt5_executor._retry_wrapper(mt5.order_send, req)
    if res and res.retcode == mt5.TRADE_RETCODE_DONE:
        logger.info(f"Position {ticket} closed manually.")

def modify_position_tp(ticket: int, symbol: str, new_tp: float):
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        return
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
    if not positions:
        return
    pos = positions[0]
    res = modify_sl(ticket, symbol, pos.price_open)
    if res:
        logger.info(f"Position {ticket} moved to breakeven at {pos.price_open:.5f}.")

def close_partial_position(ticket: int, symbol: str):
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        return
    pos = positions[0]
    half_vol = round(pos.volume / 2.0, 2)
    if half_vol < 0.01:
        return
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        return
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
        "comment": "Partial Close",
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
        "comment": "Limit order",
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

def handle_command(payload):
    try:
        cmd = json.loads(payload['data'])
        cmd_type = cmd.get("type")
        cmd_data = cmd.get("data", {})

        if cmd_type == "start_bot":
            start_bot_execution()
        elif cmd_type == "stop_bot":
            stop_bot_execution()
        elif cmd_type == "force_cycle":
            trade_worker.enqueue(xiphos_engine.process_m30_cycle)
        elif cmd_type == "panic_close":
            trade_worker.enqueue(close_all_positions)
        elif cmd_type == "modify_sl":
            trade_worker.enqueue(modify_sl, int(cmd_data["ticket"]), cmd_data["symbol"], float(cmd_data["new_sl"]))
        elif cmd_type == "modify_tp":
            trade_worker.enqueue(modify_position_tp, int(cmd_data["ticket"]), cmd_data["symbol"], float(cmd_data["new_tp"]))
        elif cmd_type == "close_position":
            trade_worker.enqueue(close_single_position, int(cmd_data["ticket"]), cmd_data["symbol"])
        elif cmd_type == "breakeven":
            trade_worker.enqueue(move_to_breakeven, int(cmd_data["ticket"]), cmd_data["symbol"])
        elif cmd_type == "partial_close":
            trade_worker.enqueue(close_partial_position, int(cmd_data["ticket"]), cmd_data["symbol"])
        elif cmd_type == "place_order":
            trade_worker.enqueue(place_limit_order, 
                cmd_data.get("symbol"), cmd_data.get("type"), float(cmd_data.get("volume", 0.01)),
                float(cmd_data.get("price")), float(cmd_data.get("sl", 0.0)), float(cmd_data.get("tp", 0.0))
            )
        elif cmd_type == "cancel_order":
            trade_worker.enqueue(cancel_pending_order, int(cmd_data.get("ticket")))
    except Exception as e:
        logger.error(f"Command processing error: {e}")

def command_listener_loop():
    pubsub = redis_client.subscribe_commands()
    for message in pubsub.listen():
        if message['type'] == 'message':
            handle_command(message)

if __name__ == "__main__":
    if mt5_conn.connect():
        logger.info("MT5 interface initialized in Worker Engine.")
    else:
        logger.error("MT5 connection failed in Worker Engine. Exiting.")
        exit(1)
        
    trade_worker.start()
    
    # Start background threads
    threading.Thread(target=state_publisher_loop, daemon=True).start()
    threading.Thread(target=command_listener_loop, daemon=True).start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Worker Engine shutting down.")
    finally:
        stop_bot_execution()
        trade_worker.stop()
        mt5_conn.disconnect()
