import time


import MetaTrader5 as mt5



from core.logger import log as logger







MAX_RETRIES = 3



BASE_DELAY = 2.0







def retry_mt5_call(func, *args, **kwargs):

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            if func == mt5.order_send:

                result = mt5.order_send(kwargs.get("request", args[0] if args else {}))

            else:

                result = func(*args, **kwargs)

        except Exception as e:

            logger.warning(f"MT5 call {func.__name__} threw {e}. Attempt {attempt}/{MAX_RETRIES}")

            result = None



        if result is not None and getattr(result, "retcode", getattr(mt5, "TRADE_RETCODE_DONE", 0)) == getattr(mt5, "TRADE_RETCODE_DONE", 0):

            return result



        logger.warning(f"MT5 call {func.__name__} returned {result}. Attempt {attempt}/{MAX_RETRIES}")

        time.sleep(BASE_DELAY * (2 ** (attempt - 1)))



    logger.critical(f"MT5 call {func.__name__} failed after {MAX_RETRIES} attempts.")

    return None

