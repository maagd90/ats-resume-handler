from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.services.data_store import data_store
from src.services.usage_service import usage_service
from src.tasks.search_jobs import run_agent_cycle

router = APIRouter(prefix="/agent", tags=["agent"])


class AgentConfigUpdate(BaseModel):
    search_interval_hours: int | None = None


@router.get("/status")
async def agent_status():
    status = data_store.get_agent_status()
    criteria = data_store.get_criteria()
    status.search_interval_hours = criteria.search_interval_hours
    status.stats = data_store.refresh_agent_stats()
    activity = data_store.get_activity_log(limit=20)
    return {"status": status, "activity": activity}


@router.post("/start")
async def start_agent():
    if not usage_service.is_prime():
        raise HTTPException(status_code=403, detail="Prime membership required for the 24/7 job agent.")
    status = data_store.get_agent_status()
    criteria = data_store.get_criteria()
    status.is_running = True
    status.next_run_at = datetime.utcnow() + timedelta(hours=criteria.search_interval_hours)
    data_store.save_agent_status(status)
    data_store.log_activity("Agent started.")
    try:
        run_agent_cycle.delay()
    except Exception:
        run_agent_cycle()
    return status


@router.post("/run-now")
async def run_now():
    if not usage_service.is_prime():
        raise HTTPException(status_code=403, detail="Prime membership required for the 24/7 job agent.")
    try:
        task = run_agent_cycle.delay()
        return {"task_id": task.id, "message": "Agent cycle triggered."}
    except Exception:
        result = run_agent_cycle()
        return {"task_id": "sync", "message": "Agent cycle completed.", "result": result}


@router.post("/stop")
async def stop_agent():
    status = data_store.get_agent_status()
    status.is_running = False
    status.next_run_at = None
    data_store.save_agent_status(status)
    data_store.log_activity("Agent paused.")
    return status


@router.put("/config")
async def update_agent_config(payload: AgentConfigUpdate):
    criteria = data_store.get_criteria()
    if payload.search_interval_hours is not None:
        criteria.search_interval_hours = payload.search_interval_hours
        data_store.save_criteria(criteria)
    status = data_store.get_agent_status()
    status.search_interval_hours = criteria.search_interval_hours
    return status
