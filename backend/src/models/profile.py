from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website: Optional[str] = None


class ExperienceEntry(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: list[str] = Field(default_factory=list)


class EducationEntry(BaseModel):
    degree: str
    institution: str
    graduation_date: Optional[str] = None
    gpa: Optional[str] = None


class CandidateProfile(BaseModel):
    id: str
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    education: list[EducationEntry] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    target_roles: list[str] = Field(default_factory=list)
    target_locations: list[str] = Field(default_factory=list)
    linkedin_headline: Optional[str] = None
    linkedin_about: Optional[str] = None
    resume_raw_text: Optional[str] = None
    resume_file_path: Optional[str] = None
    base_resume_template: Optional[str] = None
    email_for_applications: Optional[str] = None
    cover_letter_template: Optional[str] = None
    embedding: Optional[list[float]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ATSIssue(BaseModel):
    category: str
    severity: str
    message: str
    suggestion: Optional[str] = None


class ATSScoreBreakdown(BaseModel):
    parseability: float
    structure: float
    keywords: float
    impact: float
    overall: float


class ResumeReviewResult(BaseModel):
    profile: CandidateProfile
    score: ATSScoreBreakdown
    issues: list[ATSIssue]
    section_feedback: dict[str, str]
    optimized_text: str


class LinkedInOptimizationResult(BaseModel):
    profile: CandidateProfile
    headline_variants: list[str]
    optimized_about: str
    experience_upgrades: list[dict[str, str]]
    skills_to_add: list[str]
    analysis: dict[str, str]


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    description: str
    apply_link: Optional[str] = None
    employment_type: Optional[str] = None
    posted_at: Optional[str] = None
    fit_score: Optional[float] = None
    gap_analysis: Optional[dict[str, list[str]]] = None


class JobMatchResult(BaseModel):
    jobs: list[JobListing]
    query: Optional[str] = None


class JobScoreResult(BaseModel):
    fit_score: float
    gap_analysis: dict[str, list[str]]
    suggested_tweaks: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
