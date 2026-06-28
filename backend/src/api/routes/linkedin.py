from fastapi import APIRouter, Form

from src.agents.linkedin_agent import linkedin_agent
from src.services.profile_store import profile_store

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze")
async def analyze_linkedin(
    linkedin_text: str = Form(...),
    profile_id: str | None = Form(None),
):
    profile = profile_store.get_or_create(profile_id)
    result = await linkedin_agent.analyze(profile, linkedin_text)
    profile_store.save(result.profile)
    return result
