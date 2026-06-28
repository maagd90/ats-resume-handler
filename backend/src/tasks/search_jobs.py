import asyncio
import uuid
from datetime import datetime, timedelta

from src.agents.cover_letter_agent import cover_letter_agent
from src.agents.match_agent import rank_jobs_with_criteria, score_job_with_criteria
from src.agents.tailor_agent import tailor_agent
from src.apply.apply_router import apply_router
from src.models.application import Application, ApplicationStatus
from src.models.profile import JobListing
from src.services.data_store import data_store
from src.services.jsearch_client import jsearch_client
from src.models.resume_template import DEFAULT_TEMPLATE, ResumeTemplateSettings
from src.services.resume_renderer import ResumeRenderer, resume_renderer
from src.worker import celery_app


def _run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


@celery_app.task(name="src.tasks.search_jobs.run_agent_cycle")
def run_agent_cycle(user_id: str = "default"):
    status = data_store.get_agent_status()
    if not status.is_running:
        return {"skipped": True, "reason": "agent paused"}

    criteria = data_store.get_criteria(user_id)
    if not criteria.is_active or not criteria.auto_apply_enabled:
        return {"skipped": True, "reason": "criteria inactive"}

    profile = data_store.get_profile(user_id)
    if not profile.resume_raw_text:
        data_store.log_activity("Agent cycle skipped: no resume uploaded.", "warning")
        return {"skipped": True, "reason": "no resume"}

    applied_today = data_store.count_applications_today([ApplicationStatus.APPLIED.value])
    if applied_today >= criteria.max_applications_per_day:
        data_store.log_activity("Daily application cap reached.", "info")
        return {"skipped": True, "reason": "daily cap reached"}

    processed = 0
    try:
        for title in criteria.job_titles[:3]:
            for location in criteria.locations[:2]:
                query = f"{title} jobs in {location}"
                jobs = _run_async(jsearch_client.search(query))
                ranked = rank_jobs_with_criteria(profile, jobs, criteria)

                for job in ranked:
                    if data_store.has_seen_job(job.id):
                        continue
                    data_store.mark_job_seen(job.id)

                    result = score_job_with_criteria(profile, job, criteria)
                    app = Application(
                        id=str(uuid.uuid4()),
                        job_id=job.id,
                        job_title=job.title,
                        company=job.company,
                        job_url=job.apply_link or "",
                        job_description=job.description,
                        fit_score=result.fit_score,
                        status=ApplicationStatus.DISCOVERED,
                    )

                    if result.fit_score < criteria.min_fit_score:
                        app.status = ApplicationStatus.SCORED
                        data_store.save_application(app)
                        continue

                    app.status = ApplicationStatus.PREPARING
                    data_store.save_application(app)

                    tailored = _run_async(tailor_agent.tailor(profile, job.title, job.description))
                    app_dir = resume_renderer.application_dir(app.id)
                    tmpl = DEFAULT_TEMPLATE
                    if profile.resume_template_settings:
                        tmpl = ResumeTemplateSettings.model_validate(profile.resume_template_settings)
                    renderer = ResumeRenderer(tmpl)
                    resume_path = renderer.render_docx(profile, tailored, app_dir / "resume.docx", tmpl)

                    cover = _run_async(
                        cover_letter_agent.generate(
                            profile,
                            job.title,
                            job.company,
                            job.description,
                            tailored.get("tailored_text", ""),
                        )
                    )
                    cover_path = resume_renderer.render_cover_letter_txt(cover.get("body", ""), app_dir / "cover_letter.txt")

                    app.tailored_resume_path = str(resume_path)
                    app.cover_letter_path = str(cover_path)
                    app.cover_letter_text = cover.get("body", "")
                    app.status = ApplicationStatus.READY

                    if criteria.require_approval:
                        app.status = ApplicationStatus.QUEUED
                        data_store.save_application(app)
                        data_store.log_activity(f"Queued for approval: {job.title} at {job.company}")
                        processed += 1
                        continue

                    if applied_today + processed >= criteria.max_applications_per_day:
                        app.status = ApplicationStatus.QUEUED
                        data_store.save_application(app)
                        break

                    app = apply_router.execute(
                        app,
                        profile,
                        cover.get("subject", f"Application for {job.title}"),
                        cover.get("body", ""),
                        criteria.require_approval,
                    )
                    if app.status == ApplicationStatus.APPLIED:
                        app.applied_at = datetime.utcnow()
                        applied_today += 1
                        data_store.log_activity(f"Applied: {job.title} at {job.company} via {app.apply_method}")
                    elif app.status == ApplicationStatus.FAILED:
                        data_store.log_activity(f"Apply failed: {job.title} — {app.error_message}", "error")
                    else:
                        data_store.log_activity(f"Queued: {job.title} at {job.company}")

                    data_store.save_application(app)
                    processed += 1

        status.last_run_at = datetime.utcnow()
        status.next_run_at = status.last_run_at + timedelta(hours=criteria.search_interval_hours)
        status.stats = data_store.refresh_agent_stats()
        status.last_error = None
        data_store.save_agent_status(status)
        data_store.log_activity(f"Agent cycle complete. Processed {processed} jobs.")
        return {"processed": processed}

    except Exception as exc:
        status.last_error = str(exc)
        data_store.save_agent_status(status)
        data_store.log_activity(f"Agent cycle error: {exc}", "error")
        raise
