from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.models.membership import UserAccount
from src.security.cookies import AUTH_COOKIE
from src.security.rate_limit import rate_limit_llm
from src.services.auth_service import auth_service
from src.services.usage_service import usage_service

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserAccount:
    token: str | None = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif AUTH_COOKIE in request.cookies:
        token = request.cookies[AUTH_COOKIE]

    if not token:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    try:
        user_id = auth_service.decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session.") from exc
    return usage_service.get_account(user_id)


async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserAccount | None:
    token: str | None = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif AUTH_COOKIE in request.cookies:
        token = request.cookies[AUTH_COOKIE]

    if not token:
        return None
    try:
        user_id = auth_service.decode_token(token)
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


async def require_llm_quota(
    request: Request,
    user: UserAccount = Depends(get_current_user),
) -> UserAccount:
    rate_limit_llm(request, user.id)
    usage_service.check_optimization_quota(user.id)
    return user
