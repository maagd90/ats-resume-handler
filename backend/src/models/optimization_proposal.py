from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from src.models.profile import ATSScoreBreakdown


class ProposalStatus(str, Enum):
    DRAFT = "draft"
    READY = "ready"
    APPROVED = "approved"
    DOWNLOADED = "downloaded"


class FieldChange(BaseModel):
    field: str
    section: str
    before: str
    after: str
    guidance_steps: list[str] = Field(default_factory=list)
    guidance_tip: str = ""


class OptimizationProposal(BaseModel):
    id: str
    user_id: str = "default"
    status: ProposalStatus = ProposalStatus.DRAFT
    resume_score: ATSScoreBreakdown | None = None
    resume_issues: list[dict] = Field(default_factory=list)
    impact_improvement_plan: dict | None = None
    resume_changes: list[FieldChange] = Field(default_factory=list)
    linkedin_changes: list[FieldChange] = Field(default_factory=list)
    linkedin_guidance: list[dict] = Field(default_factory=list)
    headline_variants: list[str] = Field(default_factory=list)
    skills_to_add: list[str] = Field(default_factory=list)
    validation_warnings: list[str] = Field(default_factory=list)
    optimized_resume_path: str | None = None
    linkedin_pack_path: str | None = None
    red_flags: list[dict] = Field(default_factory=list)
    recruiter_checklist: list[dict] = Field(default_factory=list)
    recruiter_feedback: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
