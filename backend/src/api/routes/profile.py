from fastapi import APIRouter

from src.services.profile_store import profile_store

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(profile_id: str | None = None):
    return profile_store.get_or_create(profile_id)
