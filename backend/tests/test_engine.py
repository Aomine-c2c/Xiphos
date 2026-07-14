import pytest
from unittest.mock import patch, MagicMock
from worker_engine import state_publisher_loop, command_listener_loop



@patch("worker_engine.compile_system_state")

@patch("worker_engine.redis_client")

@patch("worker_engine.time.sleep", side_effect=InterruptedError("Stop loop")) # break infinite loop

@patch("MetaTrader5.initialize")

def test_state_publisher_initializes_mt5(mock_init, mock_sleep, mock_redis, mock_compile):

    """

    Test that the state publisher loop properly initializes the MT5 terminal

    for its thread context before entering the infinite loop.

    """

    try:

        state_publisher_loop()

    except InterruptedError:

        pass

    

    assert mock_init.call_count >= 1

    mock_compile.assert_called()

    mock_redis.set_state.assert_called()





@patch("worker_engine.handle_command")

@patch("worker_engine.redis_client")

@patch("worker_engine.mt5_conn.ensure_initialized")

def test_command_listener_initializes_mt5(mock_ensure_initialized, mock_redis, mock_handle):

    """

    Test that the command listener loop properly initializes the MT5 interface

    before entering the command loop.

    """

    mock_pubsub = MagicMock()

    # Provide one dummy message then break out

    mock_pubsub.listen.return_value = [{"type": "message", "data": "test_cmd"}]

    mock_redis.subscribe_commands.return_value = mock_pubsub

    

    # We'll break the loop by raising an exception inside handle_command

    mock_handle.side_effect = InterruptedError("Stop loop")

    

    try:

        command_listener_loop()

    except InterruptedError:

        pass

        

    mock_ensure_initialized.assert_called_once()

    mock_redis.subscribe_commands.assert_called_once()

    mock_handle.assert_called_once_with({"type": "message", "data": "test_cmd"})
