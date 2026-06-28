from fastapi import APIRouter

from src.models.membership import MembershipTier
from src.services.usage_service import usage_service

router = APIRouter(prefix="/membership", tags=["membership"])


@router.get("")
async def get_membership():
    account = usage_service.get_account()
    return {
        "tier": account.tier.value,
        "coin_balance": account.coin_balance,
        "optimizations_used": account.optimizations_used_this_month,
        "optimization_limit": account.optimization_limit,
        "is_prime": usage_service.is_prime(),
        "prime_expires_at": account.prime_expires_at.isoformat() if account.prime_expires_at else None,
    }


@router.post("/upgrade-dev")
async def dev_upgrade_prime():
    """Dev-only endpoint to simulate Prime upgrade."""
    account = usage_service.get_account()
    account.tier = MembershipTier.PRIME
    usage_service.save_account(account)
    return account
