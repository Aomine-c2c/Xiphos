import os
import json
import redis
from core.logger import log as logger

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    def __init__(self):
        self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True, protocol=2)
        self.pubsub = self.client.pubsub(ignore_subscribe_messages=True)
        try:
            self.client.ping()
            logger.info(f"Connected to Redis at {REDIS_URL}")
        except redis.ConnectionError:
            logger.warning(f"Failed to connect to Redis at {REDIS_URL}. Ensure Redis is running.")

    def set_state(self, state: dict):
        try:
            self.client.set("xiphos:state", json.dumps(state))
        except Exception as e:
            logger.error(f"Redis set_state error: {e}")

    def get_state(self):
        try:
            data = self.client.get("xiphos:state")
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis get_state error: {e}")
            return None

    def publish_log(self, log_item: dict):
        try:
            self.client.publish("xiphos:logs", json.dumps(log_item))
        except Exception:
            pass

    def publish_command(self, cmd_type: str, cmd_data: dict = None):
        payload = {"type": cmd_type, "data": cmd_data or {}}
        try:
            self.client.publish("xiphos:commands", json.dumps(payload))
        except Exception as e:
            logger.error(f"Redis publish_command error: {e}")

    def subscribe_logs(self):
        self.pubsub.subscribe("xiphos:logs")
        return self.pubsub

    def subscribe_commands(self):
        self.pubsub.subscribe("xiphos:commands")
        return self.pubsub

redis_client = RedisClient()
