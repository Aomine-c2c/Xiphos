import pandas as pd
import MetaTrader5 as mt5
import yaml
import time
from sqlalchemy import create_engine
from core.mahoraga import mahoraga_engine
from core.config import settings as config_settings
from indicators.moving_averages import calculate_atr, calculate_rsi, calculate_adx, calculate_bollinger_bands
from strategies.trend_following import evaluate_signal

def load_settings():
    with open('config/settings.yaml', 'r') as f:
        return yaml.safe_load(f)

def run_backtest(): # NOSONAR
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
        
        # Pre-calculate all possible dynamic Mahoraga MAs
        df_m30['ema_9'] = df_m30['close'].ewm(span=9, adjust=False).mean()
        df_m30['ema_13'] = df_m30['close'].ewm(span=13, adjust=False).mean()
        df_m30['ema_17'] = df_m30['close'].ewm(span=17, adjust=False).mean()
        df_m30['ema_medium'] = df_m30['close'].ewm(span=50, adjust=False).mean()
        df_m30['sma_slow'] = df_m30['close'].rolling(window=200).mean()
        
        # Calculate Mahoraga core indicators
        df_m30['atr_14'] = calculate_atr(df_m30)
        df_m30['atr_mean_100'] = df_m30['atr_14'].rolling(window=100).mean()
        df_m30['rsi_14'] = calculate_rsi(df_m30['close'])
        df_m30['adx_14'] = calculate_adx(df_m30)
        df_m30['bb_upper'], df_m30['bb_lower'] = calculate_bollinger_bands(df_m30['close'])
        
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
    mahoraga_adaptation_log = []
    
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
                if current_time not in df30.index:
                    continue
                
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
            if current_time not in df30.index:
                continue
            
            # Use the PREVIOUS closed candle for signal evaluation to match live bot
            pos_idx = df30.index.get_loc(current_time)
            if pos_idx < 1:
                continue
            
            prev_candle = df30.iloc[pos_idx - 1]
            if pd.isna(prev_candle['sma_slow']) or pd.isna(prev_candle['adx_14']):
                continue
                
            prev_prev_candle = df30.iloc[pos_idx - 2]
            
            ind_data = prev_candle.to_dict()
            
            # Calculate rolling win rate for this symbol
            sym_history = [tr for tr in trade_history if tr['symbol'] == sym]
            recent_trades = sym_history[-10:] if len(sym_history) >= 10 else sym_history
            recent_wins = len([tr for tr in recent_trades if tr['profit'] > 0])
            recent_win_rate = (recent_wins / len(recent_trades) * 100) if len(recent_trades) > 0 else 50.0
            
            # Evaluate Mahoraga
            prev_spins = mahoraga_engine.get_parameters(sym).adaptation_spins
            mahoraga_engine.evaluate(sym, ind_data, recent_win_rate)
            params = mahoraga_engine.get_parameters(sym)
            
            if params.adaptation_spins > prev_spins:
                mahoraga_adaptation_log.append({
                    'time': current_time,
                    'symbol': sym,
                    'phenomenon': params.phenomenon,
                    'spins': params.adaptation_spins,
                    'is_adapted': params.is_adapted
                })
            
            # Wire dynamic parameters into standard strategy data
            fast_ema_key = f"ema_{params.fast_ema}"
            ind_data['ema_fast'] = prev_candle.get(fast_ema_key, prev_candle['ema_13'])
            ind_data['prev_ema_fast'] = prev_prev_candle.get(fast_ema_key, prev_prev_candle['ema_13'])
            ind_data['prev_close'] = prev_prev_candle['close']
            ind_data['filter_strictness'] = params.filter_strictness
            
            close = prev_candle['close']
            point = prev_candle['point']
            sma200 = prev_candle['sma_slow']
            
            signal = evaluate_signal(ind_data)
                
            if signal is None or signal == "NONE":
                continue
            
            # Check gates
            bucket = bucket_map[sym]
            
            # Time-of-Day Filter
            sess = settings.get('session_filter', {})
            if sess.get('enabled', True) and bucket not in sess.get('exempt_groups', []):
                current_hour = current_time.hour
                if not (sess.get('start_hour', 8) <= current_hour < sess.get('end_hour', 16)):
                    continue
            
            if bucket in active_buckets:
                continue  # Gate 2: Correlation
            
            if open_counts.get(sym, 0) >= 2:
                continue
            
            dist = abs(close - sma200) / point
            if dist > 8000:
                continue  # Gate 5 max risk approx
            
            # Execute Trade A and B
            current_price = df30.loc[current_time, 'open'] # Fill at open of current candle
            
            # Dynamic Mahoraga Risk Params
            dist_to_sma = abs(close - sma200)
            sl_distance = dist_to_sma * params.sl_multiplier
            
            if signal == "BUY":
                dynamic_sl = close - sl_distance
            else:
                dynamic_sl = close + sl_distance
                
            base_volume = 0.01
            dynamic_volume = round(base_volume * params.lot_multiplier, 2)
            
            trade_a = {
                'symbol': sym, 'type': signal, 'role': 'Scalper', 'entry_time': current_time,
                'entry_price': current_price, 'sl': dynamic_sl, 'volume': dynamic_volume,
                'mfe': 0, 'mae': 0, 'is_risk_bearing': True, 'point': point, 'status': 'OPEN',
                'is_adapted': params.is_adapted, 'phenomenon': params.phenomenon
            }
            trade_b = {
                'symbol': sym, 'type': signal, 'role': 'Runner', 'entry_time': current_time,
                'entry_price': current_price, 'sl': dynamic_sl, 'volume': dynamic_volume,
                'mfe': 0, 'mae': 0, 'is_risk_bearing': True, 'point': point, 'status': 'OPEN',
                'is_adapted': params.is_adapted, 'phenomenon': params.phenomenon
            }
            open_trades.extend([trade_a, trade_b])
            open_counts[sym] = open_counts.get(sym, 0) + 2
            active_buckets.add(bucket)

        # 3. Trail SL for active trades at the close of M30
        for t in open_trades:
            sym = t['symbol']
            if current_time not in m30_data[sym].index:
                continue
            candle = m30_data[sym].loc[current_time]
            
            # Fetch current dynamic fast ema column
            params = mahoraga_engine.get_parameters(sym)
            fast_ema_col = f"ema_{params.fast_ema}"
            current_fast_ema = candle.get(fast_ema_col, candle['ema_13'])
            
            if t['role'] == 'Scalper':
                new_sl = candle['ema_medium']
            else:
                new_sl = candle['sma_slow']
                # Smart Trailing for Runner
                if t['type'] == 'BUY':
                    if candle['ema_medium'] > t['entry_price']:
                        new_sl = candle['ema_medium']
                    elif current_fast_ema > t['entry_price']:
                        new_sl = t['entry_price']
                elif t['type'] == 'SELL':
                    if candle['ema_medium'] < t['entry_price']:
                        new_sl = candle['ema_medium']
                    elif current_fast_ema < t['entry_price']:
                        new_sl = t['entry_price']
                
            # Trail logic
            if (t['type'] == 'BUY' and new_sl > t['sl']) or (t['type'] == 'SELL' and new_sl < t['sl']):
                t['sl'] = new_sl
                
            # Update risk-bearing status
            if (t['type'] == 'BUY' and t['sl'] >= t['entry_price']) or (t['type'] == 'SELL' and t['sl'] <= t['entry_price']):
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
        
    print("\n--- Backtest Complete ---")
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
        
        print(f"MAHORAGA BACKTEST RESULTS")
        print(f"Win Rate: {win_rate:.2f}%")
        print(f"Profit Factor: {profit_factor:.2f}")
        print(f"Total PnL (Estimated Points): {total_pnl:.2f}")
        
        # Calculate Adapted vs Non-Adapted
        adapted_trades = df_res[df_res['is_adapted'] == True]
        non_adapted_trades = df_res[df_res['is_adapted'] == False]
        
        if len(adapted_trades) > 0:
            awins = adapted_trades[adapted_trades['profit'] > 0]
            alosses = adapted_trades[adapted_trades['profit'] <= 0]
            awr = len(awins) / len(adapted_trades) * 100
            apf = awins['profit'].sum() / abs(alosses['profit'].sum()) if abs(alosses['profit'].sum()) != 0 else float('inf')
            print(f"\n--- FULLY ADAPTED TRADES (THE COUNTER-ATTACK) ---")
            print(f"Trades: {len(adapted_trades)}")
            print(f"Win Rate: {awr:.2f}%")
            print(f"Profit Factor: {apf:.2f}")
            print(f"PnL: {adapted_trades['profit'].sum():.2f}")
            
        if len(non_adapted_trades) > 0:
            nwins = non_adapted_trades[non_adapted_trades['profit'] > 0]
            nlosses = non_adapted_trades[non_adapted_trades['profit'] <= 0]
            nwr = len(nwins) / len(non_adapted_trades) * 100
            npf = nwins['profit'].sum() / abs(nlosses['profit'].sum()) if abs(nlosses['profit'].sum()) != 0 else float('inf')
            print(f"\n--- LEARNING TRADES (SPINNING THE WHEEL) ---")
            print(f"Trades: {len(non_adapted_trades)}")
            print(f"Win Rate: {nwr:.2f}%")
            print(f"Profit Factor: {npf:.2f}")
            print(f"PnL: {non_adapted_trades['profit'].sum():.2f}")
        
        # Write to PostgreSQL
        try:
            engine = create_engine(config_settings.database.url)
            
            # Map columns to the performance table format or insert into trades if preferred
            # For backtesting, we'll write to a dedicated backtest_trades table to avoid polluting live trades
            df_res.to_sql("backtest_trades", con=engine, if_exists="append", index=False)
            print("Detailed results saved to PostgreSQL (backtest_trades table).")
            
            if len(mahoraga_adaptation_log) > 0:
                df_log = pd.DataFrame(mahoraga_adaptation_log)
                df_log.to_sql("mahoraga_logs", con=engine, if_exists="append", index=False)
                print("Adaptation log saved to PostgreSQL (mahoraga_logs table).")
        except Exception as e:
            print(f"PostgreSQL write failed: {e}. Falling back to CSV.")
            df_res.to_csv("backtest_mahoraga_results.csv", index=False)
            if len(mahoraga_adaptation_log) > 0:
                df_log = pd.DataFrame(mahoraga_adaptation_log)
                df_log.to_csv("mahoraga_adaptation_log.csv", index=False)

if __name__ == "__main__":
    run_backtest()
