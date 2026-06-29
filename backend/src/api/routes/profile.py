from datetime import datetime

from fastapi import APIRouter, Depends

from src.api.deps import get_current_user
from src.models.membership import UserAccount
from src.models.profile_update import ProfileUpdate
from src.services.data_store import data_store

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(user: UserAccount = Depends(get_current_user)):
    return data_store.get_profile(user.id)


@router.put("")
async def update_profile(payload: ProfileUpdate, user: UserAccount = Depends(get_current_user)):
    profile = data_store.get_profile(user.id)
    if payload.contact is not None:
        profile.contact = payload.contact
    if payload.summary is not None:
        profile.summary = payload.summary
    if payload.skills is not None:
        profile.skills = payload.skills
    if payload.experience is not None:
        profile.experience = payload.experience
    if payload.education is not None:
        profile.education = payload.education
    profile.updated_at = datetime.utcnow()
    data_store.save_profile(profile)
    return profile
