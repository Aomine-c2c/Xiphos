import time
import datetime
import zlib
from bridge.proxy import mt5
from core.config import settings
from core.logger import log
from execution.connection import mt5_conn
from execution.orders import open_trade
from execution.trailing import trail_positions
from monitoring.scheduler import scheduler
from dashboard.cli import generate_dashboard
from indicators.moving_averages import get_m30_indicators
from strategies.trend_following import evaluate_signal
from risk.RiskSlotManager import RiskSlotManager
from risk.CorrelationGuard import CorrelationGuard
from risk.SignalPriorityEngine import SignalPriorityEngine
from state_manager import StateManager
from rich.live import Live

state_manager = StateManager()

def generate_magic(symbol: str, role_id: int) -> int:
    bucket_id = 99
    for i, (name, symbols) in enumerate(settings.correlation_groups.items()):
        if symbol in symbols:
            bucket_id = i + 1
            break
            
    asset_id = zlib.crc32(symbol.encode('utf-8')) % 1000
    # Format: 13 (Bot) | Bucket (2 digits) | Asset (3 digits) | Role (1 digit)
    return int(f"13{bucket_id:02d}{asset_id:03d}{role_id}")

last_processed_candles = {}

last_cycle_data = {
    "time": "",
    "ranked_signals": [],
    "gates": {
        "gate_1_risk_slot": "PASS",
        "gate_1_details": "0 / 4 USED",
        "gate_2_correlation": "PASS",
        "gate_2_details": "NO BLOCK",
        "gate_3_fan_alignment": "PASS",
        "gate_3_details": "VALID",
        "gate_4_priority_filter": "PASS",
        "gate_4_details": "0 SIGNALS RANKED",
        "gate_5_hard_sl": "PASS",
        "gate_5_details": "ENFORCED"
    }
}

def _evaluate_gate_1(slots_available, slots_used, slots_limit) -> bool:
    if slots_available <= 0:
        last_cycle_data["gates"]["gate_1_risk_slot"] = "FAIL"
        last_cycle_data["gates"]["gate_1_details"] = f"{slots_used} / {slots_limit} USED"
        last_cycle_data["gates"]["gate_2_correlation"] = "N/A"
        last_cycle_data["gates"]["gate_3_fan_alignment"] = "N/A"
        last_cycle_data["gates"]["gate_4_priority_filter"] = "N/A"
        last_cycle_data["gates"]["gate_4_details"] = "0 RANKED"
        last_cycle_data["ranked_signals"] = []
        log.info("Max risk slots reached. Skipping new signal evaluation.")
        return False
    
    last_cycle_data["gates"]["gate_1_risk_slot"] = "PASS"
    last_cycle_data["gates"]["gate_1_details"] = f"{slots_used} / {slots_limit} USED"
    return True

def _evaluate_gate_2():
    blocked_count = 0
    for name, symbols in settings.correlation_groups.items():
        if symbols:
            blocking = CorrelationGuard.get_blocking_positions(symbols[0], magic_filter=[135001, 135002])
            if blocking:
                blocked_count += 1
    last_cycle_data["gates"]["gate_2_correlation"] = "PASS"
    last_cycle_data["gates"]["gate_2_details"] = f"{blocked_count} BLOCKED" if blocked_count > 0 else "NO BLOCK"

def _gather_signals() -> list:
    # Only scan symbols explicitly defined in settings.yaml correlation_groups
    all_symbols = []
    for group_symbols in settings.correlation_groups.values():
        all_symbols.extend(group_symbols)
    
    signals = []
    for sym in all_symbols:
        info = mt5.symbol_info(sym)
        if not info or info.volume_min > 0.01:
            if info and info.volume_min > 0.01:
                log.debug(f"Skipping {sym} - volume_min {info.volume_min} > 0.01")
            continue
            
        ind_data = get_m30_indicators(sym)
        if not ind_data:
            continue
            
        candle_time = ind_data.get('time', 0)
        if candle_time <= last_processed_candles.get(sym, 0):
            continue
            
        signal = evaluate_signal(ind_data)
        if signal:
            signals.append({"symbol": sym, "type": signal, "ind_data": ind_data})
    return signals

def _evaluate_gate_3(signals) -> bool:
    if not signals:
        last_cycle_data["gates"]["gate_3_fan_alignment"] = "FAIL"
        last_cycle_data["gates"]["gate_3_details"] = "NO SIGNAL"
        last_cycle_data["gates"]["gate_4_priority_filter"] = "N/A"
        last_cycle_data["gates"]["gate_4_details"] = "0 RANKED"
        last_cycle_data["ranked_signals"] = []
        log.info("No valid signals detected on this cycle.")
        return False
        
    last_cycle_data["gates"]["gate_3_fan_alignment"] = "PASS"
    last_cycle_data["gates"]["gate_3_details"] = f"{len(signals)} ALIGNED"
    return True

def _build_ranked_signal_payload(ranked_signals) -> list:
    return [{
        "priority": i + 1,
        "symbol": sig["symbol"],
        "direction": sig["type"],
        "price": sig["ind_data"]["close"],
        "sma200": sig["ind_data"]["sma_slow"],
        "distance": int(sig["distance"] / (mt5.symbol_info(sig["symbol"]).point if mt5.symbol_info(sig["symbol"]) else 0.00001)),
        "projected_risk": sig["projected_risk"],
        "status": "PENDING"
    } for i, sig in enumerate(ranked_signals)]

def _execute_signal(sig, slots_available, open_counts, session_blocked_buckets) -> int:
    ind = sig["ind_data"]
    typ = sig["type"]
    
    # === ASYMMETRICAL STOP LOSS ===
    # Scalper SL: candle extreme (tight = "lose pennies")   → trails 50 EMA
    # Runner  SL: 200 SMA (wide = let it breathe)           → trails 200 SMA until macro trend dies
    if typ == "BUY":
        sl_a = ind["low"]       # Scalper — candle low
        sl_b = ind["sma_slow"]  # Runner  — 200 SMA
    else:
        sl_a = ind["high"]      # Scalper — candle high
        sl_b = ind["sma_slow"]  # Runner  — 200 SMA
    
    sym = sig["symbol"]
    
    bucket_name = None
    for name, symbols in settings.correlation_groups.items():
        if sym in symbols:
            bucket_name = name
            break
            
    if bucket_name in session_blocked_buckets:
        log.info(f"Skipping {sym} - bucket {bucket_name} was dynamically blocked in this exact cycle.")
        return 0
        
    # Time-of-Day Filter (Fiat Kill Zone)
    sess = settings.session_filter
    if sess.enabled and bucket_name not in sess.exempt_groups:
        current_hour = datetime.datetime.now(datetime.timezone.utc).hour
        if not (sess.start_hour <= current_hour < sess.end_hour):
            log.info(f"Skipping {sym} - outside allowed fiat session ({current_hour} UTC is not between {sess.start_hour}-{sess.end_hour}).")
            return 0
    
    open_count = open_counts.get(sym, 0)
    if open_count >= 2:
        log.info(f"Skipping {sym} - 2 or more trades already open.")
        return 0
        
    if CorrelationGuard.is_bucket_blocked(sym):
        return 0
        
    slots_consumed = 0
    magic_a = generate_magic(sym, 1)
    magic_b = generate_magic(sym, 2)
    
    tick = mt5.symbol_info_tick(sym)
    if tick:
        entry_price = tick.ask if typ == "BUY" else tick.bid
    else:
        entry_price = ind["close"]
    
    # HARDCODED FIX: 0.01 Fixed Lot
    lot_a = 0.01
    lot_b = 0.01
    
    order_type = mt5.ORDER_TYPE_BUY if typ == "BUY" else mt5.ORDER_TYPE_SELL
    
    # Trade A (Scalper)
    if open_count < 2 and slots_available > 0:
        sl_scalper = round(float(sl_a), 5)
        # HARD RISK CAP: Reject if risk > $10.00
        risk_a = mt5.order_calc_profit(order_type, sym, lot_a, entry_price, sl_scalper)
        if risk_a is not None and abs(risk_a) > 10.0:
            log.warning(f"Skipping {sym} Scalper - Stop Loss distance too large (Risk: ${abs(risk_a):.2f} > $10 Cap)")
        else:
            res_a = open_trade(sym, typ, lot_a, sl_scalper, magic_a, sig=sig)
            if res_a:
                open_count += 1
                slots_consumed += 1
    
    # Trade B (Runner)
    if open_count < 2 and slots_available > slots_consumed:
        sl_runner = round(float(sl_b), 5)
        # HARD RISK CAP: Reject if risk > $10.00
        risk_b = mt5.order_calc_profit(order_type, sym, lot_b, entry_price, sl_runner)
        if risk_b is not None and abs(risk_b) > 10.0:
            log.warning(f"Skipping {sym} Runner - Stop Loss distance too large (Risk: ${abs(risk_b):.2f} > $10 Cap)")
        else:
            res_b = open_trade(sym, typ, lot_b, sl_runner, magic_b, sig=sig)
            if res_b:
                open_count += 1
                slots_consumed += 1

    if slots_consumed > 0:
        last_processed_candles[sym] = sig['ind_data'].get('time', 0)
        if bucket_name:
            session_blocked_buckets.add(bucket_name)
        for rs in last_cycle_data["ranked_signals"]:
            if rs["symbol"] == sym:
                rs["status"] = "APPROVED"
                
    return slots_consumed

def process_m30_cycle(): # NOSONAR
    log.info("M30 Candle Close Detected. Initiating Evaluation Cycle...")
    
    last_cycle_data["time"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    last_cycle_data["gates"]["gate_5_hard_sl"] = "PASS"
    last_cycle_data["gates"]["gate_5_details"] = "ENFORCED"
    
    if not mt5_conn.check_health():
        return
        
    slots_limit = settings.trading.max_risk_trades
    slots_available = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
    slots_used = slots_limit - slots_available
    
    if not _evaluate_gate_1(slots_available, slots_used, slots_limit):
        return

    _evaluate_gate_2()
    
    positions = mt5.positions_get()
    
    # Sync database with MT5 reality
    state_manager.reconcile(positions)
    
    open_counts = {}
    if positions:
        for p in positions:
            open_counts[p.symbol] = open_counts.get(p.symbol, 0) + 1

    signals = _gather_signals()
    
    if not _evaluate_gate_3(signals):
        return

    ranked_signals = SignalPriorityEngine.rank_signals(signals)
    last_cycle_data["gates"]["gate_4_priority_filter"] = "PASS"
    last_cycle_data["gates"]["gate_4_details"] = f"{len(ranked_signals)} RANKED"
    last_cycle_data["ranked_signals"] = _build_ranked_signal_payload(ranked_signals)
    
    session_blocked_buckets = set()
    
    for sig in ranked_signals:
        if slots_available <= 0:
            log.info("Risk slots exhausted during execution phase.")
            break
            
        slots_consumed = _execute_signal(sig, slots_available, open_counts, session_blocked_buckets)
        
        if slots_consumed > 0:
            slots_available -= slots_consumed
            log.info(f"Slots remaining after {sig['symbol']}: {max(0, slots_available)}")
        else:
            log.warning(f"Orders failed or skipped for {sig['symbol']}. Slots unchanged: {slots_available}")


def main():
    log.info("Initializing Xiphos Trading Framework...")
    
    if not mt5_conn.connect():
        log.critical("Startup failed.")
        return
        
    scheduler.add_m30_job(process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    
    try:
        with Live(generate_dashboard(), refresh_per_second=1) as live:
            while True:
                live.update(generate_dashboard())
                time.sleep(1)
    except KeyboardInterrupt:
        log.info("Keyboard interrupt received. Shutting down...")
    finally:
        scheduler.stop()
        mt5_conn.disconnect()
        log.info("Xiphos Framework offline.")

if __name__ == "__main__":
    main()
