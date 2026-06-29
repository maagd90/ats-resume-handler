"""Detect recruiter red flags in resume content."""

from __future__ import annotations

import re
from datetime import datetime
from typing import TYPE_CHECKING

from src.models.profile import RedFlag

if TYPE_CHECKING:
    from src.models.profile import CandidateProfile

CLICHES = {
    "team player",
    "hardworking",
    "hard-working",
    "go-getter",
    "synergy",
    "detail-oriented",
    "detail oriented",
    "results-driven",
    "results driven",
    "think outside the box",
    "passionate",
    "self-starter",
    "self starter",
}

DUTY_PATTERNS = [
    r"^responsible for\b",
    r"^duties included\b",
    r"^worked on\b",
    r"^helped with\b",
    r"^assisted with\b",
    r"^tasked with\b",
]

PRONOUN_RE = re.compile(r"\b(I|my|me|we|our)\b", re.I)

YEAR_RE = re.compile(r"(20\d{2}|19\d{2})")


def _parse_year(date_str: str | None) -> int | None:
    if not date_str:
        return None
    if re.search(r"present|current|now", date_str, re.I):
        return datetime.utcnow().year
    match = YEAR_RE.search(date_str)
    return int(match.group(1)) if match else None


def _months_between(start_year: int, end_year: int) -> int:
    return max(0, (end_year - start_year) * 12)


def detect_red_flags(profile: CandidateProfile, text: str) -> list[RedFlag]:
    flags: list[RedFlag] = []
    bullets = [b for e in profile.experience for b in e.bullets]

    # Missing dates
    for entry in profile.experience:
        if not entry.start_date or not entry.end_date:
            flags.append(
                RedFlag(
                    category="dates",
                    severity="medium",
                    message=f"Missing dates for {entry.title} at {entry.company}",
                    suggestion="Add start and end dates (Month Year format) for every role.",
                    evidence=f"{entry.title} | {entry.company}",
                )
            )

    # Employment gaps and job-hopping
    dated_roles: list[tuple[int, int, str]] = []
    for entry in profile.experience:
        sy = _parse_year(entry.start_date)
        ey = _parse_year(entry.end_date)
        if sy and ey:
            dated_roles.append((sy, ey, f"{entry.title} at {entry.company}"))

    dated_roles.sort(key=lambda x: x[0])
    short_stints = 0
    for sy, ey, label in dated_roles:
        duration_months = _months_between(sy, ey)
        if 0 < duration_months < 12:
            short_stints += 1
            if short_stints > 2:
                flags.append(
                    RedFlag(
                        category="job_hopping",
                        severity="high",
                        message="Multiple roles under 12 months may signal job-hopping",
                        suggestion="Group contract roles or add context for short tenures.",
                        evidence=label,
                    )
                )
                break

    for i in range(1, len(dated_roles)):
        prev_end = dated_roles[i - 1][1]
        curr_start = dated_roles[i][0]
        gap_months = _months_between(prev_end, curr_start)
        if gap_months > 6:
            flags.append(
                RedFlag(
                    category="employment_gap",
                    severity="medium",
                    message=f"Employment gap of ~{gap_months} months detected",
                    suggestion="Briefly explain the gap in your summary or cover letter if relevant.",
                    evidence=f"Between {dated_roles[i - 1][2]} and {dated_roles[i][2]}",
                )
            )

    # First-person pronouns in bullets
    for bullet in bullets:
        if PRONOUN_RE.search(bullet):
            flags.append(
                RedFlag(
                    category="pronouns",
                    severity="low",
                    message="First-person pronouns in bullet points",
                    suggestion='Rewrite in third person or omit pronouns: "Led team of 5" not "I led…"',
                    evidence=bullet[:120],
                )
            )
            break

    # Duty / passive phrasing
    for bullet in bullets:
        lower = bullet.strip().lower()
        for pattern in DUTY_PATTERNS:
            if re.search(pattern, lower):
                flags.append(
                    RedFlag(
                        category="passive_phrasing",
                        severity="medium",
                        message="Duty-oriented phrasing detected",
                        suggestion="Lead with an action verb and a measurable result.",
                        evidence=bullet[:120],
                    )
                )
                break
        else:
            continue
        break

    # Clichés
    lower_text = text.lower()
    found_cliches = [c for c in CLICHES if c in lower_text]
    if found_cliches:
        flags.append(
            RedFlag(
                category="cliches",
                severity="low",
                message=f"Overused phrases: {', '.join(found_cliches[:3])}",
                suggestion="Replace clichés with specific achievements and metrics.",
                evidence=found_cliches[0],
            )
        )

    # Length heuristics
    word_count = len(text.split())
    if word_count < 150:
        flags.append(
            RedFlag(
                category="length",
                severity="medium",
                message="Resume appears too short for most professional roles",
                suggestion="Expand experience bullets with scope, actions, and outcomes.",
                evidence=f"~{word_count} words",
            )
        )
    elif word_count > 900:
        flags.append(
            RedFlag(
                category="length",
                severity="medium",
                message="Resume may exceed two pages when formatted",
                suggestion="Trim older roles and focus on the most relevant 10–15 years.",
                evidence=f"~{word_count} words",
            )
        )

    return flags
