import time
import json
from loguru import logger
from core.redis_client import redis_client
from data_pipeline.news_fetcher import fetch_latest_news
from data_pipeline.macro_fetcher import fetch_forex_factory_calendar

NEWS_POLL_INTERVAL = 900  # 15 minutes
MACRO_POLL_INTERVAL = 3600  # 1 hour

def data_aggregator_loop():
    logger.info("Live Data Pipeline Aggregator started.")
    
    last_news_fetch = 0
    last_macro_fetch = 0
    
    while True:
        now = time.time()
        
        # Fetch News
        if now - last_news_fetch >= NEWS_POLL_INTERVAL:
            logger.debug("Fetching latest news from NewsAPI...")
            news_data = fetch_latest_news()
            redis_client.client.set("xiphos:data:news", json.dumps(news_data))
            last_news_fetch = now
            
        # Fetch Macro
        if now - last_macro_fetch >= MACRO_POLL_INTERVAL:
            logger.debug("Fetching latest macro events from ForexFactory...")
            macro_data = fetch_forex_factory_calendar()
            redis_client.client.set("xiphos:data:macro", json.dumps(macro_data))
            last_macro_fetch = now
            
        time.sleep(60)  # Sleep for a minute before checking intervals again
