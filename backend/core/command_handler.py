import json
from loguru import logger

from bridge.proxy import mt5
from execution.connection import mt5_conn
from execution.orders import modify_sl
from execution.executor import MT5Executor
from execution.queue import trade_worker
from core.engine import xiphos_engine
from core.bot_controller import start_bot_execution, stop_bot_execution
from core.redis_client import redis_client
from core.mahoraga import mahoraga_engine
from storage.database import db
from core.database import Trade
from core.llm import analyze_trade_mistakes

mt5_executor = MT5Executor()

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

def update_mahoraga_constraint(symbol: str, strictness: str):
    params = mahoraga_engine.get_parameters(symbol)
    params.filter_strictness = strictness
    logger.info(f"Mahoraga constraint updated for {symbol} to {strictness}")

def toggle_trading_halt(symbol: str, halt: bool):
    params = mahoraga_engine.get_parameters(symbol)
    params.trading_halted = halt
    logger.info(f"Trading halted for {symbol}: {halt}")

def update_journal_notes(trade_id: int, notes: str):
    try:
        with db.get_session() as session:
            trade = session.query(Trade).filter(Trade.id == trade_id).first()
            if trade:
                trade.notes = notes
                logger.info(f"Journal notes updated for trade {trade_id}.")
            else:
                logger.warning(f"Trade {trade_id} not found for notes update.")
    except Exception as e:
        logger.error(f"Failed to update journal notes: {e}")

def execute_ai_analysis(trade_id: int):
    try:
        with db.get_session() as session:
            trade = session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade:
                logger.warning(f"Trade {trade_id} not found for AI analysis.")
                return

            trade_data = {
                "symbol": trade.symbol,
                "type": trade.type,
                "profit": trade.profit,
                "entry_price": trade.entry_price,
                "notes": trade.notes,
                "holding_time_mins": trade.holding_time_mins,
                "mae": trade.mae,
                "mfe": trade.mfe
            }
            
            logger.info(f"Requesting Vincent Deep Dive for trade {trade_id}...")
            analysis = analyze_trade_mistakes(trade_data)
            
            trade.ai_explanation = analysis.ai_explanation
            trade.mistake_analysis = analysis.mistake_analysis
            trade.lessons_learned = analysis.lessons_learned
            
            logger.info(f"Vincent Deep Dive completed for trade {trade_id}.")
    except Exception as e:
        logger.error(f"Failed to execute AI analysis: {e}")

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
        elif cmd_type == "update_mahoraga_constraint":
            trade_worker.enqueue(update_mahoraga_constraint, cmd_data.get("symbol", "ALL"), cmd_data.get("strictness", "NORMAL"))
        elif cmd_type == "toggle_trading_halt":
            trade_worker.enqueue(toggle_trading_halt, cmd_data.get("symbol", "ALL"), bool(cmd_data.get("halt", False)))
        elif cmd_type == "update_journal_notes":
            trade_worker.enqueue(update_journal_notes, int(cmd_data.get("id")), cmd_data.get("notes", ""))
        elif cmd_type == "request_ai_analysis":
            trade_worker.enqueue(execute_ai_analysis, int(cmd_data.get("id")))
    except Exception as e:
        logger.error(f"Command processing error: {e}")

def command_listener_loop():
    mt5_conn.ensure_initialized()
    pubsub = redis_client.subscribe_commands()
    for message in pubsub.listen():
        if message['type'] == 'message':
            handle_command(message)
