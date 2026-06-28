from fastapi import APIRouter, File, Form, UploadFile

from src.agents.linkedin_agent import linkedin_agent
from src.agents.resume_agent import resume_agent
from src.config import settings
from src.parsers.resume_parser import extract_text_from_file
from src.services.profile_store import profile_store

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), profile_id: str | None = None):
    profile = profile_store.get_or_create(profile_id)
    suffix = "." + file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else ".txt"
    dest = settings.upload_path / f"{profile.id}{suffix}"
    content = await file.read()
    dest.write_bytes(content)
    text = extract_text_from_file(dest)
    updated = await resume_agent.process_upload(text, profile.id, str(dest))
    profile_store.save(updated)
    return updated


@router.post("/review")
async def review_resume(profile_id: str | None = None):
    profile = profile_store.get_or_create(profile_id)
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    result = await resume_agent.review(profile)
    profile_store.save(result.profile)
    return result


@router.post("/optimize")
async def optimize_resume(profile_id: str | None = None):
    profile = profile_store.get_or_create(profile_id)
    if not profile.resume_raw_text:
        return {"error": "Upload a resume first."}
    optimized = await resume_agent.optimize(profile)
    return {"optimized_text": optimized, "profile_id": profile.id}
