from fastapi import APIRouter, Form

from src.agents.linkedin_agent import linkedin_agent
from src.services.data_store import data_store

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze")
async def analyze_linkedin(
    linkedin_text: str = Form(...),
    profile_id: str | None = Form(None),
):
    profile = data_store.get_profile(profile_id or "default")
    result = await linkedin_agent.analyze(profile, linkedin_text)
    data_store.save_profile(result.profile)
    return result
