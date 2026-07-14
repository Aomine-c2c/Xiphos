import pytest
from unittest.mock import patch, MagicMock
from risk.RiskSlotManager import RiskSlotManager
from risk.CorrelationGuard import CorrelationGuard
from bridge.proxy import mt5

class MockPosition:
    def __init__(self, ticket, symbol, type, sl, price_open, magic):
        self.ticket = ticket
        self.symbol = symbol
        self.type = type
        self.sl = sl
        self.price_open = price_open
        self.magic = magic

@pytest.fixture
def mock_mt5_positions():
    with patch("bridge.proxy.mt5.positions_get") as mock_pos_get:
        yield mock_pos_get

def test_risk_slot_manager_empty(mock_mt5_positions):
    """Edge case: MT5 returns None for positions (no positions)."""
    mock_mt5_positions.return_value = None
    assert RiskSlotManager.get_risk_bearing_count() == 0
    with patch("core.config.settings.trading.max_risk_trades", 4):
        assert RiskSlotManager.can_open_new_trade() is True

def test_risk_slot_manager_limits(mock_mt5_positions, monkeypatch):
    """Test standard limit tracking and SL logic."""
    RiskSlotManager.GLOBAL_LIMIT = 2
    
    positions = [
        # Risk bearing (SL = 0)
        MockPosition(1, "EURUSD", mt5.ORDER_TYPE_BUY, 0.0, 1.0500, 123),
        # Risk free (SL > open for BUY)
        MockPosition(2, "GBPUSD", mt5.ORDER_TYPE_BUY, 1.2650, 1.2600, 123),
        # Risk bearing (SL < open for BUY)
        MockPosition(3, "USDJPY", mt5.ORDER_TYPE_BUY, 149.0, 150.0, 123)
    ]
    mock_mt5_positions.return_value = positions
    
    # 2 risk bearing, 1 risk free. Limit is 2. We cannot open new.
    assert RiskSlotManager.get_risk_bearing_count() == 2
    with patch("core.config.settings.trading.max_risk_trades", 2):
        assert RiskSlotManager.can_open_new_trade() is False

def test_correlation_guard_edge_case(mock_mt5_positions):
    """
    Test CorrelationGuard blocks correlated pairs appropriately.
    Race condition context: Ensuring multiple synchronous checks correctly block.
    """
    with patch("core.config.settings.correlation_groups", {"group_1": ["EURUSD", "GBPUSD"]}):
        
        # First trade allowed (no active positions)
        mock_mt5_positions.return_value = []
        assert CorrelationGuard.is_bucket_blocked("EURUSD") is False
        
        # If EURUSD is already active and risk bearing, GBPUSD should be blocked
        mock_mt5_positions.return_value = [
            MockPosition(1, "EURUSD", mt5.ORDER_TYPE_BUY, 0.0, 1.0500, 123)
        ]
        assert CorrelationGuard.is_bucket_blocked("GBPUSD") is True
        
        # Non-correlated allowed
        assert CorrelationGuard.is_bucket_blocked("USDJPY") is False
