from fastapi import APIRouter, Depends, HTTPException, Query, Request

from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount
from src.services.billing_service import billing_service
from src.services.usage_service import usage_service

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/plans")
async def list_plans():
    return {
        "plans": billing_service.list_plans(),
        "free_tier": {
            "optimizations_per_month": settings.free_optimization_limit,
            "ai_included": True,
            "note": "Platform AI powers all tiers — users never need their own API key.",
        },
        "stripe_configured": bool(settings.stripe_secret_key) if not settings.is_production else True,
    }


@router.post("/checkout")
async def create_checkout(plan_id: str = Query(...), user: UserAccount = Depends(get_current_user)):
    try:
        return billing_service.create_checkout_session(user, plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/webhook")
async def stripe_webhook(request: Request):
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Webhook not configured")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = billing_service.verify_webhook(payload, sig)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from None

    if event["type"] == "checkout.session.completed":
        if billing_service.is_event_processed(event["id"]):
            return {"received": True, "duplicate": True}
        session = event["data"]["object"]
        if session.get("payment_status") == "paid":
            billing_service.handle_checkout_completed(session)
            billing_service.mark_event_processed(event["id"])

    return {"received": True}
