from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MembershipTier(str, Enum):
    FREE = "free"
    PRIME = "prime"


class UserAccount(BaseModel):
    id: str = "default"
    email: str | None = None
    tier: MembershipTier = MembershipTier.FREE
    coin_balance: int = 0
    optimizations_used_this_month: int = 0
    optimization_limit: int = 3
    prime_expires_at: datetime | None = None
    usage_reset_at: datetime | None = None
