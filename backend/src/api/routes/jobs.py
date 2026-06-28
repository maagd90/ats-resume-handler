from fastapi import APIRouter, Form

from src.agents.job_agent import job_agent
from src.services.profile_store import profile_store

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/search")
async def search_jobs(query: str | None = None, location: str | None = None, profile_id: str | None = None):
    profile = profile_store.get_or_create(profile_id)
    return await job_agent.search(profile, query=query, location=location)


@router.post("/score")
async def score_job(
    description: str = Form(...),
    profile_id: str | None = Form(None),
):
    profile = profile_store.get_or_create(profile_id)
    if not profile.resume_raw_text and not profile.skills:
        return {"error": "Upload a resume before scoring job descriptions."}
    return await job_agent.score_description(profile, description)
