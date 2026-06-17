from bridge.proxy import mt5
from core.config import settings

class RiskSlotManager:
    GLOBAL_LIMIT = 4 # Kept for backward compatibility, but actual calculations use settings

    @staticmethod
    def _evaluate_positions(magic_filter=None):
        """
        Internal helper to evaluate all positions and categorize them into risk-bearing and risk-free.
        If magic_filter is provided (list of ints), only trades matching those magic numbers are evaluated.
        """
        positions = mt5.positions_get()
        if positions is None:
            return [], []

        risk_bearing = []
        risk_free = []

        for pos in positions:
            if magic_filter is not None and pos.magic not in magic_filter:
                continue

            # Naked trades (no SL) are considered inherently risk-bearing
            if pos.sl == 0.0:
                risk_bearing.append(pos)
                continue

            if pos.type == mt5.ORDER_TYPE_BUY:
                if pos.sl < pos.price_open:
                    risk_bearing.append(pos)
                else:
                    risk_free.append(pos)
            elif pos.type == mt5.ORDER_TYPE_SELL:
                if pos.sl > pos.price_open:
                    risk_bearing.append(pos)
                else:
                    risk_free.append(pos)

        return risk_bearing, risk_free

    @staticmethod
    def get_risk_bearing_count(magic_filter=None) -> int:
        """ Returns the count of positions that still have downside risk. """
        risk_bearing, _ = RiskSlotManager._evaluate_positions(magic_filter)
        return len(risk_bearing)

    @staticmethod
    def get_risk_free_count(magic_filter=None) -> int:
        """ Returns the count of positions that are at breakeven or better. """
        _, risk_free = RiskSlotManager._evaluate_positions(magic_filter)
        return len(risk_free)

    @staticmethod
    def can_open_new_trade(magic_filter=None) -> bool:
        """ 
        Returns True if the current risk-bearing positions are strictly less than the dynamic limit.
        Risk-free positions do not count towards this limit.
        """
        limit = settings.trading.max_risk_trades
        return RiskSlotManager.get_risk_bearing_count(magic_filter) < limit

    @staticmethod
    def get_available_slots(magic_filter=None) -> int:
        """ Returns exactly how many more risk-bearing trades can be opened. """
        limit = settings.trading.max_risk_trades
        return max(0, limit - RiskSlotManager.get_risk_bearing_count(magic_filter))
