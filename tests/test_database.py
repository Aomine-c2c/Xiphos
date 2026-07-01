import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from core.database import Base, Trade

@pytest.fixture
def test_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_database_initialization(test_session):
    # Check if tables exist
    result = test_session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    tables = [row[0] for row in result]
    expected_tables = ['trades', 'signals', 'executions', 'risk_events', 'errors', 'performance']
    for t in expected_tables:
        assert t in tables

def test_trade_insertion(test_session):
    trade = Trade(
        ticket=12345,
        symbol="EURUSD",
        type="BUY",
        magic=135001,
        volume=0.01,
        entry_price=1.1000,
        sl_price=1.0900,
        status="OPEN"
    )
    test_session.add(trade)
    test_session.commit()
    
    row = test_session.query(Trade).filter(Trade.ticket == 12345).first()
    assert row.symbol == "EURUSD"
    assert row.magic == 135001
    assert row.entry_price == 1.1000
