from datetime import datetime, timedelta

from src.config import settings
from src.db.database import StripeEventRow, get_session, init_db
from src.models.billing import PRIME_PLANS, BillingPlan, plan_months
from src.models.membership import MembershipTier, UserAccount
from src.services.usage_service import usage_service


class BillingService:
    def __init__(self) -> None:
        init_db()

    def is_event_processed(self, event_id: str) -> bool:
        with get_session() as session:
            return session.get(StripeEventRow, event_id) is not None

    def mark_event_processed(self, event_id: str) -> None:
        with get_session() as session:
            if not session.get(StripeEventRow, event_id):
                session.add(StripeEventRow(id=event_id, processed_at=datetime.utcnow()))
                session.commit()

    def list_plans(self) -> list[dict]:
        plans = []
        for plan, details in PRIME_PLANS.items():
            plans.append(
                {
                    "id": plan.value,
                    "months": details["months"],
                    "price_usd": details["price_usd"],
                    "monthly_equivalent": details["monthly_equivalent"],
                    "label": details["label"],
                    "description": details["description"],
                    "ai_included": True,
                }
            )
        return sorted(plans, key=lambda item: item["months"])

    def create_checkout_session(self, user: UserAccount, plan_id: str) -> dict:
        if not settings.stripe_secret_key:
            raise ValueError("Payments are not configured yet. Contact support.")

        try:
            plan = BillingPlan(plan_id)
        except ValueError as exc:
            raise ValueError(f"Unknown plan: {plan_id}") from exc

        if plan == BillingPlan.FREE:
            raise ValueError("Free plan does not require checkout.")

        details = PRIME_PLANS[plan]
        import stripe

        stripe.api_key = settings.stripe_secret_key

        session = stripe.checkout.Session.create(
            mode="payment",
            customer_email=user.email,
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": int(details["price_usd"] * 100),
                        "product_data": {
                            "name": details["label"],
                            "description": details["description"],
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "user_id": user.id,
                "plan_id": plan.value,
                "months": str(details["months"]),
            },
            success_url=f"{settings.frontend_url}/pricing?success=1",
            cancel_url=f"{settings.frontend_url}/pricing?canceled=1",
        )

        user.stripe_checkout_session_id = session.id
        usage_service.save_account(user)
        return {"checkout_url": session.url, "session_id": session.id}

    def handle_checkout_completed(self, session: dict) -> UserAccount:
        metadata = session.get("metadata") or {}
        user_id = metadata.get("user_id")
        plan_id = metadata.get("plan_id", "prime_3m")
        if not user_id:
            raise ValueError("Missing user_id in checkout metadata")

        try:
            plan = BillingPlan(plan_id)
        except ValueError:
            plan = BillingPlan.PRIME_3M

        months = plan_months(plan) or int(metadata.get("months") or 3)
        return self.activate_prime(user_id, months, plan.value, session.get("customer"))

    def activate_prime(
        self,
        user_id: str,
        months: int,
        billing_plan: str,
        stripe_customer_id: str | None = None,
    ) -> UserAccount:
        account = usage_service.get_account(user_id)
        now = datetime.utcnow()
        base = account.prime_expires_at if account.prime_expires_at and account.prime_expires_at > now else now
        account.tier = MembershipTier.PRIME
        account.billing_plan = billing_plan
        account.prime_expires_at = base + timedelta(days=months * 30)
        if stripe_customer_id:
            account.stripe_customer_id = stripe_customer_id
        usage_service.save_account(account)
        return account

    def verify_webhook(self, payload: bytes, sig_header: str) -> dict:
        import stripe

        stripe.api_key = settings.stripe_secret_key
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
        return event


billing_service = BillingService()
