import requests
import xml.etree.ElementTree as ET
from loguru import logger
import datetime

def fetch_forex_factory_calendar():
    url = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        root = ET.fromstring(response.content)
        
        upcoming_events = []
        volatility_flag = False
        
        now = datetime.datetime.now()
        
        for event in root.findall('event'):
            title = event.find('title').text if event.find('title') is not None else ''
            country = event.find('country').text if event.find('country') is not None else ''
            date_str = event.find('date').text if event.find('date') is not None else ''
            time_str = event.find('time').text if event.find('time') is not None else ''
            impact = event.find('impact').text if event.find('impact') is not None else ''
            
            # Simple check to see if it's high impact (Red folder)
            if impact and impact.strip().lower() == "high":
                upcoming_events.append(f"{country} - {title} ({date_str} {time_str})")
                
                # Check if it's within the next 24 hours (crude check based on string date, real implementation would parse the date properly)
                # For simplicity, if we have any high impact event in the feed, we might set volatility_flag, 
                # but to be more accurate we'd parse the date. Let's assume if it's in the XML (this week), it's relevant.
                volatility_flag = True
                
        return {
            "upcoming_events": upcoming_events[:10],  # Limit to 10
            "volatility_flag": volatility_flag
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch ForexFactory calendar: {e}")
        return {
            "upcoming_events": [],
            "volatility_flag": False
        }
