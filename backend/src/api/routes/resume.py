from fastapi import APIRouter, File, UploadFile

from src.agents.resume_agent import resume_agent
from src.config import settings
from src.parsers.resume_parser import extract_text_from_file
from src.services.data_store import data_store

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), profile_id: str | None = None):
    profile = data_store.get_profile(profile_id or "default")
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
        from src.models.resume_template import DEFAULT_TEMPLATE
        updated.resume_template_settings = DEFAULT_TEMPLATE.model_dump()
    data_store.save_profile(updated)
    return updated


@router.post("/review")
async def review_resume(profile_id: str | None = None):
    profile = data_store.get_profile(profile_id or "default")
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    result = await resume_agent.review(profile)
    data_store.save_profile(result.profile)
    return result


@router.post("/optimize")
async def optimize_resume(profile_id: str | None = None):
    profile = data_store.get_profile(profile_id or "default")
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    optimized = await resume_agent.optimize(profile)
    profile.base_resume_template = optimized
    data_store.save_profile(profile)
    return {"optimized_text": optimized, "profile_id": profile.id}
