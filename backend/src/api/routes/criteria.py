from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.api.deps import get_current_user, require_prime
from src.models.job_criteria import JobCriteria
from src.models.membership import UserAccount
from src.services.data_store import data_store
from src.scoring.criteria_sync import sync_criteria_from_resume

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
async def get_criteria(user: UserAccount = Depends(get_current_user)):
    criteria = data_store.get_criteria(user.id)
    profile = data_store.get_profile(user.id)
    if profile.target_roles:
        synced = sync_criteria_from_resume(profile, criteria)
        if synced.job_titles != criteria.job_titles or synced.locations != criteria.locations:
            synced.id = user.id
            synced.user_id = user.id
            data_store.save_criteria(synced)
            return synced
    return criteria


@router.put("")
async def update_criteria(payload: CriteriaUpdate, user: UserAccount = Depends(require_prime)):
    criteria = data_store.get_criteria(user.id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(criteria, field, value)
    criteria.id = user.id
    return data_store.save_criteria(criteria)
