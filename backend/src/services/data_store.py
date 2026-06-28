import json
import uuid
from datetime import datetime, timedelta

from src.config import settings
from src.db.database import (
    ActivityLogRow,
    AgentStateRow,
    ApplicationRow,
    CriteriaRow,
    ProfileRow,
    SeenJobRow,
    get_session,
    init_db,
    today_start,
)
from src.models.application import AgentStats, AgentStatus, Application, ApplicationStatus
from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile


class DataStore:
    def __init__(self) -> None:
        init_db()

    # --- Profile ---
    def get_profile(self, profile_id: str = "default") -> CandidateProfile:
        with get_session() as session:
            row = session.get(ProfileRow, profile_id)
            if not row:
                profile = CandidateProfile(id=profile_id)
                self.save_profile(profile)
                return profile
            return CandidateProfile.model_validate_json(row.data)

    def save_profile(self, profile: CandidateProfile) -> CandidateProfile:
        profile.updated_at = datetime.utcnow()
        with get_session() as session:
            row = session.get(ProfileRow, profile.id)
            payload = profile.model_dump_json()
            if row:
                row.data = payload
                row.updated_at = profile.updated_at
            else:
                session.add(ProfileRow(id=profile.id, data=payload, updated_at=profile.updated_at))
            session.commit()
        return profile

    # --- Criteria ---
    def get_criteria(self, criteria_id: str = "default") -> JobCriteria:
        with get_session() as session:
            row = session.get(CriteriaRow, criteria_id)
            if not row:
                criteria = JobCriteria(
                    id=criteria_id,
                    min_fit_score=settings.default_min_fit_score,
                    max_applications_per_day=settings.default_max_applications_per_day,
                    search_interval_hours=settings.default_search_interval_hours,
                )
                self.save_criteria(criteria)
                return criteria
            return JobCriteria.model_validate_json(row.data)

    def save_criteria(self, criteria: JobCriteria) -> JobCriteria:
        criteria.updated_at = datetime.utcnow()
        with get_session() as session:
            row = session.get(CriteriaRow, criteria.id)
            payload = criteria.model_dump_json()
            if row:
                row.data = payload
                row.updated_at = criteria.updated_at
            else:
                session.add(CriteriaRow(id=criteria.id, data=payload, updated_at=criteria.updated_at))
            session.commit()
        return criteria

    # --- Applications ---
    def list_applications(self, status: str | None = None) -> list[Application]:
        with get_session() as session:
            query = session.query(ApplicationRow)
            if status:
                query = query.filter(ApplicationRow.status == status)
            rows = query.order_by(ApplicationRow.created_at.desc()).all()
            return [self._row_to_application(row) for row in rows]

    def get_application(self, application_id: str) -> Application | None:
        with get_session() as session:
            row = session.get(ApplicationRow, application_id)
            return self._row_to_application(row) if row else None

    def save_application(self, app: Application) -> Application:
        app.updated_at = datetime.utcnow()
        with get_session() as session:
            row = session.get(ApplicationRow, app.id)
            if row:
                self._apply_to_row(row, app)
            else:
                row = ApplicationRow(id=app.id)
                self._apply_to_row(row, app)
                session.add(row)
            session.commit()
        return app

    def count_applications_today(self, statuses: list[str] | None = None) -> int:
        with get_session() as session:
            query = session.query(ApplicationRow).filter(ApplicationRow.created_at >= today_start())
            if statuses:
                query = query.filter(ApplicationRow.status.in_(statuses))
            return query.count()

    def has_seen_job(self, job_id: str) -> bool:
        with get_session() as session:
            return session.get(SeenJobRow, job_id) is not None

    def mark_job_seen(self, job_id: str) -> None:
        with get_session() as session:
            if not session.get(SeenJobRow, job_id):
                session.add(SeenJobRow(job_id=job_id))
                session.commit()

    # --- Agent state ---
    def get_agent_status(self) -> AgentStatus:
        with get_session() as session:
            row = session.get(AgentStateRow, "default")
            if not row:
                status = AgentStatus(search_interval_hours=settings.default_search_interval_hours)
                self.save_agent_status(status)
                return status
            stats = AgentStats.model_validate(json.loads(row.stats_json or "{}"))
            return AgentStatus(
                is_running=row.is_running,
                last_run_at=row.last_run_at,
                next_run_at=row.next_run_at,
                search_interval_hours=settings.default_search_interval_hours,
                stats=stats,
                last_error=row.last_error,
            )

    def save_agent_status(self, status: AgentStatus) -> AgentStatus:
        with get_session() as session:
            row = session.get(AgentStateRow, "default")
            if not row:
                row = AgentStateRow(id="default")
                session.add(row)
            row.is_running = status.is_running
            row.last_run_at = status.last_run_at
            row.next_run_at = status.next_run_at
            row.stats_json = status.stats.model_dump_json()
            row.last_error = status.last_error
            row.updated_at = datetime.utcnow()
            session.commit()
        return status

    def log_activity(self, message: str, level: str = "info") -> None:
        with get_session() as session:
            session.add(
                ActivityLogRow(
                    id=str(uuid.uuid4()),
                    message=message,
                    level=level,
                    created_at=datetime.utcnow(),
                )
            )
            session.commit()

    def get_activity_log(self, limit: int = 50) -> list[dict]:
        with get_session() as session:
            rows = (
                session.query(ActivityLogRow)
                .order_by(ActivityLogRow.created_at.desc())
                .limit(limit)
                .all()
            )
            return [
                {"id": row.id, "message": row.message, "level": row.level, "created_at": row.created_at.isoformat()}
                for row in rows
            ]

    def refresh_agent_stats(self) -> AgentStats:
        with get_session() as session:
            start = today_start()
            found = session.query(ApplicationRow).filter(ApplicationRow.created_at >= start).count()
            applied = (
                session.query(ApplicationRow)
                .filter(ApplicationRow.created_at >= start, ApplicationRow.status == ApplicationStatus.APPLIED.value)
                .count()
            )
            failed = (
                session.query(ApplicationRow)
                .filter(ApplicationRow.created_at >= start, ApplicationRow.status == ApplicationStatus.FAILED.value)
                .count()
            )
            queued = (
                session.query(ApplicationRow)
                .filter(ApplicationRow.status.in_([ApplicationStatus.QUEUED.value, ApplicationStatus.READY.value]))
                .count()
            )
            scored = (
                session.query(ApplicationRow)
                .filter(
                    ApplicationRow.created_at >= start,
                    ApplicationRow.status.in_(
                        [
                            ApplicationStatus.SCORED.value,
                            ApplicationStatus.QUEUED.value,
                            ApplicationStatus.APPLIED.value,
                        ]
                    ),
                )
                .count()
            )
        return AgentStats(
            jobs_found_today=found,
            jobs_scored_today=scored,
            applications_submitted_today=applied,
            applications_failed_today=failed,
            applications_queued=queued,
        )

    @staticmethod
    def _row_to_application(row: ApplicationRow) -> Application:
        return Application(
            id=row.id,
            job_id=row.job_id,
            job_title=row.job_title,
            company=row.company,
            job_url=row.job_url,
            job_description=row.job_description,
            fit_score=row.fit_score or 0,
            status=ApplicationStatus(row.status),
            tailored_resume_path=row.tailored_resume_path,
            cover_letter_path=row.cover_letter_path,
            cover_letter_text=row.cover_letter_text,
            apply_method=row.apply_method,
            applied_at=row.applied_at,
            error_message=row.error_message,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )

    @staticmethod
    def _apply_to_row(row: ApplicationRow, app: Application) -> None:
        row.job_id = app.job_id
        row.job_title = app.job_title
        row.company = app.company
        row.job_url = app.job_url
        row.job_description = app.job_description
        row.fit_score = app.fit_score
        row.status = app.status.value
        row.tailored_resume_path = app.tailored_resume_path
        row.cover_letter_path = app.cover_letter_path
        row.cover_letter_text = app.cover_letter_text
        row.apply_method = app.apply_method
        row.applied_at = app.applied_at
        row.error_message = app.error_message
        row.created_at = app.created_at
        row.updated_at = app.updated_at


data_store = DataStore()
