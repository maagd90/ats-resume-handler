import uuid
from datetime import datetime

from fastapi import HTTPException

from src.config import settings
from src.db.database import UserAccountRow, get_session, init_db
from src.models.membership import MembershipTier, UserAccount


class UsageService:
    def __init__(self) -> None:
        init_db()

    def get_account(self, user_id: str = "default") -> UserAccount:
        with get_session() as session:
            row = session.get(UserAccountRow, user_id)
            if not row:
                account = UserAccount(
                    id=user_id,
                    optimization_limit=int(getattr(settings, "free_optimization_limit", 3)),
                )
                self._save(session, account)
                return account
            account = UserAccount.model_validate_json(row.data)
            account = self._maybe_reset_monthly_usage(account)
            return account

    def check_optimization_quota(self, user_id: str = "default") -> UserAccount:
        account = self.get_account(user_id)
        if account.tier == MembershipTier.PRIME and self.is_prime(user_id):
            return account
        if account.optimizations_used_this_month >= account.optimization_limit:
            raise HTTPException(
                status_code=402,
                detail=f"Optimization limit reached ({account.optimization_limit}/month). Upgrade to Prime for unlimited runs.",
            )
        return account

    def increment_optimization(self, user_id: str = "default") -> UserAccount:
        account = self.get_account(user_id)
        if account.tier != MembershipTier.PRIME or not self.is_prime(user_id):
            account.optimizations_used_this_month += 1
        self.save_account(account)
        return account

    def save_account(self, account: UserAccount) -> UserAccount:
        with get_session() as session:
            self._save(session, account)
        return account

    def is_prime(self, user_id: str = "default") -> bool:
        account = self.get_account(user_id)
        if account.tier == MembershipTier.PRIME:
            if account.prime_expires_at and account.prime_expires_at < datetime.utcnow():
                account.tier = MembershipTier.FREE
                account.billing_plan = "free"
                self.save_account(account)
                return False
            return True
        return False

    def reset_all_monthly_quotas(self) -> int:
        now = datetime.utcnow()
        reset_count = 0
        with get_session() as session:
            rows = session.query(UserAccountRow).all()
            for row in rows:
                account = UserAccount.model_validate_json(row.data)
                if (
                    account.tier == MembershipTier.PRIME
                    and account.prime_expires_at
                    and account.prime_expires_at > now
                ):
                    continue
                account.optimizations_used_this_month = 0
                account.usage_reset_at = now
                row.data = account.model_dump_json()
                reset_count += 1
            session.commit()
        return reset_count

    def _maybe_reset_monthly_usage(self, account: UserAccount) -> UserAccount:
        now = datetime.utcnow()
        if account.tier == MembershipTier.PRIME and account.prime_expires_at and account.prime_expires_at > now:
            return account

        last_reset = account.usage_reset_at
        if last_reset and last_reset.year == now.year and last_reset.month == now.month:
            return account

        if account.optimizations_used_this_month > 0:
            account.optimizations_used_this_month = 0
            account.usage_reset_at = now
            self.save_account(account)
        return account

    @staticmethod
    def _save(session, account: UserAccount) -> None:
        row = session.get(UserAccountRow, account.id)
        payload = account.model_dump_json()
        if row:
            row.data = payload
        else:
            session.add(UserAccountRow(id=account.id, data=payload))
        session.commit()


usage_service = UsageService()
