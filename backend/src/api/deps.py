from functools import wraps

from fastapi import HTTPException

from src.services.usage_service import usage_service


def require_prime(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not usage_service.is_prime():
            raise HTTPException(
                status_code=403,
                detail="This feature requires Prime membership. Upgrade to access the 24/7 job-hunting agent.",
            )
        return await func(*args, **kwargs)
    return wrapper
