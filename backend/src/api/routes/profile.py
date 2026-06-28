from fastapi import APIRouter, Depends

from src.api.deps import get_current_user
from src.models.membership import UserAccount
from src.services.data_store import data_store

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(user: UserAccount = Depends(get_current_user)):
    return data_store.get_profile(user.id)
