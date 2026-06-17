from bridge.proxy import mt5
from core.config import settings
from typing import List, Optional

class CorrelationGuard:
    @staticmethod
    def get_bucket(symbol: str) -> Optional[List[str]]:
        """
        Returns the bucket (list of symbols) containing the specified symbol.
        Returns None if the symbol does not belong to any bucket.
        """
        for group_name, symbols in settings.correlation_groups.items():
            if symbol in symbols:
                return symbols
        return None

    @staticmethod
    def get_blocking_positions(symbol: str, magic_filter=None) -> list:
        """
        Finds risk-bearing positions from OTHER assets in the same bucket.
        Risk-bearing means SL is worse than Open Price (or no SL exists).
        Risk-free positions do not block.
        """
        bucket = CorrelationGuard.get_bucket(symbol)
        if bucket is None:
            return []

        positions = mt5.positions_get()
        if positions is None:
            return []

        blocking_positions = []
        for pos in positions:
            # We only care about other assets in the exact same bucket
            if pos.symbol in bucket and pos.symbol != symbol:
                if magic_filter is not None and pos.magic not in magic_filter:
                    continue

                is_risk_bearing = False
                
                # Naked trades are considered risk-bearing
                if pos.sl == 0.0:
                    is_risk_bearing = True
                elif pos.type == mt5.ORDER_TYPE_BUY:
                    if pos.sl < pos.price_open:
                        is_risk_bearing = True
                elif pos.type == mt5.ORDER_TYPE_SELL:
                    if pos.sl > pos.price_open:
                        is_risk_bearing = True

                if is_risk_bearing:
                    blocking_positions.append(pos)

        return blocking_positions

    @staticmethod
    def is_bucket_blocked(symbol: str, magic_filter=None) -> bool:
        """
        Returns True if a risk-bearing trade exists inside the same bucket
        from a different asset, thereby blocking new trades for this symbol.
        """
        blocking_positions = CorrelationGuard.get_blocking_positions(symbol, magic_filter)
        return len(blocking_positions) > 0
