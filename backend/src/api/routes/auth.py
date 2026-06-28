from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from src.api.deps import get_current_user
from src.models.membership import UserAccount
from src.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    try:
        user_id, token = auth_service.register(body.email, body.password, body.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return AuthResponse(access_token=token, user_id=user_id, email=body.email.lower())


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    try:
        user_id, token = auth_service.login(body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    email = auth_service.get_user_email(user_id) or body.email.lower()
    return AuthResponse(access_token=token, user_id=user_id, email=email)


@router.get("/me")
async def me(user: UserAccount = Depends(get_current_user)):
    return {
        "user_id": user.id,
        "email": user.email,
        "tier": user.tier.value,
        "billing_plan": user.billing_plan,
        "is_prime": user.tier.value == "prime",
        "prime_expires_at": user.prime_expires_at.isoformat() if user.prime_expires_at else None,
    }
