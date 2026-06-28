import re

from src.models.profile import CandidateProfile
from src.scoring.ats_checker import ACTION_VERBS


def _bullet_has_metric(bullet: str) -> bool:
    return bool(re.search(r"\d", bullet))


def _bullet_starts_with_action_verb(bullet: str) -> bool:
    first_word = re.sub(r"^[-•*\s]+", "", bullet.strip()).split()[0:1]
    if not first_word:
        return False
    return first_word[0].lower() in ACTION_VERBS


def build_impact_improvement_plan(profile: CandidateProfile, current_impact: float) -> dict:
    bullets: list[tuple[str, str, str]] = []
    for entry in profile.experience:
        for bullet in entry.bullets:
            role = f"{entry.title} @ {entry.company}"
            bullets.append((role, bullet, entry.company))

    total = len(bullets)
    quantified = [item for item in bullets if _bullet_has_metric(item[1])]
    unquantified = [item for item in bullets if not _bullet_has_metric(item[1])]
    weak_verbs = [item for item in bullets if not _bullet_starts_with_action_verb(item[1])]

    quant_ratio = len(quantified) / max(total, 1)
    verb_ratio = (total - len(weak_verbs)) / max(total, 1)
    summary_words = len((profile.summary or "").split())
    summary_ok = summary_words >= 20

    checklist: list[dict] = []
    potential_gain = 0.0

    if total == 0:
        checklist.append(
            {
                "priority": "high",
                "title": "Add experience bullet points",
                "detail": "Each role should include 3–5 achievement bullets. Without bullets, ATS systems cannot assess your impact.",
                "action": "For every job, add bullets that describe what you did, how you did it, and the measurable result.",
                "examples": [
                    "Automated regression suite with Selenium, cutting release testing time by 40%.",
                    "Led a team of 12 QA engineers across 3 product lines.",
                ],
            }
        )
        potential_gain += 25
    else:
        target_quant = max(1, int(total * 0.4 + 0.999))
        if len(quantified) < target_quant:
            needed = target_quant - len(quantified)
            potential_gain += 15
            flagged = [
                {
                    "role": role,
                    "current": bullet,
                    "fix": _suggest_quantified_rewrite(bullet),
                }
                for role, bullet, _ in unquantified[:6]
            ]
            checklist.append(
                {
                    "priority": "high",
                    "title": f"Add numbers to {needed} more bullet{'s' if needed != 1 else ''}",
                    "detail": (
                        f"Only {len(quantified)} of {total} bullets ({round(quant_ratio * 100)}%) include metrics. "
                        "Reach 40%+ to maximize impact score."
                    ),
                    "action": "Add percentages, team sizes, time saved, cost reduced, defect counts, or throughput improvements.",
                    "flagged_bullets": flagged,
                    "examples": [
                        "Reduced manual testing effort by 60% through Appium mobile automation.",
                        "Improved API reliability, catching 30% more backend defects before release.",
                    ],
                }
            )

        target_verbs = max(1, int(total * 0.5 + 0.999))
        strong_verbs = total - len(weak_verbs)
        if strong_verbs < target_verbs:
            needed = target_verbs - strong_verbs
            potential_gain += 10
            flagged = [
                {
                    "role": role,
                    "current": bullet,
                    "fix": _suggest_action_verb_rewrite(bullet),
                }
                for role, bullet, _ in weak_verbs[:6]
                if not _bullet_starts_with_action_verb(bullet)
            ]
            checklist.append(
                {
                    "priority": "medium",
                    "title": f"Strengthen opening verbs on {needed} bullet{'s' if needed != 1 else ''}",
                    "detail": (
                        f"{strong_verbs} of {total} bullets ({round(verb_ratio * 100)}%) start with strong action verbs. "
                        "Aim for 50%+."
                    ),
                    "action": "Start each bullet with a past-tense action verb: Led, Built, Automated, Delivered, Reduced, Improved.",
                    "flagged_bullets": flagged,
                    "examples": [
                        "Led cross-functional QA strategy for a 16-person team.",
                        "Delivered CI/CD-integrated test automation across 4 release trains.",
                    ],
                }
            )

    if not summary_ok:
        potential_gain += 10
        checklist.append(
            {
                "priority": "medium",
                "title": "Expand your professional summary",
                "detail": (
                    f"Summary is {summary_words} words; aim for 20+ words (2–4 sentences)."
                ),
                "action": (
                    "Open with your title and years of experience, list 2–3 core strengths, "
                    "and close with the business impact you deliver."
                ),
                "examples": [
                    "Senior SDET with 13+ years building automation frameworks for enterprise and aviation products. "
                    "Expert in Selenium, API testing, and CI/CD. Known for reducing regression cycles and mentoring QA teams.",
                ],
            }
        )

    projected = min(100.0, round(current_impact + potential_gain, 1))
    return {
        "current_score": current_impact,
        "target_score": 100.0,
        "projected_score": projected,
        "checklist": checklist,
        "stats": {
            "total_bullets": total,
            "quantified_bullets": len(quantified),
            "quantified_ratio": round(quant_ratio * 100, 1),
            "action_verb_ratio": round(verb_ratio * 100, 1),
            "summary_word_count": summary_words,
        },
    }


def _suggest_quantified_rewrite(bullet: str) -> str:
    cleaned = bullet.strip().rstrip(".")
    if not cleaned:
        return "Led [initiative], achieving [X]% improvement in [metric]."
    verb = cleaned.split()[0] if cleaned.split() else "Delivered"
    topic = cleaned[:80].rstrip(".")
    return f"{verb} {topic.lower() if verb[0].isupper() else topic}, improving [metric] by [X]%."


def _suggest_action_verb_rewrite(bullet: str) -> str:
    cleaned = re.sub(r"^[-•*\s]+", "", bullet.strip())
    if not cleaned:
        return "Led cross-functional initiative that delivered measurable quality improvements."
    lowered = cleaned[0].lower() + cleaned[1:] if len(cleaned) > 1 else cleaned.lower()
    return f"Led {lowered.rstrip('.')}, resulting in [quantified outcome]."
