import sqlite3
import os
from contextlib import contextmanager
from core.config import settings
from core.logger import log
from core.paths import get_base_dir

class Database:
    def __init__(self, db_path: str = None):
        if db_path is None:
            base_dir = get_base_dir()
            self.db_path = os.path.join(base_dir, settings.database.path)
        else:
            self.db_path = db_path
            
        # Ensure storage directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self._create_schema()
        
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.commit()
            conn.close()
            
    def _create_schema(self):
        log.info("Initializing SQLite database schema...")
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Trades Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticket INTEGER UNIQUE,
                    symbol TEXT NOT NULL,
                    type TEXT NOT NULL,
                    magic INTEGER NOT NULL,
                    volume REAL NOT NULL,
                    entry_price REAL NOT NULL,
                    sl_price REAL NOT NULL,
                    status TEXT NOT NULL,
                    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    close_time TIMESTAMP,
                    profit REAL DEFAULT 0.0
                )
            """)
            
            # Deep Analytics Schema Migrations
            REAL_DEFAULT_0 = "REAL DEFAULT 0.0"
            new_columns = [
                ("mfe", REAL_DEFAULT_0),
                ("mae", REAL_DEFAULT_0),
                ("sma_200", REAL_DEFAULT_0),
                ("fast_ema", REAL_DEFAULT_0),
                ("medium_ema", REAL_DEFAULT_0),
                ("distance_to_sma", REAL_DEFAULT_0),
                ("projected_risk", REAL_DEFAULT_0),
                ("latency_ms", REAL_DEFAULT_0),
                ("holding_time_mins", REAL_DEFAULT_0)
            ]
            for col_name, col_type in new_columns:
                try:
                    cursor.execute(f"ALTER TABLE trades ADD COLUMN {col_name} {col_type}")
                except sqlite3.OperationalError:
                    pass # Column already exists
            
            # Signals Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS signals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    signal_type TEXT NOT NULL,
                    price REAL NOT NULL,
                    distance REAL NOT NULL,
                    projected_risk REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Executions Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS executions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticket INTEGER,
                    action TEXT NOT NULL,
                    details TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Risk Events Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Errors Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS errors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    module TEXT NOT NULL,
                    error_message TEXT NOT NULL,
                    traceback TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Performance Metrics
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS performance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Oracle Decisions Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS oracle_decisions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    decision_type TEXT NOT NULL,
                    query_text TEXT NOT NULL,
                    data_core_event TEXT,
                    data_core_details TEXT,
                    mahoraga_reasoning TEXT,
                    mahoraga_adjustment TEXT,
                    risk_check TEXT,
                    risk_status TEXT,
                    risk_details TEXT,
                    xiphos_action TEXT,
                    xiphos_latency TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

db = Database()
