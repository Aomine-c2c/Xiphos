from core.logger import log

def evaluate_signal(ind_data: dict): # noqa: C901
    """
    Asymmetrical Breakout Strategy — "Lose Pennies, Win Big"

    MACRO TREND (50 EMA vs 200 SMA):
      - Only look for BUYs when 50 EMA > 200 SMA (macro uptrend)
      - Only look for SELLs when 50 EMA < 200 SMA (macro downtrend)

    TRIGGER (13 EMA Crossover):
      - BUY:  Previous close was BELOW the 13 EMA, current close is ABOVE it
      - SELL: Previous close was ABOVE the 13 EMA, current close is BELOW it

    This catches early momentum aligned with the macro trend — not the exhausted top.

    STOP LOSS (set in main.py):
      - Placed at the LOW of the trigger candle (for BUY)
      - Placed at the HIGH of the trigger candle (for SELL)
      - Extremely tight — creates the "Penny Loss" side of the equation

    TAKE PROFIT (set in main.py):
      - None. Trailing stop on 13 EMA (scalper) and 50 EMA (runner)
      - Ride the entire trend until it snaps — creates the "Win Big" side

    STRICTNESS:
      - If strictness == "STRICT", requires a stronger trend definition or rejects choppiness.

    Returns: "BUY", "SELL", or None
    """
    if not ind_data:
        return None

    strictness = ind_data.get("filter_strictness", "NORMAL")

    c         = ind_data.get('close')
    prev_c    = ind_data.get('prev_close')
    e_fast    = ind_data.get('ema_fast')
    prev_fast = ind_data.get('prev_ema_fast')
    e_med     = ind_data.get('ema_medium')
    s_slow    = ind_data.get('sma_slow')

    if any(v is None for v in [c, prev_c, e_fast, prev_fast, e_med, s_slow]):
        return None

    macro_up   = e_med > s_slow
    macro_down = e_med < s_slow

    # Strictness filter: Require price to be aligned with macro trend
    if strictness == "EXTREME_STRICT":
        # Ranging market blocked by Mahoraga ADX rules
        return None
        
    if strictness == "STRICT":
        if macro_up and c < e_med:
            return None
        if macro_down and c > e_med:
            return None
            
    rsi = ind_data.get('rsi_14', 50)

    # Fast EMA crossover in the direction of the macro trend
    if macro_up and prev_c < prev_fast and c > e_fast:
        if rsi > 70:
            log.debug(f"BUY rejected: RSI overbought ({rsi:.1f})")
            return None
        log.debug(f"BUY signal: Fast EMA cross above in macro uptrend (50 EMA > 200 SMA) [Strictness: {strictness}]")
        return "BUY"
    elif macro_down and prev_c > prev_fast and c < e_fast:
        if rsi < 30:
            log.debug(f"SELL rejected: RSI oversold ({rsi:.1f})")
            return None
        log.debug(f"SELL signal: Fast EMA cross below in macro downtrend (50 EMA < 200 SMA) [Strictness: {strictness}]")
        return "SELL"

    return None
