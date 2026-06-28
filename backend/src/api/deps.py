from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.models.membership import UserAccount
from src.services.auth_service import auth_service
from src.services.usage_service import usage_service

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserAccount:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    try:
        user_id = auth_service.decode_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return usage_service.get_account(user_id)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserAccount | None:
    if not credentials or not credentials.credentials:
        return None
    try:
        user_id = auth_service.decode_token(credentials.credentials)
        return usage_service.get_account(user_id)
    except ValueError:
        return None


def require_prime(user: UserAccount = Depends(get_current_user)) -> UserAccount:
    if not usage_service.is_prime(user.id):
        raise HTTPException(
            status_code=403,
            detail="Prime membership required. Choose a 3, 6, or 12-month plan — AI is included.",
        )
    return user
