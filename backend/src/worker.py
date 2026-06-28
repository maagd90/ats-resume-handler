import uuid
from datetime import datetime, timedelta

from celery import Celery
from celery.schedules import crontab

from src.config import settings

celery_app = Celery("ats_agent", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "run-agent-cycle": {
            "task": "src.tasks.search_jobs.run_agent_cycle",
            "schedule": crontab(minute="0", hour="*/4"),
        },
        "reset-monthly-quotas": {
            "task": "src.tasks.maintenance.reset_monthly_quotas",
            "schedule": crontab(minute="0", hour="0", day_of_month="1"),
        },
    },
)

celery_app.autodiscover_tasks(["src.tasks"])
import src.tasks.search_jobs  # noqa: F401, E402
import src.tasks.maintenance  # noqa: F401, E402
