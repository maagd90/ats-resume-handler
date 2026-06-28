from enum import Enum
from typing import TypedDict


class BillingPlan(str, Enum):
    FREE = "free"
    PRIME_3M = "prime_3m"
    PRIME_6M = "prime_6m"
    PRIME_12M = "prime_12m"


class PlanDetails(TypedDict):
    months: int
    price_usd: float
    label: str
    description: str
    monthly_equivalent: float


PRIME_PLANS: dict[BillingPlan, PlanDetails] = {
    BillingPlan.PRIME_3M: {
        "months": 3,
        "price_usd": 29.97,
        "label": "Prime — 3 Months",
        "description": "Full AI optimization + 24/7 job agent. Platform AI included.",
        "monthly_equivalent": 9.99,
    },
    BillingPlan.PRIME_6M: {
        "months": 6,
        "price_usd": 53.94,
        "label": "Prime — 6 Months",
        "description": "Save 10%. AI-powered tailoring and auto-apply included.",
        "monthly_equivalent": 8.99,
    },
    BillingPlan.PRIME_12M: {
        "months": 12,
        "price_usd": 95.88,
        "label": "Prime — 12 Months",
        "description": "Best value. All AI features included — no API keys needed.",
        "monthly_equivalent": 7.99,
    },
}


def plan_months(plan: BillingPlan) -> int:
    if plan == BillingPlan.FREE:
        return 0
    return PRIME_PLANS[plan]["months"]
