import time

import numpy as np

import polars as pl

from typing import Dict, List

from loguru import logger

from bridge.proxy import mt5



class CorrelationEngine:

    def __init__(self):

        self.last_update = 0

        self.cache: Dict[str, Dict[str, str]] = {}

        

        self.symbols = ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDJPY", "USDCHF", "USDCAD", "XAUUSD", "XAGUSD"]

        self.cache_ttl = 900  



    def get_matrix(self) -> Dict[str, Dict[str, str]]:

        now = time.time()

        

        

        if self.cache and (now - self.last_update) < self.cache_ttl:

            return self.cache

            

        try:

            matrix = self._compute_matrix()

            if matrix:

                self.cache = matrix

                self.last_update = now

                logger.info("Correlation Matrix updated successfully via Numpy/Polars.")

                return self.cache

        except Exception as e:

            logger.error(f"Failed to compute correlation matrix: {e}")

            

        

        return self.cache



    def _fetch_prices(self) -> Dict[str, List[float]]:

        prices = {}

        for sym in self.symbols:

            rates = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_H1, 0, 500)

            if rates is not None and len(rates) > 0:

                

                df_rates = pl.DataFrame(rates)

                prices[sym] = df_rates['close'].to_list()

            else:

                prices[sym] = [0.0] * 500

                logger.warning(f"No historical data fetched for {sym} to compute correlation.")

        return prices



    def _build_result_matrix(self, corr_array: np.ndarray) -> Dict[str, Dict[str, str]]:

        result_matrix = {}

        for i, r_sym in enumerate(self.symbols):

            result_matrix[r_sym] = {}

            for j, c_sym in enumerate(self.symbols):

                if i == j:

                    result_matrix[r_sym][c_sym] = "-"

                else:

                    val = corr_array[i, j]

                    if np.isnan(val):

                        result_matrix[r_sym][c_sym] = "-"

                    else:

                        pct = int(round(val * 100))

                        result_matrix[r_sym][c_sym] = str(pct)

        return result_matrix



    def _compute_matrix(self) -> Dict[str, Dict[str, str]]:

        

        if mt5.terminal_info() is None:

            return {}



        prices = self._fetch_prices()

                

        

        min_len = min((len(v) for v in prices.values()), default=0)

        if min_len == 0:

            return {}

            

        

        arr_list = []

        for sym in self.symbols:

            arr_list.append(prices[sym][-min_len:])

            

        

        price_matrix = np.array(arr_list)

        

        

        

        corr_array = np.corrcoef(price_matrix)

        

        return self._build_result_matrix(corr_array)





correlation_engine = CorrelationEngine()

