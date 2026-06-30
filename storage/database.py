import sqlite3
import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from core.config import settings
from core.logger import log
from core.paths import get_base_dir

class PostgresCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, vars=None):
        if vars is not None:
            query = query.replace("?", "%s")
        return self._cursor.execute(query, vars)
        
    def fetchall(self):
        return self._cursor.fetchall()
        
    def fetchone(self):
        return self._cursor.fetchone()
        
    def __getattr__(self, name):
        return getattr(self._cursor, name)

class PostgresConnectionWrapper:
    def __init__(self, conn):
        self._conn = conn
        
    def cursor(self):
        return PostgresCursorWrapper(self._conn.cursor())
        
    def commit(self):
        self._conn.commit()
        
    def close(self):
        self._conn.close()
        
    def __enter__(self):
        self._conn.__enter__()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self._conn.__exit__(exc_type, exc_val, exc_tb)
        
class Database:
    def __init__(self):
        self.use_postgres = False
        
        # Try Postgres first
        if hasattr(settings.database, 'url') and settings.database.url:
            try:
                # Test connection
                conn = psycopg2.connect(settings.database.url)
                conn.close()
                self.use_postgres = True
                self.pg_url = settings.database.url
                log.info(f"Successfully connected to PostgreSQL Data Warehouse.")
            except Exception as e:
                log.warning(f"Failed to connect to Postgres ({e}). Falling back to SQLite.")
                
        if not self.use_postgres:
            base_dir = get_base_dir()
            self.sqlite_path = os.path.join(base_dir, settings.database.path)
            os.makedirs(os.path.dirname(self.sqlite_path), exist_ok=True)
            log.info(f"Using SQLite Database at {self.sqlite_path}")
            
        self._create_schema()
        
    @contextmanager
    def get_connection(self):
        if self.use_postgres:
            raw_conn = psycopg2.connect(self.pg_url)
            raw_conn.cursor_factory = psycopg2.extras.DictCursor
            conn = PostgresConnectionWrapper(raw_conn)
        else:
            conn = sqlite3.connect(self.sqlite_path)
            conn.row_factory = sqlite3.Row
            
        try:
            yield conn
        finally:
            conn.commit()
            conn.close()
            
    def _create_schema(self):
        log.info(f"Initializing {'PostgreSQL' if self.use_postgres else 'SQLite'} database schema...")
        
        pk_type = "SERIAL PRIMARY KEY" if self.use_postgres else "INTEGER PRIMARY KEY AUTOINCREMENT"
        
        with self.get_connection() as conn:
            cursor = conn.cursor()

            if self.use_postgres:
                try:
                    cursor.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
                except Exception as e:
                    log.warning(f"Could not initialize timescaledb extension: {e}")
            
            # Trades Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS trades (
                    id {pk_type},
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
                    # Postgres requires committing failed transactions if inside a block
                    if self.use_postgres:
                        try:
                            with conn:
                                with conn.cursor() as cur:
                                    cur.execute(f"ALTER TABLE trades ADD COLUMN {col_name} {col_type}")
                        except psycopg2.errors.DuplicateColumn:
                            pass
                    else:
                        cursor.execute(f"ALTER TABLE trades ADD COLUMN {col_name} {col_type}")
                except sqlite3.OperationalError:
                    pass

            # Trades Table Indexes for O(log N) Reconciliation
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_ticket ON trades(ticket)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_trades_magic ON trades(magic)")
            
            # Signals Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS signals (
                    id {pk_type},
                    symbol TEXT NOT NULL,
                    signal_type TEXT NOT NULL,
                    price REAL NOT NULL,
                    distance REAL NOT NULL,
                    projected_risk REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Executions Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS executions (
                    id {pk_type},
                    ticket INTEGER,
                    action TEXT NOT NULL,
                    details TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Risk Events Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS risk_events (
                    id {pk_type},
                    event_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Errors Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS errors (
                    id {pk_type},
                    module TEXT NOT NULL,
                    error_message TEXT NOT NULL,
                    traceback TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Performance Metrics
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS performance (
                    id {pk_type},
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Oracle Decisions Table
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS oracle_decisions (
                    id {pk_type},
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

            # Mahoraga Logs Table (Replacement for CSV)
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS mahoraga_logs (
                    id {pk_type},
                    symbol TEXT NOT NULL,
                    trend_state TEXT,
                    momentum_state TEXT,
                    filter_strictness TEXT,
                    confidence_score REAL,
                    adaptation_spins INTEGER,
                    fast_ema INTEGER,
                    medium_ema INTEGER,
                    slow_sma INTEGER,
                    lot_multiplier REAL,
                    sl_multiplier REAL,
                    phenomenon TEXT,
                    is_adapted BOOLEAN,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            if self.use_postgres:
                try:
                    # Convert to TimescaleDB hypertables
                    cursor.execute("SELECT create_hypertable('signals', 'timestamp', if_not_exists => TRUE);")
                    cursor.execute("SELECT create_hypertable('performance', 'timestamp', if_not_exists => TRUE);")
                    cursor.execute("SELECT create_hypertable('mahoraga_logs', 'timestamp', if_not_exists => TRUE);")
                except Exception as e:
                    log.warning(f"Could not create hypertables: {e}")

db = Database()
