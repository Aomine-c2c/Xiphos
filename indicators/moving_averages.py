import pandas as pd
import MetaTrader5 as mt5
from core.logger import log
from core.config import settings

_indicator_cache = {}

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
    
    # Calculate indicators using native pandas (no external TA library needed)
    fast = 13
    medium = 50
    slow = 200

    df['ema_fast'] = df['close'].ewm(span=fast, adjust=False).mean()
    df['ema_medium'] = df['close'].ewm(span=medium, adjust=False).mean()
    df['sma_slow'] = df['close'].rolling(window=slow).mean()
    
    df.dropna(subset=['ema_fast', 'ema_medium', 'sma_slow'], inplace=True)
    
    if df.empty:
        return None
        
    # The cron scheduler runs exactly on M30 close, so the last complete candle is the previous index.
    # Actually, MT5 copy_rates_from_pos(0, N) gets the CURRENT unfinished candle at index -1.
    # "Never use unfinished candles." -> We must use iloc[-2] (the last completed candle).
    if len(df) < 2:
        return None
        
    last_completed = df.iloc[-2]
    
    result = {
        "symbol": symbol,
        "time": int(last_completed.name.timestamp()) if isinstance(last_completed.name, pd.Timestamp) else last_closed_time,
        "close": last_completed['close'],
        "ema_fast": last_completed['ema_fast'],
        "ema_medium": last_completed['ema_medium'],
        "sma_slow": last_completed['sma_slow']
    }
    
    _indicator_cache[symbol] = {'time': last_closed_time, 'data': result}
    return result
