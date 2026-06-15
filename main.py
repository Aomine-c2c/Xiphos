import time
import MetaTrader5 as mt5
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
from risk.risk_manager import CorrelationGuard
from risk.priority import SignalPriorityEngine

from rich.live import Live

def process_m30_cycle():
    log.info("M30 Candle Close Detected. Initiating Evaluation Cycle...")
    
    if not mt5_conn.check_health():
        return
        
    slots_available = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
    if slots_available <= 0:
        log.info("Max risk slots reached. Skipping new signal evaluation.")
        return
        
    # Get currently open trades count per symbol to prevent duplication
    positions = mt5.positions_get()
    open_counts = {}
    if positions:
        for p in positions:
            open_counts[p.symbol] = open_counts.get(p.symbol, 0) + 1
        
    all_symbols = []
    for bucket in settings.correlation_groups.values():
        all_symbols.extend(bucket)
        
    signals = []
    
    for sym in all_symbols:
        info = mt5.symbol_info(sym)
        if not info:
            log.warning(f"Failed to fetch info for {sym}")
            continue
            
        if info.volume_min > 0.01:
            log.debug(f"Skipping {sym} - volume_min {info.volume_min} > 0.01")
            continue
            
        ind_data = get_m30_indicators(sym)
        if not ind_data:
            continue
            
        signal = evaluate_signal(ind_data)
        
        if signal:
            signals.append({
                "symbol": sym,
                "type": signal,
                "ind_data": ind_data
            })
            
    if not signals:
        log.info("No valid signals detected on this cycle.")
        return
        
    # Prioritize signals
    ranked_signals = SignalPriorityEngine.rank_signals(signals)
    
    # Execute until slots exhausted
    for sig in ranked_signals:
        if slots_available <= 0:
            log.info("Risk slots exhausted during execution phase.")
            break
            
        sym = sig["symbol"]
        typ = sig["type"]
        
        open_count = open_counts.get(sym, 0)
        if open_count >= 2:
            log.info(f"Skipping {sym} - 2 or more trades already open (preventing duplication).")
            continue
            
        if CorrelationGuard.is_blocked(sym):
            continue
            
        res_a = None
        res_b = None
        slots_consumed = 0
            
        # Trade A (Scalper)
        if open_count < 2 and slots_available > 0:
            sl_scalper = round(float(sig['ind_data']['sma_slow']), 5)
            res_a = open_trade(sym, typ, 0.01, sl_scalper, 135001)
            if res_a:
                open_count += 1
                slots_consumed += 1
        
        # Trade B (Runner) trails the slow SMA to capture the broader trend
        if open_count < 2 and slots_available > slots_consumed:
            sl_runner = round(float(sig['ind_data']['sma_slow']), 5)
            res_b = open_trade(sym, typ, 0.01, sl_runner, 135002)
            if res_b:
                open_count += 1
                slots_consumed += 1
        
        # Only consume slots when trades actually land
        if slots_consumed > 0:
            slots_available -= slots_consumed
            log.info(f"Slots remaining after {sym}: {max(0, slots_available)}")
        else:
            log.warning(f"Orders failed or skipped for {sym}. Slots unchanged: {slots_available}")


def main():
    log.info("Initializing Xiphos Trading Framework...")
    
    if not mt5_conn.connect():
        log.critical("Startup failed.")
        return
        
    # Register jobs
    scheduler.add_m30_job(process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    
    # Start scheduler in background thread
    scheduler.start()
    
    # Start Rich Live dashboard in main thread
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
