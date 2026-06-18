import pandas as pd
import time
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
                logger.info("Correlation Matrix updated successfully.")
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
                prices[sym] = [r['close'] for r in rates]
            else:
                prices[sym] = [0.0] * 500
                logger.warning(f"No historical data fetched for {sym} to compute correlation.")
        return prices

    def _build_result_matrix(self, corr_df: pd.DataFrame) -> Dict[str, Dict[str, str]]:
        result_matrix = {}
        for r_sym in self.symbols:
            result_matrix[r_sym] = {}
            for c_sym in self.symbols:
                if r_sym not in corr_df.index or c_sym not in corr_df.columns or r_sym == c_sym:
                    result_matrix[r_sym][c_sym] = "-"
                else:
                    val = corr_df.loc[r_sym, c_sym]
                    if pd.isna(val):
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
            
        for k in prices.keys():
            prices[k] = prices[k][-min_len:]
            
        df = pd.DataFrame(prices)
        corr_df = df.corr(method='pearson')
        
        return self._build_result_matrix(corr_df)

# Global singleton instance
correlation_engine = CorrelationEngine()
