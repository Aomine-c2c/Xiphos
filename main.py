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
from risk.slots import calculate_available_slots
from risk.correlation import is_correlation_blocked
from risk.priority import rank_signals

from rich.live import Live

def process_m30_cycle():
    log.info("M30 Candle Close Detected. Initiating Evaluation Cycle...")
    
    if not mt5_conn.check_health():
        return
        
    slots_available = calculate_available_slots()
    if slots_available <= 0:
        log.info("Max risk slots reached. Skipping new signal evaluation.")
        return
        
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
    ranked_signals = rank_signals(signals)
    
    # Execute until slots exhausted
    for sig in ranked_signals:
        if slots_available <= 0:
            log.info("Risk slots exhausted during execution phase.")
            break
            
        sym = sig["symbol"]
        typ = sig["type"]
        
        if is_correlation_blocked(sym):
            continue
            
        # Initial SL behind 50 EMA
        sl_price = sig['ind_data']['ema_medium'] 
        sl_price = round(float(sl_price), 5)
        
        log.info(f"Executing {typ} for {sym} based on priority ranking.")
        
        # Trade A (Scalper)
        res_a = open_trade(sym, typ, settings.trading.lot_size, sl_price, settings.magic_numbers.scalper)
        
        # Trade B (Runner)
        res_b = open_trade(sym, typ, settings.trading.lot_size, sl_price, settings.magic_numbers.runner)
        
        # Only consume slots when trades actually land
        if res_a or res_b:
            slots_available -= 2
            log.info(f"Slots remaining after {sym}: {max(0, slots_available)}")
        else:
            log.warning(f"Both orders failed for {sym}. Slots unchanged: {slots_available}")


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
