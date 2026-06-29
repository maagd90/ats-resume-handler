from pathlib import Path

from fastapi import APIRouter, Depends, Form, HTTPException

from src.agents.optimizer_pipeline import optimizer_pipeline
from src.api.deps import get_current_user, require_llm_quota
from src.config import settings
from src.models.membership import UserAccount
from src.models.resume_template import DEFAULT_TEMPLATE, ResumeTemplateSettings
from src.services.data_store import data_store
from src.services.proposal_store import proposal_store
from src.services.usage_service import usage_service

router = APIRouter(prefix="/optimizer", tags=["optimizer"])


@router.post("/run")
async def run_optimizer(
    linkedin_text: str = Form(""),
    user: UserAccount = Depends(require_llm_quota),
):
    if not settings.llm_configured:
        raise HTTPException(
            status_code=503,
            detail="Platform AI is temporarily unavailable. Our team is on it — no action needed on your side.",
        )
    profile = data_store.get_profile(user.id)
    try:
        proposal = await optimizer_pipeline.run(profile, linkedin_text, user_id=user.id)
        return proposal
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/quota")
async def get_quota(user: UserAccount = Depends(get_current_user)):
    account = usage_service.get_account(user.id)
    return {
        "tier": account.tier.value,
        "used": account.optimizations_used_this_month,
        "limit": account.optimization_limit if not usage_service.is_prime(user.id) else 999,
        "is_prime": usage_service.is_prime(user.id),
        "platform_ai": settings.llm_configured,
    }


@router.get("/template")
async def get_template_settings(user: UserAccount = Depends(get_current_user)):
    profile = data_store.get_profile(user.id)
    if profile.resume_template_settings:
        return ResumeTemplateSettings.model_validate(profile.resume_template_settings)
    return DEFAULT_TEMPLATE


@router.put("/template")
async def update_template_settings(
    template: ResumeTemplateSettings,
    user: UserAccount = Depends(get_current_user),
):
    profile = data_store.get_profile(user.id)
    profile.resume_template_settings = template.model_dump()
    data_store.save_profile(profile)
    return template
