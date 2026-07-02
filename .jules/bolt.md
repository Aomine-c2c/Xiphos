## 2024-06-25 - MT5 API Call Bottleneck
**Learning:** Frequent MT5 API calls inside loops (like `mt5.symbol_info` or `mt5.copy_rates_from_pos` via indicator calculation) can create significant CPU and network latency overhead. Calling them repeatedly per second (for e.g. UI updates) is an anti-pattern.
**Action:** When working with MT5 API data that is static (like `point` size) or updates on a slower timeframe (like M30 indicators), aggressively cache the results using dictionaries or simple TTL caches to reduce IPC/network overhead.
