import MetaTrader5 as mt5
from typing import List, Dict


class SignalPriorityEngine:
    @staticmethod
    def rank_signals(signals: List[Dict], lot_size: float = 0.01) -> List[Dict]:
        """
        When multiple symbols signal simultaneously, rank them by risk.
        Distance = abs(CurrentPrice - SMA200)
        ProjectedRisk = (Distance / point_value) * lot_size * 2

        Returns a list of dictionaries sorted by projected_risk (ascending).
        Expected input signal dict: {"symbol": str, "type": str, "ind_data": dict}
        """
        processed_signals = []

        for sig in signals:
            sym = sig["symbol"]
            price = sig["ind_data"]["close"]
            sma200 = sig["ind_data"]["sma_slow"]

            # Distance from price to SMA200
            distance = abs(price - sma200)

            # Get symbol info to calculate point value
            info = mt5.symbol_info(sym)
            point_val = info.point if (info and info.point > 0) else 0.00001

            # Risk Projection (price distance converted to points to standardize risk ranking)
            projected_risk = (distance / point_val) * lot_size * 2

            processed_signals.append(
                {
                    "symbol": sym,
                    "signal": sig[
                        "type"
                    ],  # The blueprint specifies "signal" for direction
                    "type": sig[
                        "type"
                    ],  # Kept for compatibility with existing executor
                    "distance": distance,
                    "projected_risk": projected_risk,
                    "ind_data": sig["ind_data"],  # Pass through the indicators
                }
            )

        # Sort all opportunities: lowest risk first
        ranked_signals = sorted(processed_signals, key=lambda x: x["projected_risk"])

        return ranked_signals
