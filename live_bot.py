import time
import math
from datetime import datetime, timedelta
import pandas as pd
import MetaTrader5 as mt5

from logger_setup import setup_logger
from mt5_executor import MT5Executor
from state_manager import StateManager
from core.config import settings

logger = setup_logger()

SYMBOLS = []
CORRELATION_GROUPS = {}

for group_name, symbols in settings.correlation_groups.items():
    SYMBOLS.extend(symbols)
    for sym in symbols:
        CORRELATION_GROUPS[sym] = group_name

MAX_ACTIVE_RISK_TRADES = 4
MAX_POSITIONS_PER_SYMBOL = 2

MAGIC_SCALPER = 135001
MAGIC_RUNNER = 135002

class LiveBot:
    def __init__(self):
        self.executor = MT5Executor()
        self.state = StateManager()
        
    def get_market_data(self):
        data = {}
        for sym in SYMBOLS:
            if not mt5.symbol_select(sym, True):
                continue
                
            info = mt5.symbol_info(sym)
            if not info:
                continue
                
            if info.volume_min > 0.01:
                logger.debug(f"Skipping {sym} - volume_min {info.volume_min} > 0.01")
                continue

            rates = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_M30, 0, 250)
            if rates is not None and len(rates) > 0:
                df = pd.DataFrame(rates)
                df['ema_13'] = df['close'].ewm(span=13, adjust=False).mean()
                df['ema_50'] = df['close'].ewm(span=50, adjust=False).mean()
                df['sma_200'] = df['close'].rolling(window=200).mean()
                
                point_val = (1.0 / info.point) if info.point > 0 else 100000.0
                
                data[sym] = {
                    "close": df.iloc[-1]['close'],
                    "ema_13": df.iloc[-1]['ema_13'],
                    "ema_50": df.iloc[-1]['ema_50'],
                    "sma_200": df.iloc[-1]['sma_200'],
                    "point_value": point_val,
                    "volume_min": info.volume_min,
                    "volume_step": info.volume_step,
                    "volume_max": info.volume_max
                }
        return data

    def calculate_lot_size(self, symbol_data):
        """
        Step Scaling logic based on account balance.
        1x the volume_min for every $100 in the account.
        """
        account_info = mt5.account_info()
        if not account_info:
            logger.warning("Failed to fetch account info. Defaulting to volume_min.")
            return symbol_data["volume_min"]
            
        balance = account_info.balance
        multiplier = math.floor(balance / 100.0)
        
        if multiplier < 1:
            multiplier = 1
            
        raw_lot = symbol_data["volume_min"] * multiplier
        
        # Round to valid volume step
        step = symbol_data["volume_step"]
        if step > 0:
            decimals = abs(int(math.log10(step))) if step < 1 else 0
            lot_size = round(math.floor(raw_lot / step) * step, decimals)
        else:
            lot_size = raw_lot
            
        # Ensure within bounds
        lot_size = max(symbol_data["volume_min"], min(lot_size, symbol_data["volume_max"]))
        
        return lot_size

    def has_active_risk(self, trade):
        entry = trade["entry_price"]
        sl = trade["sl_price"]
        if trade["type"] == "BUY":
            return sl < entry
        else:
            return sl > entry

    def evaluate_gates_and_execute(self):
        logger.info("Evaluating M30 boundaries...")
        
        positions = self.executor.get_open_positions()
        self.state.reconcile(positions)
        open_trades = self.state.state["open_trades"]
        
        active_risk_count = sum(1 for t in open_trades.values() if self.has_active_risk(t))
        available_slots = max(0, MAX_ACTIVE_RISK_TRADES - active_risk_count)
        logger.info(f"Active Risk Slots: {active_risk_count}/{MAX_ACTIVE_RISK_TRADES}")
        
        mkt_data = self.get_market_data()
        if not mkt_data:
            logger.warning("No market data fetched. Aborting evaluation.")
            return
            
        # 1. Update Trailing Stops
        for ticket, trade in open_trades.items():
            sym = trade["symbol"]
            if sym not in mkt_data:
                continue
            
            new_sl = None
            if trade["magic"] == MAGIC_SCALPER:
                new_sl = mkt_data[sym]["ema_50"]
            elif trade["magic"] == MAGIC_RUNNER:
                new_sl = mkt_data[sym]["sma_200"]
                
            if new_sl:
                should_update = False
                if trade["type"] == "BUY" and new_sl > trade["sl_price"]:
                    should_update = True
                elif trade["type"] == "SELL" and new_sl < trade["sl_price"]:
                    should_update = True
                    
                if should_update:
                    logger.info(f"Trailing SL for {sym} ({ticket}): {trade['sl_price']:.5f} -> {new_sl:.5f}")
                    res = self.executor.modify_sl(int(ticket), sym, new_sl)
                    if res:
                        self.state.update_sl(ticket, new_sl)
        
        if available_slots < 2:
            return

        valid_signals = []
        for sym, dat in mkt_data.items():
            if sum(1 for t in open_trades.values() if t["symbol"] == sym) >= MAX_POSITIONS_PER_SYMBOL:
                continue
                
            signal = None
            if dat["close"] > dat["ema_13"] > dat["ema_50"] > dat["sma_200"]:
                signal = "BUY"
            elif dat["close"] < dat["ema_13"] < dat["ema_50"] < dat["sma_200"]:
                signal = "SELL"
                
            if not signal:
                continue
                
            group = CORRELATION_GROUPS.get(sym)
            blocked = False
            for t in open_trades.values():
                if self.has_active_risk(t) and CORRELATION_GROUPS.get(t["symbol"]) == group and t["symbol"] != sym:
                    blocked = True
                    break
            if blocked:
                logger.info(f"Signal for {sym} blocked by Correlation Guard (Group: {group}).")
                continue
                
            lot_size = self.calculate_lot_size(dat)
            dist = abs(dat["close"] - dat["sma_200"])
            risk = dist * lot_size * dat["point_value"] * 2
            valid_signals.append((sym, signal, dat, dist, risk, lot_size))
            
        if not valid_signals:
            return
            
        valid_signals.sort(key=lambda x: x[3]) # Sort by distance
        
        for s in valid_signals:
            if available_slots < 2:
                break
                
            sym, signal, dat, dist, risk, lot_size = s
            sl_price = dat["sma_200"]
            
            logger.info(f"Entering {signal} on {sym} | Lot: {lot_size} | SL: {sl_price:.5f} | Projected Risk: ${risk:.2f}")
            
            res_a = self.executor.execute_market_order(sym, signal, lot_size, sl_price, MAGIC_SCALPER)
            if res_a:
                self.state.add_trade(res_a.order, sym, signal, res_a.price, sl_price, MAGIC_SCALPER)
                
            res_b = self.executor.execute_market_order(sym, signal, lot_size, sl_price, MAGIC_RUNNER)
            if res_b:
                self.state.add_trade(res_b.order, sym, signal, res_b.price, sl_price, MAGIC_RUNNER)
                
            available_slots -= 2

def wait_until_next_m30():
    now = datetime.now()
    if now.minute < 30:
        next_run = now.replace(minute=30, second=0, microsecond=0)
    else:
        next_run = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
        
    wait_seconds = (next_run - now).total_seconds()
    logger.info(f"Sleeping for {wait_seconds:.0f} seconds until next M30 candle ({next_run.strftime('%H:%M:%S')})")
    time.sleep(wait_seconds)

def main():
    logger.info("Live Production Bot Started. (Expanded Assets & Step Scaling)")
    bot = LiveBot()
    
    bot.evaluate_gates_and_execute()
    
    while True:
        try:
            wait_until_next_m30()
            time.sleep(5) 
            bot.evaluate_gates_and_execute()
        except KeyboardInterrupt:
            logger.info("Bot stopped by user.")
            mt5.shutdown()
            break
        except Exception as e:
            logger.error(f"Critical error in main loop: {e}", exc_info=True)
            time.sleep(60)

if __name__ == "__main__":
    main()
