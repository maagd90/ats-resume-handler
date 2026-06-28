from fastapi import APIRouter, Form

from src.agents.job_agent import job_agent
from src.agents.match_agent import rank_jobs_with_criteria
from src.services.data_store import data_store

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/search")
async def search_jobs(query: str | None = None, location: str | None = None, profile_id: str | None = None):
    profile = data_store.get_profile(profile_id or "default")
    criteria = data_store.get_criteria()
    return await job_agent.search(profile, query=query, location=location, criteria=criteria)


@router.post("/score")
async def score_job(
    description: str = Form(...),
    profile_id: str | None = Form(None),
):
    profile = data_store.get_profile(profile_id or "default")
    if not profile.resume_raw_text and not profile.skills:
        return {"error": "Upload a resume before scoring job descriptions."}
    return await job_agent.score_description(profile, description)
