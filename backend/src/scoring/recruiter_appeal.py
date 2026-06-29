"""Human-facing recruiter appeal score (distinct from ATS parsing score)."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.profile import CandidateProfile

OWNERSHIP_VERBS = {
    "led", "owned", "drove", "spearheaded", "architected", "directed", "managed",
    "established", "launched", "pioneered", "built", "created", "delivered",
}

SCOPE_SIGNALS = re.compile(
    r"\b(\d+\+?\s*(people|engineers|developers|testers|reports|team members|clients|users|customers|"
    r"million|billion|k\b|m\b)|\$\d|budget|portfolio|enterprise|global|cross-functional)\b",
    re.I,
)


def _summary_strength(profile: CandidateProfile) -> tuple[float, str]:
    summary = (profile.summary or "").strip()
    if not summary:
        return 20.0, "Add a summary with title, years of experience, and a value proposition."
    score = 40.0
    words = summary.split()
    if len(words) >= 20:
        score += 15
    if re.search(r"\d+\+?\s*(year|yr)", summary, re.I):
        score += 15
    if any(v in summary.lower() for v in OWNERSHIP_VERBS):
        score += 15
    if SCOPE_SIGNALS.search(summary):
        score += 15
    return min(score, 100.0), "Summary should state title, years, and one concrete value proposition."


def _outcome_framing(profile: CandidateProfile) -> tuple[float, str]:
    bullets = [b for e in profile.experience for b in e.bullets]
    if not bullets:
        return 30.0, "Add experience bullets with action + metric + result."
    strong = 0
    for bullet in bullets:
        has_action = any(bullet.lower().startswith(v) for v in OWNERSHIP_VERBS) or re.match(r"^[A-Z]", bullet)
        has_metric = bool(re.search(r"\d|%|\$|k\b|m\b", bullet, re.I))
        if has_action and has_metric:
            strong += 1
    ratio = strong / len(bullets)
    score = round(40 + ratio * 60, 1)
    return min(score, 100.0), f"{strong}/{len(bullets)} bullets follow action + metric pattern."


def _top_third_impact(profile: CandidateProfile) -> tuple[float, str]:
    bullets = [b for e in profile.experience for b in e.bullets]
    if not bullets:
        return 30.0, "Lead with quantified outcomes in your most recent role."
    third = max(1, len(bullets) // 3)
    top = bullets[:third]
    quantified = sum(1 for b in top if re.search(r"\d|%|\$", b))
    ratio = quantified / len(top)
    score = round(35 + ratio * 65, 1)
    return min(score, 100.0), f"{quantified}/{len(top)} top-third bullets are quantified."


def _conciseness(profile: CandidateProfile) -> tuple[float, str]:
    bullets = [b for e in profile.experience for b in e.bullets]
    if not bullets:
        return 50.0, "Keep bullets to 1–2 lines each."
    score = 100.0
    long_bullets = sum(1 for b in bullets if len(b.split()) > 30)
    if long_bullets:
        score -= min(30, long_bullets * 10)
    if len(bullets) > 25:
        score -= 15
    return max(score, 0.0), "Aim for 4–6 bullets per recent role; trim walls of text."


def _seniority_signals(profile: CandidateProfile) -> tuple[float, str]:
    text = " ".join(
        [profile.summary or ""]
        + [f"{e.title} {e.company}" for e in profile.experience]
        + [b for e in profile.experience for b in e.bullets]
    )
    hits = len(SCOPE_SIGNALS.findall(text)) + sum(1 for v in OWNERSHIP_VERBS if re.search(rf"\b{v}\b", text, re.I))
    score = min(40 + hits * 8, 100.0)
    return score, "Signal scope: team size, budget, scale, or ownership where facts support it."


def score_recruiter_appeal(profile: CandidateProfile) -> tuple[float, list[dict]]:
    dimensions = [
        ("summary_strength", _summary_strength),
        ("outcome_framing", _outcome_framing),
        ("top_third_impact", _top_third_impact),
        ("conciseness", _conciseness),
        ("seniority_scope", _seniority_signals),
    ]
    weights = [0.2, 0.25, 0.2, 0.15, 0.2]
    checklist: list[dict] = []
    total = 0.0
    for (name, fn), weight in zip(dimensions, weights):
        score, tip = fn(profile)
        total += score * weight
        checklist.append({"dimension": name, "score": round(score, 1), "tip": tip})
    return round(total, 1), checklist
