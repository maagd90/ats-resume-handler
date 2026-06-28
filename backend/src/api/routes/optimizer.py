from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from src.agents.optimizer_pipeline import optimizer_pipeline
from src.models.resume_template import DEFAULT_TEMPLATE, ResumeTemplateSettings
from src.services.data_store import data_store
from src.services.proposal_store import proposal_store
from src.services.usage_service import usage_service

router = APIRouter(prefix="/optimizer", tags=["optimizer"])


@router.post("/run")
async def run_optimizer(
    linkedin_text: str = Form(""),
    profile_id: str = Form("default"),
):
    profile = data_store.get_profile(profile_id)
    try:
        proposal = await optimizer_pipeline.run(profile, linkedin_text)
        return proposal
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/quota")
async def get_quota():
    account = usage_service.get_account()
    return {
        "tier": account.tier.value,
        "used": account.optimizations_used_this_month,
        "limit": account.optimization_limit if account.tier.value == "free" else 999,
        "is_prime": usage_service.is_prime(),
    }


@router.get("/template")
async def get_template_settings():
    profile = data_store.get_profile()
    if profile.resume_template_settings:
        return ResumeTemplateSettings.model_validate(profile.resume_template_settings)
    return DEFAULT_TEMPLATE


@router.put("/template")
async def update_template_settings(settings: ResumeTemplateSettings):
    profile = data_store.get_profile()
    profile.resume_template_settings = settings.model_dump()
    data_store.save_profile(profile)
    return settings
