from fastapi import APIRouter, Depends, Form

from src.agents.linkedin_agent import linkedin_agent
from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.services.data_store import data_store
from fastapi import HTTPException

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze")
async def analyze_linkedin(
    linkedin_text: str = Form(...),
    user: UserAccount = Depends(get_current_user),
):
    if not settings.llm_configured:
        raise HTTPException(status_code=503, detail="Platform AI is temporarily unavailable.")
    profile = data_store.get_profile(user.id)
    result = await linkedin_agent.analyze(profile, linkedin_text)
    data_store.save_profile(result.profile)
    return result
