from bridge.proxy import mt5

import time
from execution.executor import MT5Executor
from loguru import logger

def run_test():
    logger.info("Testing MT5 Execution Engine over Bridge...")
    if not mt5.initialize():
        logger.error("Failed to initialize MT5 proxy.")
        return
        
    symbol = "EURUSD"
    if not mt5.symbol_select(symbol, True):
        logger.error(f"Failed to select symbol {symbol}. Try another symbol like 'BTCUSD'.")
        return
        
    info = mt5.symbol_info_tick(symbol)
    if not info:
        logger.error(f"Failed to get tick info for {symbol}.")
        return
        
    logger.info(f"Symbol {symbol} selected. Current Ask: {info.ask}")
    
    executor = MT5Executor()
    volume = 0.01
    sl_price = info.ask - 0.0050 
    
    logger.info(f"Attempting to place a TEST BUY order for {volume} lots on {symbol}...")
    result = executor.execute_market_order(symbol, "BUY", volume, sl_price, magic=999999)
    
    if result:
        logger.info(f"SUCCESS! Trade placed successfully. Ticket: {result.order}")
        
        logger.info(f"Attempting to close test trade {result.order}...")
        close_request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(volume),
            "type": mt5.ORDER_TYPE_SELL,
            "position": int(result.order),
            "price": mt5.symbol_info_tick(symbol).bid,
            "deviation": 20,
            "magic": 999999,
            "comment": "Test Close",
        }
        close_result = mt5.order_send(close_request)
        if close_result and getattr(close_result, "retcode", mt5.TRADE_RETCODE_DONE) == mt5.TRADE_RETCODE_DONE:
            logger.info("SUCCESS! Test trade closed.")
        else:
            logger.error(f"Failed to close test trade. Retcode: {getattr(close_result, 'retcode', 'Unknown')}")
    else:
        logger.error("FAILED to place trade.")

if __name__ == "__main__":
    run_test()

