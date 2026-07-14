from bridge.proxy import mt5
from loguru import logger

def fetch_l2_imbalance(symbol: str) -> dict:
    """
    Attempts to fetch Level 2 Market Depth (DOM) for the symbol.
    Returns bid/ask imbalance. Positive = More Buy pressure, Negative = More Sell pressure.
    """
    if not mt5.initialize():
        return {"bid_ask_imbalance": 0.0}

    # Attempt to subscribe to market book
    if not mt5.market_book_add(symbol):
        # Broker might not support Market Book for this symbol
        return {"bid_ask_imbalance": 0.0}
        
    try:
        book = mt5.market_book_get(symbol)
        if not book:
            return {"bid_ask_imbalance": 0.0}
            
        total_bid_vol = 0.0
        total_ask_vol = 0.0
        
        for item in book:
            if item.type == mt5.BOOK_TYPE_BUY:
                total_bid_vol += item.volume
            elif item.type == mt5.BOOK_TYPE_SELL:
                total_ask_vol += item.volume
                
        total_vol = total_bid_vol + total_ask_vol
        if total_vol == 0:
            return {"bid_ask_imbalance": 0.0}
            
        # Imbalance from -1.0 to 1.0
        imbalance = (total_bid_vol - total_ask_vol) / total_vol
        return {"bid_ask_imbalance": round(imbalance, 4)}
        
    except Exception as e:
        logger.error(f"Error fetching L2 for {symbol}: {e}")
        return {"bid_ask_imbalance": 0.0}
    finally:
        # We can release the book to save resources, or keep it open.
        # For a periodic fetcher, releasing it is safer.
        mt5.market_book_release(symbol)
