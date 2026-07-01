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
        # Our 9 static assets for the UI heatmap
        self.symbols = ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDJPY", "USDCHF", "USDCAD", "XAUUSD", "XAGUSD"]
        self.cache_ttl = 900  # 15 minutes in seconds

    def get_matrix(self) -> Dict[str, Dict[str, str]]:
        now = time.time()
        
        # Return cached version if still fresh
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
            
        # Fallback to cache (even if stale) or empty
        return self.cache

    def _fetch_prices(self) -> Dict[str, List[float]]:
        prices = {}
        for sym in self.symbols:
            rates = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_H1, 0, 500)
            if rates is not None and len(rates) > 0:
                # Use Polars to extract close prices instantly
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
        # Need MT5 to be connected
        if mt5.terminal_info() is None:
            return {}

        prices = self._fetch_prices()
                
        # Make sure all arrays are the same length
        min_len = min((len(v) for v in prices.values()), default=0)
        if min_len == 0:
            return {}
            
        # Create a 2D numpy array and slice to min_len
        arr_list = []
        for sym in self.symbols:
            arr_list.append(prices[sym][-min_len:])
            
        # arr shape will be (9, min_len)
        price_matrix = np.array(arr_list)
        
        # Calculate Pearson correlation coefficient
        # np.corrcoef expects rows to be variables and columns to be observations by default (rowvar=True)
        corr_array = np.corrcoef(price_matrix)
        
        return self._build_result_matrix(corr_array)

# Global singleton instance
correlation_engine = CorrelationEngine()
