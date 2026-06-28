from datetime import datetime

from fastapi import APIRouter, HTTPException

from src.apply.apply_router import apply_router
from src.models.application import ApplicationStatus
from src.services.data_store import data_store

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("")
async def list_applications(status: str | None = None):
    return data_store.list_applications(status=status)


@router.get("/{application_id}")
async def get_application(application_id: str):
    app = data_store.get_application(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.post("/{application_id}/approve")
async def approve_application(application_id: str):
    app = data_store.get_application(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    profile = data_store.get_profile()
    criteria = data_store.get_criteria()
    app = apply_router.execute(
        app,
        profile,
        f"Application for {app.job_title}",
        app.cover_letter_text or "",
        require_approval=False,
    )
    if app.status == ApplicationStatus.APPLIED:
        app.applied_at = datetime.utcnow()
    data_store.save_application(app)
    data_store.log_activity(f"Approved application: {app.job_title} at {app.company}")
    return app


@router.post("/{application_id}/skip")
async def skip_application(application_id: str):
    app = data_store.get_application(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = ApplicationStatus.SKIPPED
    data_store.save_application(app)
    data_store.log_activity(f"Skipped application: {app.job_title} at {app.company}")
    return app


@router.post("/{application_id}/retry")
async def retry_application(application_id: str):
    app = data_store.get_application(application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    profile = data_store.get_profile()
    app.status = ApplicationStatus.READY
    app.error_message = None
    app = apply_router.execute(
        app,
        profile,
        f"Application for {app.job_title}",
        app.cover_letter_text or "",
        require_approval=False,
    )
    if app.status == ApplicationStatus.APPLIED:
        app.applied_at = datetime.utcnow()
    data_store.save_application(app)
    data_store.log_activity(f"Retried application: {app.job_title} at {app.company}")
    return app
