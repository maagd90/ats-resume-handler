from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from src.apply.apply_router import apply_router
from src.api.deps import get_current_user, require_prime
from src.models.application import ApplicationStatus
from src.models.membership import UserAccount
from src.security.url_validator import UnsafeUrlError, validate_http_url
from src.services.data_store import data_store

router = APIRouter(prefix="/applications", tags=["applications"])


def _get_owned_application(application_id: str, user: UserAccount):
    app = data_store.get_application(application_id, user.id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.get("")
async def list_applications(
    status: str | None = None,
    user: UserAccount = Depends(get_current_user),
):
    return data_store.list_applications(user.id, status=status)


@router.get("/{application_id}")
async def get_application(
    application_id: str,
    user: UserAccount = Depends(get_current_user),
):
    return _get_owned_application(application_id, user)


@router.post("/{application_id}/approve")
async def approve_application(
    application_id: str,
    user: UserAccount = Depends(require_prime),
):
    app = _get_owned_application(application_id, user)
    if app.job_url:
        try:
            validate_http_url(app.job_url, field_name="job_url")
        except UnsafeUrlError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    profile = data_store.get_profile(user.id)
    criteria = data_store.get_criteria(user.id)
    app = apply_router.execute(
        app,
        profile,
        f"Application for {app.job_title}",
        app.cover_letter_text or "",
        require_approval=False,
        user_id=user.id,
    )
    if app.status == ApplicationStatus.APPLIED:
        app.applied_at = datetime.utcnow()
    data_store.save_application(app)
    data_store.log_activity(f"Approved application: {app.job_title} at {app.company}", user_id=user.id)
    return app


@router.post("/{application_id}/skip")
async def skip_application(
    application_id: str,
    user: UserAccount = Depends(require_prime),
):
    app = _get_owned_application(application_id, user)
    app.status = ApplicationStatus.SKIPPED
    data_store.save_application(app)
    data_store.log_activity(f"Skipped application: {app.job_title} at {app.company}", user_id=user.id)
    return app


@router.post("/{application_id}/retry")
async def retry_application(
    application_id: str,
    user: UserAccount = Depends(require_prime),
):
    app = _get_owned_application(application_id, user)
    if app.job_url:
        try:
            validate_http_url(app.job_url, field_name="job_url")
        except UnsafeUrlError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    profile = data_store.get_profile(user.id)
    app.status = ApplicationStatus.READY
    app.error_message = None
    app = apply_router.execute(
        app,
        profile,
        f"Application for {app.job_title}",
        app.cover_letter_text or "",
        require_approval=False,
        user_id=user.id,
    )
    if app.status == ApplicationStatus.APPLIED:
        app.applied_at = datetime.utcnow()
    data_store.save_application(app)
    data_store.log_activity(f"Retried application: {app.job_title} at {app.company}", user_id=user.id)
    return app
