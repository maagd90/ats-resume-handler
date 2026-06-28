from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class MembershipTier(str, Enum):
    FREE = "free"
    PRIME = "prime"


class UserAccount(BaseModel):
    id: str = "default"
    email: str | None = None
    tier: MembershipTier = MembershipTier.FREE
    billing_plan: str = "free"
    coin_balance: int = 0
    optimizations_used_this_month: int = 0
    optimization_limit: int = 3
    prime_expires_at: datetime | None = None
    usage_reset_at: datetime | None = None
    stripe_customer_id: str | None = None
    stripe_checkout_session_id: str | None = None
