import os
import pytest
from storage.database import Database

def test_database_initialization(tmp_path):
    db_file = tmp_path / "test.sqlite"
    db = Database(db_path=str(db_file))
    
    assert os.path.exists(db_file)
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['trades', 'signals', 'executions', 'risk_events', 'errors', 'performance']
        for t in expected_tables:
            assert t in tables

def test_trade_insertion(tmp_path):
    db_file = tmp_path / "test_trades.sqlite"
    db = Database(db_path=str(db_file))
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO trades (ticket, symbol, type, magic, volume, entry_price, sl_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (12345, "EURUSD", "BUY", 135001, 0.01, 1.1000, 1.0900, "OPEN"))
        
        cursor.execute("SELECT * FROM trades WHERE ticket=12345")
        row = cursor.fetchone()
        
        assert row["symbol"] == "EURUSD"
        assert row["magic"] == 135001
        assert row["entry_price"] == 1.1000
