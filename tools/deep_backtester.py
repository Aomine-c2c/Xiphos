import pandas as pd
import MetaTrader5 as mt5
from datetime import datetime, timedelta
import pytz
import time
import csv
import numpy as np
import os
import yaml
from sqlalchemy import create_engine
from core.config import settings as config_settings

def calculate_atr(df, period=14):
    df = df.copy()
    df['H-L'] = df['high'] - df['low']
    df['H-C'] = np.abs(df['high'] - df['close'].shift(1))
    df['L-C'] = np.abs(df['low'] - df['close'].shift(1))
    df['TR'] = df[['H-L', 'H-C', 'L-C']].max(axis=1)
    return df['TR'].rolling(window=period).mean()

def run_deep_backtest(): # NOSONAR # noqa: C901
    if not mt5.initialize():
        print("MT5 Init Failed")
        return
        
    print("Fetching decided symbols from settings.yaml...")
    import yaml
    with open('config/settings.yaml', 'r') as f:
        settings = yaml.safe_load(f)
        
    symbols = []
    for grp_name, syms in settings['correlation_groups'].items():
        symbols.extend(syms)
        
    symbols = list(set(symbols)) # Remove any accidental duplicates
    print(f"Found {len(symbols)} eligible symbols.")
    
    # Fetch data (10000 candles = ~9 months on M30)
    m30_count = 10000
    
    m30_data = {}
    symbol_types = {} # To detect 24/7 vs 5-Day
    all_m30_timestamps = set()
    
    print("Downloading historical data...")
    for sym in symbols:
        mt5.symbol_select(sym, True)
        rates_m30 = None
        for _ in range(3):
            rates_m30 = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_M30, 0, m30_count)
            if rates_m30 is not None and len(rates_m30) > 0:
                break
            time.sleep(0.5)
            
        if rates_m30 is None or len(rates_m30) == 0:
            print(f"No data for {sym}, skipping.")
            continue
            
        df_m30 = pd.DataFrame(rates_m30)
        df_m30['time'] = pd.to_datetime(df_m30['time'], unit='s')
        
        # Calculate indicators
        df_m30['ema_fast'] = df_m30['close'].ewm(span=13, adjust=False).mean()
        df_m30['ema_medium'] = df_m30['close'].ewm(span=50, adjust=False).mean()
        df_m30['sma_slow'] = df_m30['close'].rolling(window=200).mean()
        df_m30['atr_14'] = calculate_atr(df_m30, 14)
        
        # Check if 24/7 (look for Sunday candles)
        sunday_candles = df_m30[df_m30['time'].dt.dayofweek == 6]
        is_24_7 = len(sunday_candles) > (m30_count / 100) # Threshold to confirm it trades on weekends
        symbol_types[sym] = is_24_7
        
        sym_info = mt5.symbol_info(sym)
        point = sym_info.point if sym_info else 0.00001
        df_m30['point'] = point
        
        category = sym_info.path.split('\\')[0] if sym_info else "Unknown"
        df_m30['category'] = category
        
        df_m30.set_index('time', inplace=True)
        m30_data[sym] = df_m30
        
        all_m30_timestamps.update(df_m30.index.tolist())
        
    sorted_times = sorted(list(all_m30_timestamps))
    print(f"Total M30 cycles to evaluate: {len(sorted_times)}")
    
    open_trades = []
    trade_history = []
    
    for i, current_time in enumerate(sorted_times):
        if i % 1000 == 0:
            print(f"Processing cycle {i}/{len(sorted_times)}...")
            
        # 1. Check SL hits
        if i > 0:
            trades_to_remove = []
            for t in open_trades:
                sym = t['symbol']
                df30 = m30_data[sym]
                if current_time not in df30.index: continue
                
                row = df30.loc[current_time]
                
                # Check SL
                if t['type'] == 'BUY' and row['low'] <= t['sl']:
                    t['exit_price'] = t['sl']
                    t['exit_time'] = current_time
                    t['profit'] = (t['exit_price'] - t['entry_price']) / t['point'] * t['volume'] * 100000
                    t['status'] = 'CLOSED_SL'
                    trades_to_remove.append(t)
                elif t['type'] == 'SELL' and row['high'] >= t['sl']:
                    t['exit_price'] = t['sl']
                    t['exit_time'] = current_time
                    t['profit'] = (t['entry_price'] - t['exit_price']) / t['point'] * t['volume'] * 100000
                    t['status'] = 'CLOSED_SL'
                    trades_to_remove.append(t)
                
            for tr in trades_to_remove:
                open_trades.remove(tr)
                trade_history.append(tr)
        
        # 2. Open Trades
        open_counts = {}
        for t in open_trades:
            open_counts[t['symbol']] = open_counts.get(t['symbol'], 0) + 1
            
        for sym, df30 in m30_data.items():
            if current_time not in df30.index: continue
            pos_idx = df30.index.get_loc(current_time)
            if pos_idx < 1: continue
            
            prev_candle = df30.iloc[pos_idx - 1]
            if pd.isna(prev_candle['sma_slow']) or pd.isna(prev_candle['atr_14']): continue
            
            close = prev_candle['close']
            ema13 = prev_candle['ema_fast']
            ema50 = prev_candle['ema_medium']
            sma200 = prev_candle['sma_slow']
            atr_buf = 1.5 * prev_candle['atr_14']
            point = prev_candle['point']
            
            signal = "NONE"
            if close > ema13 and ema13 > ema50 and ema50 > sma200:
                signal = "BUY"
            elif close < ema13 and ema13 < ema50 and ema50 < sma200:
                signal = "SELL"
                
            if signal == "NONE": continue
            
            # Kill Zone logic (exempt 24/7)
            if not symbol_types[sym]:
                current_hour = current_time.hour
                if not (8 <= current_hour < 16):
                    continue
                    
            if open_counts.get(sym, 0) >= 2: continue
            
            dist = abs(close - sma200) / point
            if dist > 8000: continue
            
            current_price = df30.loc[current_time, 'open']
            
            # Initial SL with ATR buffer
            sl_a = ema50
            sl_b = sma200
            if signal == 'BUY':
                sl_a -= atr_buf
                sl_b -= atr_buf
            else:
                sl_a += atr_buf
                sl_b += atr_buf
            
            category = df30['category'].iloc[0]
            
            trade_a = {
                'symbol': sym, 'type': signal, 'role': 'Scalper', 'category': category, 'entry_time': current_time,
                'entry_price': current_price, 'sl': sl_a, 'volume': 0.01,
                'point': point, 'status': 'OPEN'
            }
            trade_b = {
                'symbol': sym, 'type': signal, 'role': 'Runner', 'category': category, 'entry_time': current_time,
                'entry_price': current_price, 'sl': sl_b, 'volume': 0.01,
                'point': point, 'status': 'OPEN'
            }
            open_trades.extend([trade_a, trade_b])
            open_counts[sym] = open_counts.get(sym, 0) + 2

        # 3. Trail SL
        for t in open_trades:
            sym = t['symbol']
            if current_time not in m30_data[sym].index: continue
            candle = m30_data[sym].loc[current_time]
            atr_buf = 1.5 * candle['atr_14']
            
            if t['role'] == 'Scalper':
                base_sl = candle['ema_medium']
            else:
                base_sl = candle['sma_slow']
                
            if t['type'] == 'BUY':
                new_sl = base_sl - atr_buf
            else:
                new_sl = base_sl + atr_buf
                
            # Smart Trailing for Runner (Breakeven overrides)
            if t['role'] == 'Runner':
                if t['type'] == 'BUY':
                    if candle['ema_medium'] > t['entry_price']:
                        new_sl = candle['ema_medium'] - atr_buf
                    elif candle['ema_fast'] > t['entry_price']:
                        new_sl = t['entry_price']
                elif t['type'] == 'SELL':
                    if candle['ema_medium'] < t['entry_price']:
                        new_sl = candle['ema_medium'] + atr_buf
                    elif candle['ema_fast'] < t['entry_price']:
                        new_sl = t['entry_price']
                        
            # Apply trail
            if (t['type'] == 'BUY' and new_sl > t['sl']) or (t['type'] == 'SELL' and new_sl < t['sl']):
                t['sl'] = new_sl

    for t in open_trades:
        sym = t['symbol']
        t['exit_price'] = m30_data[sym]['close'].iloc[-1]
        if t['type'] == 'BUY':
            t['profit'] = (t['exit_price'] - t['entry_price']) / t['point'] * t['volume'] * 100000
        else:
            t['profit'] = (t['entry_price'] - t['exit_price']) / t['point'] * t['volume'] * 100000
        t['status'] = 'CLOSED_END'
        trade_history.append(t)
        
    print("\n--- Deep Backtest Complete ---")
    print(f"Total Trades: {len(trade_history)}")
    
    if len(trade_history) > 0:
        df_res = pd.DataFrame(trade_history)
        try:
            engine = create_engine(config_settings.database.url)
            df_res.to_sql("backtest_trades", con=engine, if_exists="append", index=False)
            print("Results saved to PostgreSQL (backtest_trades table)")
        except Exception as e:
            print(f"PostgreSQL write failed: {e}. Falling back to CSV.")
            df_res.to_csv("deep_backtest_results.csv", index=False)

if __name__ == "__main__":
    run_deep_backtest()
