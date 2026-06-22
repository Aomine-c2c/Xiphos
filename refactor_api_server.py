import re

with open("api_server.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. query_vincent_ai replacement
vincent_start = content.find("def query_vincent_ai(text: str) -> str:")
vincent_end = content.find("# Active state compilation helper", vincent_start)
if vincent_start != -1 and vincent_end != -1:
    vincent_new = """def _handle_skipped_query(text_lower: str):
    if "skipped" in text_lower or "skip" in text_lower or "block" in text_lower:
        gates = last_cycle_data.get("gates", {})
        if gates.get("gate_1_risk_slot") == "FAIL":
            return (
                "Vincent AI: The last evaluation cycle skipped potential entries because all 4 risk-bearing trade slots are fully utilized. "
                f"Currently: {gates.get('gate_1_details')}. New signals will be processed only when existing trades trail to breakeven or close."
            )
        if gates.get("gate_2_correlation") == "FAIL" or "correlation" in text_lower:
            return (
                "Vincent AI: Execution was blocked by the Correlation Guard (Gate 2). "
                "An active risk-bearing position already exists within the same asset class category. "
                "Xiphos prevents opening multiple risk-bearing positions in highly correlated symbols to avoid systemic risk clustering."
            )
            "Currently, the system is monitoring all 5 gates. Gate 1 (Risk Slots) and Gate 2 (Correlation) are our primary risk inhibitors."
        )
    return None

def _handle_risk_query(text_lower: str):
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
    return None

def _handle_ranked_query(text_lower: str):
    if "strongest" in text_lower or "setup" in text_lower or "priority" in text_lower or "rank" in text_lower:
        signals = last_cycle_data.get("ranked_signals", [])
        if not signals:
            return "Vincent AI: No active setups are currently ranked by the Signal Priority Engine. The last evaluation cycle did not yield any qualified MA Fan Alignments."
        
        sig_desc = []
        for s in signals:
            sig_desc.append(f"{s['symbol']} ({s['direction']} at {s['price']:.5f}, Rank #{s['priority']})")
        return f"Vincent AI: The Multi-Signal Priority Engine (Gate 4) has ranked the following active setups: {', '.join(sig_desc)}. Ranking is sorted by absolute distance to the SMA200 scaled by points."
    return None

def _handle_entry_query(text_lower: str):
    if "entered" in text_lower or "entry" in text_lower or "why did we enter" in text_lower:
        return (
            "Vincent AI: Xiphos enters trades based on M30 Candle Close Fan Alignments. "
            "A position consists of two trades: Trade A (Scalper, Magic 135001) which uses EMA50 for trailing, and Trade B (Runner, Magic 135002) which uses SMA200 for trailing. "
            "Entries are only allowed when the price escapes SMA200 and aligns with short-term and medium-term EMAs."
        )
    return None

def query_vincent_ai(text: str) -> str:
    text_lower = text.lower()
    if res := _handle_skipped_query(text_lower): return res
    if res := _handle_risk_query(text_lower): return res
    if res := _handle_ranked_query(text_lower): return res
    if res := _handle_entry_query(text_lower): return res
    
    return (
        "Vincent AI: I am the XIPHOS AI Command Assistant. You can ask me:\\n"
        "- 'Why was the last setup skipped?'\\n"
        "- 'What is our current risk profile?'\\n"
        "- 'What are the strongest setups right now?'\\n"
        "- 'Why did we enter these positions?'"
    )
\"\"\"
    content = content[:vincent_start] + vincent_new + content[vincent_end:]
# 2. compile_system_state replacement
state_start = content.find("def compile_system_state():")
state_end = content.find("# Periodical update dispatcher loop", state_start)
if state_start != -1 and state_end != -1:
    state_new = """def _compile_account_data(account):
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
        typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
        if pos.magic == settings.magic_numbers.scalper:
            role = "Scalper"
        elif pos.magic == settings.magic_numbers.runner:
            role = "Runner"
        else:
            role = str(pos.magic)
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
    if ord_type == mt5.ORDER_TYPE_BUY_LIMIT: return "BUY_LIMIT"
    if ord_type == mt5.ORDER_TYPE_SELL_LIMIT: return "SELL_LIMIT"
    if ord_type == mt5.ORDER_TYPE_BUY_STOP: return "BUY_STOP"
    if ord_type == mt5.ORDER_TYPE_SELL_STOP: return "SELL_STOP"
    return str(ord_type)

def _compile_orders_data():
    orders = mt5.orders_get() or []
    ord_list = []
    for ord in orders:
        typ_ord = _get_order_type_str(ord.type)
        ord_list.append({
            "ticket": ord.ticket, "symbol": ord.symbol, "type": typ_ord,
            "volume": ord.volume, "price_open": ord.price_open,
            "sl": ord.sl, "tp": ord.tp, "comment": ord.comment or ""
        })
    return ord_list

def _compile_market_watch_data():
    mw_list = []
    all_symbols = []
    for bucket in settings.correlation_groups.values():
        all_symbols.extend(bucket)
        
    for sym in all_symbols[:15]:
        tick = mt5.symbol_info_tick(sym)
        if not tick: continue
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

    from monitoring.metrics import get_memory_usage_mb, cpu_tracker
    mem_mb = get_memory_usage_mb()
    cpu_pct = cpu_tracker.get_cpu_percent()

    return {
        "bot_running": _bot_running,
        "mt5_connected": is_connected,
        "api_latency": latency,
        "account": _compile_account_data(account),
        "positions": _compile_positions_data(),
        "orders": _compile_orders_data(),
        "market_watch": _compile_market_watch_data(),
        "gates": last_cycle_data.get("gates", {}),
        "ranked_signals": last_cycle_data.get("ranked_signals", []),
        "last_cycle_time": last_cycle_data.get("time", ""),
        "system_stats": {"cpu": cpu_pct, "memory": mem_mb},
        "correlation_matrix": correlation_engine.get_matrix(),
        "performance_metrics": state_manager.get_performance_metrics()
    }

"""
    content = content[:state_start] + state_new + content[state_end:]

# 3. websocket_handler refactoring
ws_start = content.find("def websocket_endpoint")
ws_end = content.find("_web_sockets.remove(websocket)", ws_start)
if ws_end != -1:
    ws_end += len("_web_sockets.remove(websocket)")
if ws_start != -1 and ws_end != -1:
    ws_new = """def _handle_bot_commands(cmd_type: str):
    if cmd_type == "start_bot":
        start_bot_execution()
    elif cmd_type == "stop_bot":
        stop_bot_execution()
    elif cmd_type == "force_cycle":
        threading.Thread(target=process_m30_cycle, daemon=True).start()
    elif cmd_type == "panic_close":
        threading.Thread(target=close_all_positions, daemon=True).start()

def _handle_trade_commands(cmd_type: str, cmd_data: dict):
    if cmd_type == "modify_sl":
        threading.Thread(target=modify_sl, args=(int(cmd_data["ticket"]), cmd_data["symbol"], float(cmd_data["new_sl"])), daemon=True).start()
    elif cmd_type == "modify_tp":
        threading.Thread(target=modify_position_tp, args=(int(cmd_data["ticket"]), cmd_data["symbol"], float(cmd_data["new_tp"])), daemon=True).start()
    elif cmd_type == "close_position":
        threading.Thread(target=close_single_position, args=(int(cmd_data["ticket"]), cmd_data["symbol"]), daemon=True).start()
    elif cmd_type == "breakeven":
        threading.Thread(target=move_to_breakeven, args=(int(cmd_data["ticket"]), cmd_data["symbol"]), daemon=True).start()
    elif cmd_type == "partial_close":
        threading.Thread(target=close_partial_position, args=(int(cmd_data["ticket"]), cmd_data["symbol"]), daemon=True).start()

def _handle_order_commands(cmd_type: str, cmd_data: dict):
    if cmd_type == "place_order":
        threading.Thread(target=place_limit_order, args=(
            cmd_data.get("symbol"), cmd_data.get("type"), float(cmd_data.get("volume", 0.01)),
            float(cmd_data.get("price")), float(cmd_data.get("sl", 0.0)), float(cmd_data.get("tp", 0.0))
        ), daemon=True).start()
    elif cmd_type == "cancel_order":
        threading.Thread(target=cancel_pending_order, args=(int(cmd_data.get("ticket")),), daemon=True).start()

async def _process_ws_command(websocket: WebSocket, data: dict):
    cmd_type = data.get("type")
    cmd_data = data.get("data", {})
    
    if cmd_type in ["start_bot", "stop_bot", "force_cycle", "panic_close"]:
        _handle_bot_commands(cmd_type)
    elif cmd_type in ["modify_sl", "modify_tp", "close_position", "breakeven", "partial_close"]:
        _handle_trade_commands(cmd_type, cmd_data)
    elif cmd_type in ["place_order", "cancel_order"]:
        _handle_order_commands(cmd_type, cmd_data)
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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    _web_sockets.add(websocket)
    try:
        await websocket.send_json({"type": "state_update", "data": compile_system_state()})
        await websocket.send_json({"type": "log_history", "data": _log_history})
    except Exception:
        pass
        
    try:
        while True:
            data = await websocket.receive_json()
            await _process_ws_command(websocket, data)
    except WebSocketDisconnect:
        _web_sockets.remove(websocket)
    except Exception:
        if websocket in _web_sockets:
            _web_sockets.remove(websocket)"""
    content = content[:ws_start] + ws_new + content[ws_end:]

# 4. save_web_settings async file writing
content = re.sub(r'def save_web_settings\(req_settings: dict\):\n.*?with open\("config/settings\.yaml", "w"\) as f:\n.*?yaml\.dump\(req_settings, f\)', 
                 r'def save_web_settings(req_settings: dict):\n    import asyncio\n    def _write_yaml():\n        with open("config/settings.yaml", "w") as f:\n            yaml.dump(req_settings, f)\n    await asyncio.to_thread(_write_yaml)', content, flags=re.DOTALL)

# 5. create_task warning
content = content.replace("asyncio.create_task(periodical_websocket_broadcaster())", "_bg_task = asyncio.create_task(periodical_websocket_broadcaster())\n    _bg_tasks.add(_bg_task)")
# add _bg_tasks
if "_bg_tasks = set()" not in content:
    content = content.replace("main_event_loop = None", "main_event_loop = None\n_bg_tasks = set()")


with open("api_server.py", "w", encoding="utf-8") as f:
    f.write(content)

print("api_server.py refactored successfully.")
