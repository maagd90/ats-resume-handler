from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from src.api.deps import get_current_user
from src.models.membership import UserAccount
from src.services.export_service import ensure_ascii_linkedin_export, ensure_ascii_resume_export
from src.services.proposal_store import proposal_store

router = APIRouter(prefix="/proposals", tags=["proposals"])

DOCX_MEDIA = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@router.get("/latest")
async def get_latest_proposal(user: UserAccount = Depends(get_current_user)):
    proposal = proposal_store.get_latest(user.id)
    if not proposal:
        raise HTTPException(status_code=404, detail="No optimization proposal found. Run optimizer first.")
    return proposal


@router.get("/{proposal_id}/download/resume")
async def download_resume(
    proposal_id: str,
    ascii_safe: bool = Query(False),
    user: UserAccount = Depends(get_current_user),
):
    proposal = proposal_store.get(proposal_id)
    if not proposal or proposal.user_id != user.id or not proposal.optimized_resume_path:
        raise HTTPException(status_code=404, detail="Resume file not found")

    if ascii_safe:
        try:
            path = ensure_ascii_resume_export(proposal, user.id)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        filename = "optimized_resume_ascii.docx"
    else:
        path = Path(proposal.optimized_resume_path)
        filename = "optimized_resume.docx"

    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(path, filename=filename, media_type=DOCX_MEDIA)


@router.get("/{proposal_id}/download/linkedin")
async def download_linkedin_pack(
    proposal_id: str,
    ascii_safe: bool = Query(False),
    user: UserAccount = Depends(get_current_user),
):
    proposal = proposal_store.get(proposal_id)
    if not proposal or proposal.user_id != user.id or not proposal.linkedin_pack_path:
        raise HTTPException(status_code=404, detail="LinkedIn pack not found")

    if ascii_safe:
        try:
            path = ensure_ascii_linkedin_export(proposal, user.id)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        filename = "linkedin_content_pack_ascii.docx"
    else:
        path = Path(proposal.linkedin_pack_path)
        filename = "linkedin_content_pack.docx"

    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(path, filename=filename, media_type=DOCX_MEDIA)
