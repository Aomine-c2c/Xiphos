import time
import json
from loguru import logger
from bridge.proxy import mt5
from core.config import settings
from execution.connection import mt5_conn
from core.engine import xiphos_engine
from core.state_manager import StateManager
from core.correlation_engine import correlation_engine
from core.mahoraga import mahoraga_engine
from monitoring.metrics import get_memory_usage_mb, cpu_tracker, get_system_disk_usage_percent
from core.redis_client import redis_client
from core.bot_controller import is_bot_running

state_manager = StateManager()

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

def _compile_positions_data(): # noqa: C901
    positions = mt5.positions_get() or []
    pos_list = []
    for pos in positions:
        if pos.magic <= 0:
            continue
        typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
        role_id = pos.magic % 10
        if role_id == 1:
            role = "Scalper"
        elif role_id == 2:
            role = "Runner"
        else:
            role = f"Algo-{role_id}"
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

    news_data = None
    try:
        raw_news = redis_client.client.get("xiphos:data:news")
        if raw_news:
            news_data = json.loads(raw_news)
    except Exception as e:
        logger.error(f"Failed to load news from redis: {e}")

    return {
        "bot_running": is_bot_running(),
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
        "mahoraga_state": {sym: params.to_dict() for sym, params in mahoraga_engine.state.items()},
        "news": news_data
    }

def state_publisher_loop():
    mt5_conn.ensure_initialized()
    while True:
        try:
            if not getattr(mt5_conn, 'connected', False):
                mt5_conn.connect(max_retries=1, delay=0)
                
            state = compile_system_state()
            redis_client.set_state(state)
        except Exception as e:
            logger.error(f"State compilation error: {e}")
        time.sleep(1.0)
