from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.agents.resume_agent import resume_agent
from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.models.resume_template import DEFAULT_TEMPLATE
from src.parsers.resume_parser import extract_text_from_file, parse_profile_from_text
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
        raise HTTPException(status_code=400, detail="Upload a resume first.")
    if not settings.llm_configured:
        raise HTTPException(status_code=503, detail="Platform AI is temporarily unavailable.")
    result = await resume_agent.review(profile)
    data_store.save_profile(result.profile)
    return result


@router.post("/optimize")
async def optimize_resume(user: UserAccount = Depends(get_current_user)):
    profile = data_store.get_profile(user.id)
    if not profile.resume_raw_text:
        raise HTTPException(status_code=400, detail="Upload a resume first.")
    if not settings.llm_configured:
        raise HTTPException(status_code=503, detail="Platform AI is temporarily unavailable.")
    review = await resume_agent.review(profile)
    if review.optimized_text and review.optimized_text.strip() != (profile.resume_raw_text or "").strip():
        optimized = parse_profile_from_text(review.optimized_text, profile.id)
        optimized.resume_file_path = profile.resume_file_path
        optimized.resume_template_settings = profile.resume_template_settings or DEFAULT_TEMPLATE.model_dump()
        optimized.base_resume_template = review.optimized_text
        optimized.email_for_applications = optimized.contact.email or profile.email_for_applications
        data_store.save_profile(optimized)
        review.profile = optimized
    else:
        data_store.save_profile(review.profile)
    return review
