from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from src.agents.linkedin_agent import linkedin_agent
from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.parsers.linkedin_parser import normalize_linkedin_export_text
from src.parsers.resume_parser import extract_text_from_file
from src.services.data_store import data_store

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@router.post("/analyze")
async def analyze_linkedin(
    linkedin_text: str = Form(""),
    user: UserAccount = Depends(get_current_user),
    file: UploadFile | None = File(None),
):
    if not settings.llm_configured:
        raise HTTPException(status_code=503, detail="Platform AI is temporarily unavailable.")

    text = linkedin_text.strip()
    source = "paste"

    if file and file.filename:
        suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ".pdf"
        if suffix not in {".pdf", ".docx", ".txt"}:
            raise HTTPException(status_code=400, detail="LinkedIn export must be PDF, DOCX, or TXT.")
        dest = settings.upload_path / f"{user.id}_linkedin{suffix}"
        content = await file.read()
        dest.write_bytes(content)
        extracted = extract_text_from_file(dest)
        text = normalize_linkedin_export_text(extracted)
        source = "pdf" if suffix == ".pdf" else "file"

    if not text:
        raise HTTPException(status_code=400, detail="Upload a LinkedIn PDF export or paste profile text.")

    profile = data_store.get_profile(user.id)
    result = await linkedin_agent.analyze(profile, text)
    data_store.save_profile(result.profile)
    payload = result.model_dump()
    payload["source"] = source
    payload["extracted_text_preview"] = text[:2000]
    return payload
