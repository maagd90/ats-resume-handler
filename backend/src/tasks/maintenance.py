from datetime import datetime

from celery import shared_task

from src.services.usage_service import usage_service


@shared_task(name="src.tasks.maintenance.reset_monthly_quotas")
def reset_monthly_quotas() -> dict:
    count = usage_service.reset_all_monthly_quotas()
    return {"reset_accounts": count, "at": datetime.utcnow().isoformat()}
