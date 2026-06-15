import pandas as pd
import MetaTrader5 as mt5
from core.logger import log
from core.config import settings

def get_m30_indicators(symbol: str, count: int = 250):
    """ Fetch M30 candles and calculate indicators using native pandas """
    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, count)
    if rates is None or len(rates) == 0:
        log.warning(f"Failed to fetch rates for {symbol}")
        return None
        
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    
    # Calculate indicators using native pandas (no external TA library needed)
    fast = settings.indicators.fast_ema
    medium = settings.indicators.medium_ema
    slow = settings.indicators.slow_sma

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
    
    return {
        "symbol": symbol,
        "close": last_completed['close'],
        "ema_fast": last_completed['ema_fast'],
        "ema_medium": last_completed['ema_medium'],
        "sma_slow": last_completed['sma_slow']
    }
