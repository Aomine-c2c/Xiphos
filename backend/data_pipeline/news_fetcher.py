import os
import requests
from loguru import logger

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")

def fetch_latest_news():
    if not NEWSAPI_KEY:
        logger.warning("NEWSAPI_KEY not found in environment. Using mock news data.")
        return {
            "sentiment": "NEUTRAL",
            "recent_headlines": [
                "[MOCK] No major economic events today.",
                "[MOCK] Central banks hold rates steady."
            ]
        }

    url = f"https://newsapi.org/v2/everything?q=forex OR USD OR EUR OR GBP OR JPY&language=en&sortBy=publishedAt&apiKey={NEWSAPI_KEY}&pageSize=5"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        headlines = [article.get('title', '') for article in data.get('articles', [])]
        
        # Simple sentiment mock based on keywords
        sentiment = "NEUTRAL"
        joined_headlines = " ".join(headlines).lower()
        if any(word in joined_headlines for word in ["crisis", "crash", "plunge", "panic", "emergency"]):
            sentiment = "NEGATIVE"
        elif any(word in joined_headlines for word in ["surge", "rally", "boom", "soar"]):
            sentiment = "POSITIVE"
            
        return {
            "sentiment": sentiment,
            "recent_headlines": headlines
        }
    except Exception as e:
        logger.error(f"Failed to fetch news from NewsAPI: {e}")
        return {
            "sentiment": "NEUTRAL",
            "recent_headlines": []
        }
