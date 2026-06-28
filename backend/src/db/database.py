import json
from datetime import datetime, date
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, Float, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from src.config import settings


class Base(DeclarativeBase):
    pass


class ProfileRow(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True)
    data = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)


class CriteriaRow(Base):
    __tablename__ = "job_criteria"
    id = Column(String, primary_key=True)
    data = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ApplicationRow(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True)
    job_id = Column(String, index=True)
    job_title = Column(String)
    company = Column(String)
    job_url = Column(Text)
    job_description = Column(Text)
    fit_score = Column(Float, default=0)
    status = Column(String, index=True)
    tailored_resume_path = Column(Text, nullable=True)
    cover_letter_path = Column(Text, nullable=True)
    cover_letter_text = Column(Text, nullable=True)
    apply_method = Column(String, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class SeenJobRow(Base):
    __tablename__ = "seen_jobs"
    job_id = Column(String, primary_key=True)
    seen_at = Column(DateTime, default=datetime.utcnow)


class AgentStateRow(Base):
    __tablename__ = "agent_state"
    id = Column(String, primary_key=True, default="default")
    is_running = Column(Boolean, default=False)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    stats_json = Column(Text, default="{}")
    last_error = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ActivityLogRow(Base):
    __tablename__ = "activity_log"
    id = Column(String, primary_key=True)
    message = Column(Text)
    level = Column(String, default="info")
    created_at = Column(DateTime, default=datetime.utcnow)


class UserAccountRow(Base):
    __tablename__ = "user_accounts"
    id = Column(String, primary_key=True)
    data = Column(Text, nullable=False)


class ProposalRow(Base):
    __tablename__ = "optimization_proposals"
    id = Column(String, primary_key=True)
    data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


engine = create_engine(settings.sync_database_url, connect_args={"check_same_thread": False} if "sqlite" in settings.sync_database_url else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    return SessionLocal()


def today_start() -> datetime:
    return datetime.combine(date.today(), datetime.min.time())
