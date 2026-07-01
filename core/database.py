from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket = Column(Integer, unique=True)
    symbol = Column(String, nullable=False)
    type = Column(String, nullable=False)
    magic = Column(Integer, nullable=False)
    volume = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    sl_price = Column(Float, nullable=False)
    status = Column(String, nullable=False, index=True)
    open_time = Column(DateTime, default=func.now())
    close_time = Column(DateTime)
    profit = Column(Float, default=0.0)
    mfe = Column(Float, default=0.0)
    mae = Column(Float, default=0.0)
    sma_200 = Column(Float, default=0.0)
    fast_ema = Column(Float, default=0.0)
    medium_ema = Column(Float, default=0.0)
    distance_to_sma = Column(Float, default=0.0)
    projected_risk = Column(Float, default=0.0)
    latency_ms = Column(Float, default=0.0)
    holding_time_mins = Column(Float, default=0.0)

class Signal(Base):
    __tablename__ = "signals"
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, nullable=False)
    signal_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    projected_risk = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=func.now())

class Execution(Base):
    __tablename__ = "executions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket = Column(Integer)
    action = Column(String, nullable=False)
    details = Column(String, nullable=False)
    timestamp = Column(DateTime, default=func.now())

class RiskEvent(Base):
    __tablename__ = "risk_events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    timestamp = Column(DateTime, default=func.now())

class ErrorLog(Base):
    __tablename__ = "errors"
    id = Column(Integer, primary_key=True, autoincrement=True)
    module = Column(String, nullable=False)
    error_message = Column(String, nullable=False)
    traceback = Column(Text)
    timestamp = Column(DateTime, default=func.now())

class PerformanceMetric(Base):
    __tablename__ = "performance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=func.now())

class OracleDecision(Base):
    __tablename__ = "oracle_decisions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_type = Column(String, nullable=False)
    query_text = Column(Text, nullable=False)
    data_core_event = Column(Text)
    data_core_details = Column(Text)
    mahoraga_reasoning = Column(Text)
    mahoraga_adjustment = Column(Text)
    risk_check = Column(Text)
    risk_status = Column(Text)
    risk_details = Column(Text)
    xiphos_action = Column(Text)
    xiphos_latency = Column(Text)
    timestamp = Column(DateTime, default=func.now())

class MahoragaLog(Base):
    __tablename__ = "mahoraga_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String, nullable=False)
    trend_state = Column(String)
    momentum_state = Column(String)
    filter_strictness = Column(String)
    confidence_score = Column(Float)
    adaptation_spins = Column(Integer)
    fast_ema = Column(Integer)
    medium_ema = Column(Integer)
    slow_sma = Column(Integer)
    lot_multiplier = Column(Float)
    sl_multiplier = Column(Float)
    phenomenon = Column(Text)
    is_adapted = Column(Boolean)
    timestamp = Column(DateTime, default=func.now())
