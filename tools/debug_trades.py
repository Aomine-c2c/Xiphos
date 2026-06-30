"""
TRADE DEBUG - Print every trade detail to find the SL distance problem
"""
import pandas as pd
import MetaTrader5 as mt5

def _load_symbols(settings_path='config/settings.yaml') -> list:
    import yaml
    with open(settings_path, 'r') as f:
        settings = yaml.safe_load(f)
    symbols = []
    for grp_name, syms in settings['correlation_groups'].items():
        symbols.extend(syms)
    return list(set(symbols))

def _fetch_symbol_data(symbols, m30_count=1000):
    raw_data = {}
    contract_sizes = {}
    for sym in symbols:
        mt5.symbol_select(sym, True)
        sym_info = mt5.symbol_info(sym)
        if not sym_info:
            continue
        contract_sizes[sym] = sym_info.trade_contract_size
        point = sym_info.point

        rates = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_M30, 0, m30_count)
        if rates is None or len(rates) == 0:
            continue
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df.set_index('time', inplace=True, drop=False)
        df['ema_fast']   = df['close'].ewm(span=13, adjust=False).mean()
        df['ema_medium'] = df['close'].ewm(span=50, adjust=False).mean()
        df['sma_slow']   = df['close'].rolling(window=200).mean()
        df['prev_close']    = df['close'].shift(1)
        df['prev_ema_fast'] = df['ema_fast'].shift(1)
        df['next_open'] = df['open'].shift(-1)
        raw_data[sym] = (df, point)
    return raw_data, contract_sizes

def _print_signals(raw_data, contract_sizes):
    print("\n--- Finding signals and checking SL distances ---\n")
    for sym, (df, point) in raw_data.items():
        for ts, row in df.iterrows():
            if pd.isna(row['sma_slow']) or pd.isna(row['prev_ema_fast']):
                continue
            
            macro_up   = row['ema_medium'] > row['sma_slow']
            macro_down = row['ema_medium'] < row['sma_slow']
            
            signal = None
            if macro_up and row['prev_close'] < row['prev_ema_fast'] and row['close'] > row['ema_fast']:
                signal = "BUY"
            elif macro_down and row['prev_close'] > row['prev_ema_fast'] and row['close'] < row['ema_fast']:
                signal = "SELL"
            
            if signal is None or pd.isna(row['next_open']):
                continue
            
            entry  = row['next_open']
            signal_sl = row['low'] if signal == "BUY" else row['high']
            sl_dist_pips = abs(entry - signal_sl) / point
            risk_usd = abs(entry - signal_sl) * contract_sizes[sym] * 0.01
            
            print(f"  {sym} | {signal} | {ts.strftime('%Y-%m-%d %H:%M')} | "
                  f"Entry: {entry:.5f} | SL: {signal_sl:.5f} | "
                  f"SL Dist: {sl_dist_pips:.1f} pips | Risk: ${risk_usd:.2f}")

def run_debug():
    symbols = _load_symbols()
    
    if not mt5.initialize():
        print("MT5 Init Failed")
        return

    raw_data, contract_sizes = _fetch_symbol_data(symbols, m30_count=1000)
    mt5.shutdown()

    _print_signals(raw_data, contract_sizes)

if __name__ == "__main__":
    run_debug()
