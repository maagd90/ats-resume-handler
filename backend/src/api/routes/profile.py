from fastapi import APIRouter

from src.services.data_store import data_store

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(profile_id: str | None = None):
    return data_store.get_profile(profile_id or "default")
