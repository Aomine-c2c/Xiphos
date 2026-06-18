import pandas as pd
import MetaTrader5 as mt5
import yaml
import time

def load_settings():
    with open('config/settings.yaml', 'r') as f:
        return yaml.safe_load(f)

def run_backtest():
    settings = load_settings()
    
    if not mt5.initialize():
        print("MT5 Init Failed")
        return
        
    symbols = []
    bucket_map = {}
    for grp_name, syms in settings['correlation_groups'].items():
        for s in syms:
            symbols.append(s)
            bucket_map[s] = grp_name
            
    # Remove duplicates
    symbols = list(set(symbols))
    
    days = 90
    m30_count = days * 48
    
    print(f"Fetching {days} days of M30 data for {len(symbols)} symbols...")
    
    m30_data = {}
    all_m30_timestamps = set()
    
    for sym in symbols:
        mt5.symbol_select(sym, True)
        rates_m30 = None
        for _ in range(3):
            rates_m30 = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_M30, 0, m30_count)
            if rates_m30 is not None and len(rates_m30) > 0:
                break
            time.sleep(1)
            
        if rates_m30 is None or len(rates_m30) == 0:
            print(f"No data for {sym}, skipping.")
            continue
            
        df_m30 = pd.DataFrame(rates_m30)
        df_m30['time'] = pd.to_datetime(df_m30['time'], unit='s')
        
        df_m30['ema_fast'] = df_m30['close'].ewm(span=13, adjust=False).mean()
        df_m30['ema_medium'] = df_m30['close'].ewm(span=50, adjust=False).mean()
        df_m30['sma_slow'] = df_m30['close'].rolling(window=200).mean()
        
        # Calculate point to convert distance
        sym_info = mt5.symbol_info(sym)
        point = sym_info.point if sym_info else 0.00001
        df_m30['point'] = point
        
        df_m30.set_index('time', inplace=True)
        m30_data[sym] = df_m30
        
        all_m30_timestamps.update(df_m30.index.tolist())
        
    sorted_times = sorted(all_m30_timestamps)
    print(f"Total M30 cycles to evaluate: {len(sorted_times)}")
    
    # State tracking
    open_trades = []  # dicts of active trades
    trade_history = []
    
    # Start simulation
    for i, current_time in enumerate(sorted_times):
        if i % 1000 == 0:
            print(f"Processing cycle {i}/{len(sorted_times)}...")
            
        # 1. Update existing trades using M1 data up to this M30 candle
        # We process the 30 minutes of M1 data between the previous M30 cycle and this one.
        if i > 0:
            trades_to_remove = []
            for t in open_trades:
                sym = t['symbol']
                df30 = m30_data[sym]
                if current_time not in df30.index: continue
                
                row = df30.loc[current_time]
                
                # Check SL using M30 High/Low
                if t['type'] == 'BUY' and row['low'] <= t['sl']:
                    t['exit_price'] = t['sl']
                    t['exit_time'] = current_time
                    t['profit'] = (t['exit_price'] - t['entry_price']) / t['point'] * t['volume'] * 100000
                    t['status'] = 'CLOSED_SL'
                    trades_to_remove.append(t)
                    continue
                elif t['type'] == 'SELL' and row['high'] >= t['sl']:
                    t['exit_price'] = t['sl']
                    t['exit_time'] = current_time
                    t['profit'] = (t['entry_price'] - t['exit_price']) / t['point'] * t['volume'] * 100000
                    t['status'] = 'CLOSED_SL'
                    trades_to_remove.append(t)
                    continue
                    
                # Update MFE/MAE
                if t['type'] == 'BUY':
                    curr_profit = (row['high'] - t['entry_price']) / t['point'] * t['volume'] * 100000
                    t['mfe'] = max(t['mfe'], curr_profit)
                    curr_loss = (row['low'] - t['entry_price']) / t['point'] * t['volume'] * 100000
                    t['mae'] = min(t['mae'], curr_loss)
                else:
                    curr_profit = (t['entry_price'] - row['low']) / t['point'] * t['volume'] * 100000
                    t['mfe'] = max(t['mfe'], curr_profit)
                    curr_loss = (t['entry_price'] - row['high']) / t['point'] * t['volume'] * 100000
                    t['mae'] = min(t['mae'], curr_loss)
                
            for tr in trades_to_remove:
                if tr in open_trades:
                    open_trades.remove(tr)
                    trade_history.append(tr)
        
        # 2. Evaluate signals at current M30 candle
        # Group open trades by symbol and bucket
        open_counts = {}
        active_buckets = set()
        for t in open_trades:
            sym = t['symbol']
            open_counts[sym] = open_counts.get(sym, 0) + 1
            if t['is_risk_bearing']:
                active_buckets.add(bucket_map[sym])
                
        for sym, df30 in m30_data.items():
            if current_time not in df30.index: continue
            
            # Use the PREVIOUS closed candle for signal evaluation to match live bot
            pos_idx = df30.index.get_loc(current_time)
            if pos_idx < 1: continue
            
            prev_candle = df30.iloc[pos_idx - 1]
            if pd.isna(prev_candle['sma_slow']): continue
            
            close = prev_candle['close']
            ema13 = prev_candle['ema_fast']
            ema50 = prev_candle['ema_medium']
            sma200 = prev_candle['sma_slow']
            point = prev_candle['point']
            
            signal = "NONE"
            if close > ema13 and ema13 > ema50 and ema50 > sma200:
                signal = "BUY"
            elif close < ema13 and ema13 < ema50 and ema50 < sma200:
                signal = "SELL"
                
            if signal == "NONE": continue
            
            # Check gates
            bucket = bucket_map[sym]
            
            # Time-of-Day Filter
            sess = settings.get('session_filter', {})
            if sess.get('enabled', True) and bucket not in sess.get('exempt_groups', []):
                current_hour = current_time.hour
                if not (sess.get('start_hour', 8) <= current_hour < sess.get('end_hour', 16)):
                    continue
            
            if bucket in active_buckets: continue  # Gate 2: Correlation
            
            if open_counts.get(sym, 0) >= 2: continue
            
            dist = abs(close - sma200) / point
            if dist > 8000: continue  # Gate 5 max risk approx
            
            # Execute Trade A and B
            current_price = df30.loc[current_time, 'open'] # Fill at open of current candle
            
            trade_a = {
                'symbol': sym, 'type': signal, 'role': 'Scalper', 'entry_time': current_time,
                'entry_price': current_price, 'sl': sma200, 'volume': 0.01,
                'mfe': 0, 'mae': 0, 'is_risk_bearing': True, 'point': point, 'status': 'OPEN'
            }
            trade_b = {
                'symbol': sym, 'type': signal, 'role': 'Runner', 'entry_time': current_time,
                'entry_price': current_price, 'sl': sma200, 'volume': 0.01,
                'mfe': 0, 'mae': 0, 'is_risk_bearing': True, 'point': point, 'status': 'OPEN'
            }
            open_trades.extend([trade_a, trade_b])
            open_counts[sym] = open_counts.get(sym, 0) + 2
            active_buckets.add(bucket)

        # 3. Trail SL for active trades at the close of M30
        for t in open_trades:
            sym = t['symbol']
            if current_time not in m30_data[sym].index: continue
            candle = m30_data[sym].loc[current_time]
            
            if t['role'] == 'Scalper':
                new_sl = candle['ema_medium']
            else:
                new_sl = candle['sma_slow']
                # Smart Trailing for Runner
                if t['type'] == 'BUY':
                    if candle['ema_medium'] > t['entry_price']:
                        new_sl = candle['ema_medium']
                    elif candle['ema_fast'] > t['entry_price']:
                        new_sl = t['entry_price']
                elif t['type'] == 'SELL':
                    if candle['ema_medium'] < t['entry_price']:
                        new_sl = candle['ema_medium']
                    elif candle['ema_fast'] < t['entry_price']:
                        new_sl = t['entry_price']
                
            # Trail logic
            if t['type'] == 'BUY' and new_sl > t['sl']:
                t['sl'] = new_sl
            elif t['type'] == 'SELL' and new_sl < t['sl']:
                t['sl'] = new_sl
                
            # Update risk-bearing status
            if t['type'] == 'BUY' and t['sl'] >= t['entry_price']:
                t['is_risk_bearing'] = False
            elif t['type'] == 'SELL' and t['sl'] <= t['entry_price']:
                t['is_risk_bearing'] = False

    # Force close remaining
    for t in open_trades:
        sym = t['symbol']
        t['exit_price'] = m30_data[sym]['close'].iloc[-1]
        if t['type'] == 'BUY':
            t['profit'] = (t['exit_price'] - t['entry_price']) / t['point'] * t['volume'] * 100000
        else:
            t['profit'] = (t['entry_price'] - t['exit_price']) / t['point'] * t['volume'] * 100000
        t['status'] = 'CLOSED_END'
        trade_history.append(t)
        
    print(f"\n--- Backtest Complete ---")
    print(f"Total Trades: {len(trade_history)}")
    
    if len(trade_history) > 0:
        df_res = pd.DataFrame(trade_history)
        wins = df_res[df_res['profit'] > 0]
        losses = df_res[df_res['profit'] <= 0]
        
        win_rate = len(wins) / len(df_res) * 100
        gross_profit = wins['profit'].sum()
        gross_loss = abs(losses['profit'].sum())
        profit_factor = gross_profit / gross_loss if gross_loss != 0 else float('inf')
        total_pnl = df_res['profit'].sum()
        
        print(f"Win Rate: {win_rate:.2f}%")
        print(f"Profit Factor: {profit_factor:.2f}")
        print(f"Total PnL (Estimated Points): {total_pnl:.2f}")
        
        df_res.to_csv("backtest_results.csv", index=False)
        print("Detailed results saved to backtest_results.csv")

if __name__ == "__main__":
    run_backtest()
