from typing import List, Dict

def rank_signals(signals: List[Dict]) -> List[Dict]:
    """
    Ranks concurrent signals. 
    Distance = abs(price - sma200)
    Lowest distance receives highest priority (sorted ascending).
    """
    for sig in signals:
        price = sig['ind_data']['close']
        sma200 = sig['ind_data']['sma_slow']
        sig['distance'] = abs(price - sma200)
        
    # Sort by distance, lowest to highest
    ranked = sorted(signals, key=lambda x: x['distance'])
    return ranked
