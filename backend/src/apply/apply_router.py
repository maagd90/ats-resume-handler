from pathlib import Path

from src.apply.browser_apply import browser_apply_executor
from src.apply.email_apply import detect_apply_email, email_apply_executor
from src.models.application import Application, ApplicationStatus
from src.models.profile import CandidateProfile
from src.services.data_store import data_store


def determine_apply_method(job_description: str, job_url: str, preferred: list[str] | None = None) -> str:
    preferred = preferred or ["email", "browser", "manual"]
    email = detect_apply_email(job_description, job_url)
    if email and "email" in preferred:
        return "email"
    if job_url and "browser" in preferred:
        return "browser"
    return "manual"


class ApplyRouter:
    def execute(
        self,
        application: Application,
        profile: CandidateProfile,
        subject: str,
        cover_body: str,
        require_approval: bool,
    ) -> Application:
        if require_approval:
            application.status = ApplicationStatus.QUEUED
            application.apply_method = determine_apply_method(
                application.job_description, application.job_url, ["email", "browser", "manual"]
            )
            return application

        criteria = data_store.get_criteria()
        method = determine_apply_method(
            application.job_description,
            application.job_url,
            criteria.preferred_apply_methods,
        )
        application.apply_method = method
        application.status = ApplicationStatus.APPLYING

        resume_path = Path(application.tailored_resume_path) if application.tailored_resume_path else None
        cover_path = Path(application.cover_letter_path) if application.cover_letter_path else None

        try:
            if method == "email":
                to_email = detect_apply_email(application.job_description, application.job_url)
                if not to_email:
                    raise RuntimeError("No apply email found in job listing.")
                email_apply_executor.send_application(
                    profile, to_email, subject, cover_body, resume_path, cover_path
                )
                application.status = ApplicationStatus.APPLIED
            elif method == "browser" and application.job_url:
                browser_apply_executor.apply(profile, application.job_url, resume_path or Path("."), cover_path)
                application.status = ApplicationStatus.APPLIED
            else:
                application.status = ApplicationStatus.QUEUED
                application.apply_method = "manual"
        except Exception as exc:
            application.status = ApplicationStatus.FAILED
            application.error_message = str(exc)
            if "CAPTCHA" in str(exc).upper() or "login" in str(exc).lower():
                application.status = ApplicationStatus.QUEUED
                application.apply_method = "manual"

        return application


apply_router = ApplyRouter()
