from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from src.services.proposal_store import proposal_store

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.get("/latest")
async def get_latest_proposal():
    proposal = proposal_store.get_latest()
    if not proposal:
        raise HTTPException(status_code=404, detail="No optimization proposal found. Run optimizer first.")
    return proposal


@router.get("/{proposal_id}/download/resume")
async def download_resume(proposal_id: str):
    proposal = proposal_store.get(proposal_id)
    if not proposal or not proposal.optimized_resume_path:
        raise HTTPException(status_code=404, detail="Resume file not found")
    path = Path(proposal.optimized_resume_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(path, filename="optimized_resume.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")


@router.get("/{proposal_id}/download/linkedin")
async def download_linkedin_pack(proposal_id: str):
    proposal = proposal_store.get(proposal_id)
    if not proposal or not proposal.linkedin_pack_path:
        raise HTTPException(status_code=404, detail="LinkedIn pack not found")
    path = Path(proposal.linkedin_pack_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(path, filename="linkedin_content_pack.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
