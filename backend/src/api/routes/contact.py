"""Public contact form — rate limited, no auth required."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

from src.db.database import ActivityLogRow, get_session
from src.security.rate_limit import rate_limit_auth

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactRequest(BaseModel):
    name: str = Field(default="", max_length=120)
    email: EmailStr
    message: str = Field(min_length=10, max_length=5000)


@router.post("")
async def submit_contact(body: ContactRequest, request: Request):
    rate_limit_auth(request)
    with get_session() as session:
        session.add(
            ActivityLogRow(
                id=str(uuid.uuid4()),
                user_id="contact",
                message=f"Contact from {body.email}: {body.message[:500]}",
                level="contact",
                created_at=datetime.utcnow(),
            )
        )
        session.commit()
    return {"ok": True, "message": "Thank you — we will respond within 2 business days."}
