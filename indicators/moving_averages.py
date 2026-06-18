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

def get_m30_indicators(symbol: str, count: int = 250):
    """ Fetch M30 candles and calculate indicators using native pandas, with caching """
    
    # 1. Cheaply check the latest closed candle to utilize cache
    recent = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, 2)
    if recent is None or len(recent) < 2:
        return None
        
    last_closed_time = recent[0]['time']
    
    if symbol in _indicator_cache and _indicator_cache[symbol]['time'] == last_closed_time:
        return _indicator_cache[symbol]['data']

    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, count)
    if rates is None or len(rates) == 0:
        log.warning(f"Failed to fetch rates for {symbol}")
        return None
        
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    df = df.set_index('time')
    
    # Calculate indicators using native pandas (no external TA library needed)
    fast = 13
    medium = 50
    slow = 200

    df['ema_fast'] = df['close'].ewm(span=fast, adjust=False).mean()
    df['ema_medium'] = df['close'].ewm(span=medium, adjust=False).mean()
    df['sma_slow'] = df['close'].rolling(window=slow).mean()
    df['atr_14'] = calculate_atr(df)
    
    df = df.dropna(subset=['ema_fast', 'ema_medium', 'sma_slow', 'atr_14'])
    
    if df.empty:
        return None
        
    last_closed_time = int(df.index[-1].timestamp())
    last_completed = df.iloc[-1]
    
    result = {
        "symbol": symbol,
        "time": int(last_completed.name.timestamp()) if isinstance(last_completed.name, pd.Timestamp) else last_closed_time,
        "close": last_completed['close'],
        "ema_fast": last_completed['ema_fast'],
        "ema_medium": last_completed['ema_medium'],
        "sma_slow": last_completed['sma_slow'],
        "atr_14": last_completed['atr_14']
    }
    
    _indicator_cache[symbol] = {'time': last_closed_time, 'data': result}
    return result
