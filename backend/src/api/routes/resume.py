from fastapi import APIRouter, Depends, File, UploadFile

from src.agents.resume_agent import resume_agent
from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.models.resume_template import DEFAULT_TEMPLATE
from src.parsers.resume_parser import extract_text_from_file
from src.services.data_store import data_store

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user: UserAccount = Depends(get_current_user),
):
    profile = data_store.get_profile(user.id)
    suffix = "." + file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else ".txt"
    dest = settings.upload_path / f"{profile.id}{suffix}"
    content = await file.read()
    dest.write_bytes(content)
    text = extract_text_from_file(dest)
    updated = await resume_agent.process_upload(text, profile.id, str(dest))
    updated.base_resume_template = text
    if updated.contact.email:
        updated.email_for_applications = updated.contact.email
    if not updated.resume_template_settings:
        updated.resume_template_settings = DEFAULT_TEMPLATE.model_dump()
    data_store.save_profile(updated)
    return updated


@router.post("/review")
async def review_resume(user: UserAccount = Depends(get_current_user)):
    profile = data_store.get_profile(user.id)
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    if not settings.llm_configured:
        return {"error": "Platform AI is temporarily unavailable."}
    result = await resume_agent.review(profile)
    data_store.save_profile(result.profile)
    return result


@router.post("/optimize")
async def optimize_resume(user: UserAccount = Depends(get_current_user)):
    profile = data_store.get_profile(user.id)
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    optimized = await resume_agent.optimize(profile)
    profile.base_resume_template = optimized
    data_store.save_profile(profile)
    return {"optimized_text": optimized, "profile_id": profile.id}
