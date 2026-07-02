import polars as pl
from bridge.proxy import mt5
from core.logger import log

_indicator_cache = {}

def get_m30_indicators(symbol: str, count: int = 250, fast: int = 13, medium: int = 50, slow: int = 200):
    """ Fetch M30 candles and calculate indicators using Polars, with caching """
    
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
        
    # Polars implementation
    df = pl.DataFrame(rates)
    
    # Base expressions
    tr = pl.max_horizontal(
        pl.col("high") - pl.col("low"),
        (pl.col("high") - pl.col("close").shift(1)).abs(),
        (pl.col("low") - pl.col("close").shift(1)).abs()
    )
    
    diff = pl.col("close").diff()
    up = diff.clip(lower_bound=0)
    down = -1 * diff.clip(upper_bound=0)
    roll_up = up.ewm_mean(alpha=1/14, adjust=False)
    roll_down = down.ewm_mean(alpha=1/14, adjust=False)
    rs = roll_up / roll_down
    rsi = 100.0 - (100.0 / (1.0 + rs))

    ema_fast_macd = pl.col("close").ewm_mean(span=12, adjust=False)
    ema_slow_macd = pl.col("close").ewm_mean(span=26, adjust=False)
    macd = ema_fast_macd - ema_slow_macd
    macd_signal = macd.ewm_mean(span=9, adjust=False)

    up_move = pl.col("high") - pl.col("high").shift(1)
    down_move = pl.col("low").shift(1) - pl.col("low")
    plus_dm = pl.when((up_move > down_move) & (up_move > 0)).then(up_move).otherwise(0)
    minus_dm = pl.when((down_move > up_move) & (down_move > 0)).then(down_move).otherwise(0)
    tr_ema = tr.ewm_mean(alpha=1/14, adjust=False)
    plus_di = 100 * (plus_dm.ewm_mean(alpha=1/14, adjust=False) / tr_ema)
    minus_di = 100 * (minus_dm.ewm_mean(alpha=1/14, adjust=False) / tr_ema)
    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di)
    adx = dx.ewm_mean(alpha=1/14, adjust=False)

    sma20 = pl.col("close").rolling_mean(window_size=20)
    std20 = pl.col("close").rolling_std(window_size=20)
    bb_upper = sma20 + (std20 * 2)
    bb_lower = sma20 - (std20 * 2)

    obv = pl.when(pl.col("close") > pl.col("close").shift(1)).then(pl.col("tick_volume")) \
            .when(pl.col("close") < pl.col("close").shift(1)).then(-pl.col("tick_volume")) \
            .otherwise(0).cum_sum()

    df = df.with_columns([
        pl.col("close").ewm_mean(span=fast, adjust=False).alias("ema_fast"),
        pl.col("close").ewm_mean(span=medium, adjust=False).alias("ema_medium"),
        pl.col("close").rolling_mean(window_size=slow).alias("sma_slow"),
        tr.rolling_mean(window_size=14).alias("atr_14"),
        tr.rolling_mean(window_size=14).rolling_mean(window_size=100).alias("atr_mean_100"),
        rsi.alias("rsi_14"),
        macd.alias("macd"),
        macd_signal.alias("macd_signal"),
        adx.alias("adx_14"),
        bb_upper.alias("bb_upper"),
        bb_lower.alias("bb_lower"),
        obv.alias("obv")
    ])
    
    # Drop rows with nulls in key indicator columns
    df = df.drop_nulls(subset=["ema_fast", "ema_medium", "sma_slow", "atr_14", "atr_mean_100", "rsi_14", "adx_14", "bb_upper"])
    
    if df.height == 0:
        return None
        
    last_completed = df.row(-1, named=True)
    prev_bar = df.row(-2, named=True)

    result = {
        "symbol": symbol,
        "time": last_completed['time'],
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
        "prev_close":    prev_bar['close'],
        "prev_ema_fast": prev_bar['ema_fast'],
    }
    
    if len(_indicator_cache) > 500:
        _indicator_cache.clear()
        
    _indicator_cache[cache_key] = {'time': last_closed_time, 'data': result}
    return result
