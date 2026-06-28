from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class JobCriteria(BaseModel):
    id: str = "default"
    user_id: str = "default"
    is_active: bool = True

    job_titles: list[str] = Field(default_factory=lambda: ["Software Engineer"])
    locations: list[str] = Field(default_factory=lambda: ["Remote"])
    remote_only: bool = False
    employment_types: list[str] = Field(default_factory=lambda: ["FULLTIME"])
    experience_level: Optional[str] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    required_skills: list[str] = Field(default_factory=list)
    excluded_keywords: list[str] = Field(default_factory=list)
    excluded_companies: list[str] = Field(default_factory=list)

    min_fit_score: int = 75
    max_applications_per_day: int = 10
    require_approval: bool = True
    auto_apply_enabled: bool = False

    search_interval_hours: int = 4
    preferred_apply_methods: list[str] = Field(default_factory=lambda: ["email", "browser", "manual"])

    updated_at: datetime = Field(default_factory=datetime.utcnow)
