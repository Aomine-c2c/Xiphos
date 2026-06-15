from core.logger import log

def evaluate_signal(ind_data: dict):
    """
    Evaluates 3-Way Fan Alignment:
    BUY: Close > EMA13 > EMA50 > SMA200
    SELL: Close < EMA13 < EMA50 < SMA200
    """
    if not ind_data:
        return None
        
    c = ind_data['close']
    e_f = ind_data['ema_fast']
    e_m = ind_data['ema_medium']
    s_s = ind_data['sma_slow']
    
    if c > e_f > e_m > s_s:
        return "BUY"
    elif c < e_f < e_m < s_s:
        return "SELL"
        
    return None
