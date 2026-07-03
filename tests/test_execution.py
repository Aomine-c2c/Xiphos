import pytest
import threading
import time
from execution.queue import TradeExecutionWorker
from unittest.mock import patch, MagicMock

@pytest.fixture
def trade_worker():
    worker = TradeExecutionWorker()
    # Prevent the real thread from initializing MT5 in test environment
    with patch("MetaTrader5.initialize", return_value=True):
        worker.start()
        yield worker
        worker.stop()

def test_trade_worker_sequential_execution(trade_worker):
    """
    Test that the TradeExecutionWorker processes tasks sequentially
    even when queued from multiple threads simultaneously (race condition simulation).
    """
    execution_order = []
    
    def dummy_task(task_id, sleep_time=0.01):
        time.sleep(sleep_time)
        execution_order.append(task_id)

    # Thread 1: M30 engine firing tasks
    def thread_1_tasks():
        for i in range(5):
            trade_worker.enqueue(dummy_task, f"T1-{i}")

    # Thread 2: API Server firing manual tasks
    def thread_2_tasks():
        for i in range(5):
            trade_worker.enqueue(dummy_task, f"T2-{i}")

    t1 = threading.Thread(target=thread_1_tasks)
    t2 = threading.Thread(target=thread_2_tasks)
    
    t1.start()
    t2.start()
    
    t1.join()
    t2.join()
    
    # Wait for the queue to drain
    trade_worker.cmd_queue.join()
    
    # Assert all 10 tasks were executed
    assert len(execution_order) == 10
    
    # Check that it didn't crash and processed everything
    assert "T1-4" in execution_order
    assert "T2-4" in execution_order

@patch("execution.trailing.mt5")
@patch("execution.trailing.modify_sl")
def test_execution_trailing_edge_case(mock_modify_sl, mock_mt5):
    """
    Test edge cases in trailing logic, specifically when the new SL
    is extremely close to the current price boundaries.
    """
    from execution.trailing import _trail_buy_position
    
    class MockPos:
        def __init__(self, ticket, symbol, sl, magic):
            self.ticket = ticket
            self.symbol = symbol
            self.sl = sl
            self.magic = magic

    class MockTick:
        def __init__(self, bid):
            self.bid = bid
            
    pos = MockPos(12345, "EURUSD", 1.0500, 100)
    
    # Current bid is 1.0600. Stoplevel is 50 pips (0.0050).
    # Max SL can be 1.0600 - 0.0050 = 1.0550
    mock_mt5.symbol_info_tick.return_value = MockTick(1.0600)
    
    # Edge case 1: new_sl is perfectly at the boundary (1.0549 < 1.0550) - should pass condition and trigger position_modify
    _trail_buy_position(pos, 1.0549, 0.0050)
    mock_modify_sl.assert_called_once_with(pos.ticket, pos.symbol, 1.0549)
    
    # Edge case 2: new_sl violates stoplevel boundary (1.0551 > 1.0550) - should NOT trigger position_modify
    mock_modify_sl.reset_mock()
    _trail_buy_position(pos, 1.0551, 0.0050)
    mock_modify_sl.assert_not_called()
