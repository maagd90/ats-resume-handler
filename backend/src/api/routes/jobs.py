from fastapi import APIRouter, Depends, Form

from src.agents.job_agent import job_agent
from src.api.deps import get_current_user
from src.models.membership import UserAccount
from src.services.data_store import data_store

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/search")
async def search_jobs(
    query: str | None = None,
    location: str | None = None,
    user: UserAccount = Depends(get_current_user),
):
    profile = data_store.get_profile(user.id)
    criteria = data_store.get_criteria(user.id)
    return await job_agent.search(profile, query=query, location=location, criteria=criteria)


@router.post("/score")
async def score_job(
    description: str = Form(...),
    user: UserAccount = Depends(get_current_user),
):
    profile = data_store.get_profile(user.id)
    if not profile.resume_raw_text and not profile.skills:
        return {"error": "Upload a resume before scoring job descriptions."}
    return await job_agent.score_description(profile, description)
