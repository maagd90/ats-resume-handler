from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.api.deps import get_current_user, require_prime
from src.models.membership import UserAccount
from src.services.data_store import data_store
from src.tasks.search_jobs import run_agent_cycle

router = APIRouter(prefix="/agent", tags=["agent"])


class AgentConfigUpdate(BaseModel):
    search_interval_hours: int | None = None


@router.get("/status")
async def agent_status(user: UserAccount = Depends(get_current_user)):
    status = data_store.get_agent_status()
    criteria = data_store.get_criteria(user.id)
    status.search_interval_hours = criteria.search_interval_hours
    status.stats = data_store.refresh_agent_stats()
    activity = data_store.get_activity_log(limit=20)
    return {"status": status, "activity": activity, "is_prime": True}


@router.post("/start")
async def start_agent(user: UserAccount = Depends(require_prime)):
    status = data_store.get_agent_status()
    criteria = data_store.get_criteria(user.id)
    status.is_running = True
    status.next_run_at = datetime.utcnow() + timedelta(hours=criteria.search_interval_hours)
    data_store.save_agent_status(status)
    data_store.log_activity(f"Agent started for user {user.id}.")
    try:
        run_agent_cycle.delay(user.id)
    except Exception:
        run_agent_cycle(user.id)
    return status


@router.post("/run-now")
async def run_now(user: UserAccount = Depends(require_prime)):
    try:
        task = run_agent_cycle.delay(user.id)
        return {"task_id": task.id, "message": "Agent cycle triggered."}
    except Exception:
        result = run_agent_cycle(user.id)
        return {"task_id": "sync", "message": "Agent cycle completed.", "result": result}


@router.post("/stop")
async def stop_agent(user: UserAccount = Depends(require_prime)):
    status = data_store.get_agent_status()
    status.is_running = False
    status.next_run_at = None
    data_store.save_agent_status(status)
    data_store.log_activity("Agent paused.")
    return status


@router.put("/config")
async def update_agent_config(payload: AgentConfigUpdate, user: UserAccount = Depends(require_prime)):
    criteria = data_store.get_criteria(user.id)
    if payload.search_interval_hours is not None:
        criteria.search_interval_hours = payload.search_interval_hours
        data_store.save_criteria(criteria)
    status = data_store.get_agent_status()
    status.search_interval_hours = criteria.search_interval_hours
    return status
