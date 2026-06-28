import re
from pathlib import Path

from src.models.profile import ATSIssue, ATSScoreBreakdown, CandidateProfile


REQUIRED_SECTIONS = ["experience", "education", "skills"]
ACTION_VERBS = {
    "led",
    "managed",
    "built",
    "developed",
    "designed",
    "implemented",
    "optimized",
    "delivered",
    "created",
    "improved",
    "reduced",
    "increased",
    "achieved",
    "automated",
}


def audit_resume(text: str, profile: CandidateProfile) -> tuple[ATSScoreBreakdown, list[ATSIssue]]:
    issues: list[ATSIssue] = []
    parseability = _score_parseability(text, issues)
    structure = _score_structure(text, profile, issues)
    keywords = _score_keywords(profile, issues)
    impact = _score_impact(text, profile, issues)
    overall = round(parseability * 0.3 + structure * 0.2 + keywords * 0.25 + impact * 0.25, 1)
    return (
        ATSScoreBreakdown(
            parseability=parseability,
            structure=structure,
            keywords=keywords,
            impact=impact,
            overall=overall,
        ),
        issues,
    )


def _score_parseability(text: str, issues: list[ATSIssue]) -> float:
    score = 100.0
    if re.search(r"[^\x00-\x7F]", text):
        score -= 5
        issues.append(
            ATSIssue(
                category="parseability",
                severity="low",
                message="Non-ASCII characters detected.",
                suggestion="Use standard ASCII characters for maximum ATS compatibility.",
            )
        )
    if len(re.findall(r"\t", text)) > 3:
        score -= 10
        issues.append(
            ATSIssue(
                category="parseability",
                severity="medium",
                message="Excessive tab characters may break parsing order.",
                suggestion="Replace tabs with standard line breaks.",
            )
        )
    if re.search(r"(table|column|graphic|image)", text, re.I):
        score -= 15
        issues.append(
            ATSIssue(
                category="parseability",
                severity="high",
                message="Potential tables, columns, or graphics detected.",
                suggestion="Use a single-column, text-only layout.",
            )
        )
    return max(score, 0)


def _score_structure(text: str, profile: CandidateProfile, issues: list[ATSIssue]) -> float:
    score = 100.0
    lowered = text.lower()
    for section in REQUIRED_SECTIONS:
        if section not in lowered:
            score -= 15
            issues.append(
                ATSIssue(
                    category="structure",
                    severity="high",
                    message=f"Missing '{section.title()}' section.",
                    suggestion=f"Add a clearly labeled {section.title()} section.",
                )
            )
    if not profile.contact.email:
        score -= 10
        issues.append(
            ATSIssue(
                category="structure",
                severity="medium",
                message="No email address detected.",
                suggestion="Include a professional email at the top of your resume.",
            )
        )
    return max(score, 0)


def _score_keywords(profile: CandidateProfile, issues: list[ATSIssue]) -> float:
    score = 100.0
    if len(profile.skills) < 5:
        score -= 20
        issues.append(
            ATSIssue(
                category="keywords",
                severity="medium",
                message="Skills section appears thin.",
                suggestion="Add 8-15 role-relevant skills and tools.",
            )
        )
    if not profile.target_roles:
        score -= 10
        issues.append(
            ATSIssue(
                category="keywords",
                severity="low",
                message="No target roles inferred.",
                suggestion="Tailor summary and skills to your target job titles.",
            )
        )
    return max(score, 0)


def _score_impact(text: str, profile: CandidateProfile, issues: list[ATSIssue]) -> float:
    score = 100.0
    bullets = []
    for entry in profile.experience:
        bullets.extend(entry.bullets)
    if not bullets:
        score -= 25
        issues.append(
            ATSIssue(
                category="impact",
                severity="high",
                message="No experience bullet points found.",
                suggestion="Add 3-5 quantified bullets per role.",
            )
        )
    else:
        quantified = sum(1 for bullet in bullets if re.search(r"\d", bullet))
        if quantified / max(len(bullets), 1) < 0.4:
            score -= 15
            issues.append(
                ATSIssue(
                    category="impact",
                    severity="medium",
                    message="Few quantified achievements in experience bullets.",
                    suggestion="Add metrics such as percentages, revenue, or time saved.",
                )
            )
        action_hits = sum(
            1 for bullet in bullets if any(verb in bullet.lower().split()[0:1] for verb in ACTION_VERBS)
        )
        if action_hits / max(len(bullets), 1) < 0.5:
            score -= 10
            issues.append(
                ATSIssue(
                    category="impact",
                    severity="low",
                    message="Bullets may lack strong action verbs.",
                    suggestion="Start bullets with verbs like Led, Built, Delivered, Optimized.",
                )
            )
    if not profile.summary or len(profile.summary.split()) < 20:
        score -= 10
        issues.append(
            ATSIssue(
                category="impact",
                severity="medium",
                message="Summary is missing or too short.",
                suggestion="Write a 2-4 sentence summary with role, strengths, and impact.",
            )
        )
    return max(score, 0)


def infer_target_roles(profile: CandidateProfile) -> CandidateProfile:
    if profile.target_roles:
        return profile
    roles = [entry.title for entry in profile.experience[:3] if entry.title]
    profile.target_roles = roles or ["Software Engineer"]
    return profile
