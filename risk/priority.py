import MetaTrader5 as mt5
from typing import List, Dict

class SignalPriorityEngine:
    @staticmethod
    def rank_signals(signals: List[Dict]) -> List[Dict]:
        """
        Distance = abs(CurrentPrice - SMA200)
        ProjectedRisk = Distance * LotSize * PointValue * 2
        Rank all signals: Lowest projected risk first.
        """
        for sig in signals:
            sym = sig['symbol']
            price = sig['ind_data']['close']
            sma200 = sig['ind_data']['sma_slow']
            distance = abs(price - sma200)
            
            info = mt5.symbol_info(sym)
            point_val = info.point if info else 0.00001
            
            lot_size = 0.01  # Fixed 0.01 as per blueprint
            projected_risk = distance * lot_size * point_val * 2
            
            sig['distance'] = distance
            sig['projected_risk'] = projected_risk
            
        # Lowest projected risk first
        ranked = sorted(signals, key=lambda x: x['projected_risk'])
        return ranked
