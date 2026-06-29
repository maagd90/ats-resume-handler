from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    DISCOVERED = "discovered"
    SCORED = "scored"
    QUEUED = "queued"
    PREPARING = "preparing"
    READY = "ready"
    APPLYING = "applying"
    APPLIED = "applied"
    FAILED = "failed"
    SKIPPED = "skipped"


class Application(BaseModel):
    id: str
    user_id: str = "default"
    job_id: str
    job_title: str
    company: str
    job_url: str
    job_description: str
    fit_score: float
    status: ApplicationStatus = ApplicationStatus.DISCOVERED
    tailored_resume_path: Optional[str] = None
    cover_letter_path: Optional[str] = None
    cover_letter_text: Optional[str] = None
    apply_method: Optional[str] = None
    applied_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentStats(BaseModel):
    jobs_found_today: int = 0
    jobs_scored_today: int = 0
    applications_submitted_today: int = 0
    applications_failed_today: int = 0
    applications_queued: int = 0


class AgentStatus(BaseModel):
    is_running: bool = False
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    search_interval_hours: int = 4
    stats: AgentStats = Field(default_factory=AgentStats)
    last_error: Optional[str] = None
