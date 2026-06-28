from fastapi import APIRouter
from pydantic import BaseModel

from src.models.job_criteria import JobCriteria
from src.services.data_store import data_store

router = APIRouter(prefix="/criteria", tags=["criteria"])


class CriteriaUpdate(BaseModel):
    job_titles: list[str] | None = None
    locations: list[str] | None = None
    remote_only: bool | None = None
    employment_types: list[str] | None = None
    experience_level: str | None = None
    min_salary: int | None = None
    max_salary: int | None = None
    required_skills: list[str] | None = None
    excluded_keywords: list[str] | None = None
    excluded_companies: list[str] | None = None
    min_fit_score: int | None = None
    max_applications_per_day: int | None = None
    require_approval: bool | None = None
    auto_apply_enabled: bool | None = None
    search_interval_hours: int | None = None
    preferred_apply_methods: list[str] | None = None
    is_active: bool | None = None


@router.get("")
async def get_criteria():
    return data_store.get_criteria()


@router.put("")
async def update_criteria(payload: CriteriaUpdate):
    criteria = data_store.get_criteria()
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(criteria, field, value)
    return data_store.save_criteria(criteria)
