from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from src.agents.linkedin_agent import linkedin_agent
from src.api.deps import get_current_user, require_llm_quota
from src.config import settings
from src.models.membership import UserAccount
from src.parsers.linkedin_parser import normalize_linkedin_export_text
from src.parsers.resume_parser import extract_text_from_file
from src.security.upload_validator import LINKEDIN_EXTENSIONS, read_upload_limited
from src.services.data_store import data_store
from src.services.usage_service import usage_service

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze")
async def analyze_linkedin(
    linkedin_text: str = Form(""),
    user: UserAccount = Depends(require_llm_quota),
    file: UploadFile | None = File(None),
):
    if not settings.llm_configured:
        raise HTTPException(status_code=503, detail="Platform AI is temporarily unavailable.")

    text = linkedin_text.strip()
    source = "paste"

    if file and file.filename:
        content, suffix = await read_upload_limited(file, allowed=LINKEDIN_EXTENSIONS)
        dest = settings.upload_path / f"{user.id}_linkedin{suffix}"
        dest.write_bytes(content)
        extracted = extract_text_from_file(dest)
        text = normalize_linkedin_export_text(extracted)
        source = "pdf" if suffix == ".pdf" else "file"

    if not text:
        raise HTTPException(status_code=400, detail="Upload a LinkedIn PDF export or paste profile text.")

    profile = data_store.get_profile(user.id)
    result = await linkedin_agent.analyze(profile, text)
    data_store.save_profile(result.profile)
    usage_service.increment_optimization(user.id)
    payload = result.model_dump()
    payload["source"] = source
    return payload
