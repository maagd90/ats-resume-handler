from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.services.billing_service import billing_service
from src.services.usage_service import usage_service

router = APIRouter(prefix="/membership", tags=["membership"])


@router.get("")
async def get_membership(user: UserAccount = Depends(get_current_user)):
    account = usage_service.get_account(user.id)
    return {
        "tier": account.tier.value,
        "billing_plan": account.billing_plan,
        "coin_balance": account.coin_balance,
        "optimizations_used": account.optimizations_used_this_month,
        "optimization_limit": account.optimization_limit,
        "is_prime": usage_service.is_prime(user.id),
        "prime_expires_at": account.prime_expires_at.isoformat() if account.prime_expires_at else None,
        "platform_ai_enabled": settings.llm_configured,
        "plans": billing_service.list_plans(),
    }


if not settings.is_production:

    @router.post("/upgrade-dev")
    async def dev_upgrade_prime(user: UserAccount = Depends(get_current_user)):
        """Dev-only endpoint to simulate Prime upgrade."""
        from datetime import datetime, timedelta

        from src.models.membership import MembershipTier

        account = usage_service.get_account(user.id)
        account.tier = MembershipTier.PRIME
        account.billing_plan = "prime_3m"
        account.prime_expires_at = datetime.utcnow() + timedelta(days=90)
        usage_service.save_account(account)
        return {
            "tier": account.tier.value,
            "is_prime": True,
            "prime_expires_at": account.prime_expires_at.isoformat() if account.prime_expires_at else None,
        }
