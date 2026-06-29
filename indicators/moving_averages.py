import pandas as pd
import MetaTrader5 as mt5
from core.logger import log
import numpy as np

_indicator_cache = {}

def calculate_atr(df, period=14):
    df = df.copy()
    df['H-L'] = df['high'] - df['low']
    df['H-C'] = np.abs(df['high'] - df['close'].shift(1))
    df['L-C'] = np.abs(df['low'] - df['close'].shift(1))
    df['TR'] = df[['H-L', 'H-C', 'L-C']].max(axis=1)
    return df['TR'].rolling(window=period).mean()

def calculate_rsi(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    roll_up = up.ewm(alpha=1/period, adjust=False).mean()
    roll_down = down.ewm(alpha=1/period, adjust=False).mean()
    rs = roll_up / roll_down
    return 100.0 - (100.0 / (1.0 + rs))

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    return macd, signal_line

def calculate_adx(df, period=14):
    df_calc = df.copy()
    df_calc['up_move'] = df_calc['high'] - df_calc['high'].shift(1)
    df_calc['down_move'] = df_calc['low'].shift(1) - df_calc['low']
    
    df_calc['+dm'] = np.where((df_calc['up_move'] > df_calc['down_move']) & (df_calc['up_move'] > 0), df_calc['up_move'], 0)
    df_calc['-dm'] = np.where((df_calc['down_move'] > df_calc['up_move']) & (df_calc['down_move'] > 0), df_calc['down_move'], 0)
    
    # Calculate TR here again just for ADX to avoid dependency on global df['TR']
    df_calc['H-L'] = df_calc['high'] - df_calc['low']
    df_calc['H-C'] = np.abs(df_calc['high'] - df_calc['close'].shift(1))
    df_calc['L-C'] = np.abs(df_calc['low'] - df_calc['close'].shift(1))
    df_calc['TR'] = df_calc[['H-L', 'H-C', 'L-C']].max(axis=1)

    tr_ema = df_calc['TR'].ewm(alpha=1/period, adjust=False).mean()
    plus_di = 100 * (df_calc['+dm'].ewm(alpha=1/period, adjust=False).mean() / tr_ema)
    minus_di = 100 * (df_calc['-dm'].ewm(alpha=1/period, adjust=False).mean() / tr_ema)
    
    dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.ewm(alpha=1/period, adjust=False).mean()
    return adx

def calculate_bollinger_bands(series, period=20, std_dev=2):
    sma = series.rolling(window=period).mean()
    std = series.rolling(window=period).std()
    upper = sma + (std * std_dev)
    lower = sma - (std * std_dev)
    return upper, lower

def calculate_obv(df):
    obv = np.where(df['close'] > df['close'].shift(1), df['tick_volume'], 
           np.where(df['close'] < df['close'].shift(1), -df['tick_volume'], 0)).cumsum()
    return pd.Series(obv, index=df.index)

def get_m30_indicators(symbol: str, count: int = 250, fast: int = 13, medium: int = 50, slow: int = 200):
    """ Fetch M30 candles and calculate indicators using native pandas, with caching """
    
    # 1. Cheaply check the latest closed candle to utilize cache
    recent = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, 2)
    if recent is None or len(recent) < 2:
        return None
        
    last_closed_time = recent[0]['time']
    cache_key = f"{symbol}_{fast}_{medium}_{slow}"
    
    if cache_key in _indicator_cache and _indicator_cache[cache_key]['time'] == last_closed_time:
        return _indicator_cache[cache_key]['data']

    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, count)
    if rates is None or len(rates) == 0:
        log.warning(f"Failed to fetch rates for {symbol}")
        return None
        
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    df = df.set_index('time')
    
    # Calculate indicators using native pandas (no external TA library needed)
    df['ema_fast'] = df['close'].ewm(span=fast, adjust=False).mean()
    df['ema_medium'] = df['close'].ewm(span=medium, adjust=False).mean()
    df['sma_slow'] = df['close'].rolling(window=slow).mean()
    df['atr_14'] = calculate_atr(df)
    df['atr_mean_100'] = df['atr_14'].rolling(window=100).mean()
    
    # Advanced Indicators
    df['rsi_14'] = calculate_rsi(df['close'])
    df['macd'], df['macd_signal'] = calculate_macd(df['close'])
    df['adx_14'] = calculate_adx(df)
    df['bb_upper'], df['bb_lower'] = calculate_bollinger_bands(df['close'])
    df['obv'] = calculate_obv(df)
    
    df = df.dropna(subset=['ema_fast', 'ema_medium', 'sma_slow', 'atr_14', 'atr_mean_100', 'rsi_14', 'adx_14', 'bb_upper'])
    
    if df.empty:
        return None
        
    last_closed_time = int(df.index[-1].timestamp())
    last_completed = df.iloc[-1]
    
    # Need the previous bar to detect the 13 EMA crossover (current vs previous)
    prev_bar = df.iloc[-2]

    result = {
        "symbol": symbol,
        "time": int(last_completed.name.timestamp()) if isinstance(last_completed.name, pd.Timestamp) else last_closed_time,
        # Current (most recently closed) bar
        "close":        last_completed['close'],
        "low":          last_completed['low'],
        "high":         last_completed['high'],
        "ema_fast":     last_completed['ema_fast'],
        "ema_medium":   last_completed['ema_medium'],
        "sma_slow":     last_completed['sma_slow'],
        "atr_14":       last_completed['atr_14'],
        "atr_mean_100": last_completed['atr_mean_100'],
        "rsi_14":       last_completed['rsi_14'],
        "macd":         last_completed['macd'],
        "macd_signal":  last_completed['macd_signal'],
        "adx_14":       last_completed['adx_14'],
        "bb_upper":     last_completed['bb_upper'],
        "bb_lower":     last_completed['bb_lower'],
        "obv":          last_completed['obv'],
        # Previous bar — required for crossover detection
        "prev_close":    prev_bar['close'],
        "prev_ema_fast": prev_bar['ema_fast'],
    }
    
    _indicator_cache[cache_key] = {'time': last_closed_time, 'data': result}
    return result
