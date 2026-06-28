import re
from typing import Any

from src.models.profile import CandidateProfile


class HallucinationError(Exception):
    def __init__(self, violations: list[str]):
        self.violations = violations
        super().__init__(f"Hallucination detected: {'; '.join(violations[:5])}")


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _extract_employers(profile: CandidateProfile) -> set[str]:
    return {_normalize(e.company) for e in profile.experience if e.company}


def _extract_titles(profile: CandidateProfile) -> set[str]:
    return {_normalize(e.title) for e in profile.experience if e.title}


def _extract_institutions(profile: CandidateProfile) -> set[str]:
    return {_normalize(e.institution) for e in profile.education if e.institution}


def _extract_skills(profile: CandidateProfile) -> set[str]:
    return {_normalize(s) for s in profile.skills}


def validate_tailored_resume(profile: CandidateProfile, tailored: dict[str, Any]) -> dict[str, Any]:
    violations: list[str] = []
    allowed_employers = _extract_employers(profile)
    allowed_titles = _extract_titles(profile)
    allowed_skills = _extract_skills(profile)

    experience = tailored.get("experience") or []
    if isinstance(experience, list):
        sanitized_experience = []
        for idx, entry in enumerate(experience):
            if not isinstance(entry, dict):
                continue
            company = _normalize(entry.get("company", ""))
            title = _normalize(entry.get("title", ""))
            if company and allowed_employers and company not in allowed_employers and company != "unknown":
                violations.append(f"Unknown employer '{entry.get('company')}' in experience[{idx}]")
                continue
            if title and allowed_titles and title not in allowed_titles:
                if not any(title in t or t in title for t in allowed_titles):
                    violations.append(f"Unknown title '{entry.get('title')}' in experience[{idx}]")
                    continue
            sanitized_experience.append(entry)
        tailored["experience"] = sanitized_experience or [e.model_dump() for e in profile.experience]

    skills = tailored.get("skills") or []
    if isinstance(skills, list):
        sanitized_skills = []
        for skill in skills:
            norm = _normalize(str(skill))
            if norm in allowed_skills or any(norm in s or s in norm for s in allowed_skills):
                sanitized_skills.append(skill)
            else:
                violations.append(f"Skill '{skill}' not in base resume — removed")
        tailored["skills"] = sanitized_skills or list(profile.skills)

    tailored["_validation_warnings"] = violations
    return tailored


def validate_linkedin_output(profile: CandidateProfile, output: dict[str, Any]) -> dict[str, Any]:
    violations: list[str] = []
    allowed_skills = _extract_skills(profile)
    allowed_titles = _extract_titles(profile)

    skills_to_add = output.get("skills_to_add") or []
    sanitized = [s for s in skills_to_add if _normalize(str(s)) not in allowed_skills]
    output["skills_to_add"] = sanitized[:10]

    for upgrade in output.get("experience_upgrades") or []:
        role = _normalize(str(upgrade.get("role", "")))
        if role and not any(role in t or t in role for t in allowed_titles):
            violations.append(f"Unknown role '{upgrade.get('role')}' in experience upgrade")

    output["_validation_warnings"] = violations
    return output


def validate_cover_letter(profile: CandidateProfile, body: str, job_company: str) -> str:
    return body


def build_source_facts_block(profile: CandidateProfile) -> str:
    lines = ["=== VERIFIED FACTS (do not deviate) ==="]
    lines.append(f"Name: {profile.contact.name or 'N/A'}")
    lines.append(f"Email: {profile.contact.email or 'N/A'}")
    for entry in profile.experience:
        dates = f"{entry.start_date or '?'} – {entry.end_date or 'Present'}"
        lines.append(f"Experience: {entry.title} at {entry.company} ({dates})")
        for bullet in entry.bullets:
            lines.append(f"  - {bullet}")
    for entry in profile.education:
        lines.append(f"Education: {entry.degree} from {entry.institution}")
    lines.append(f"Skills: {', '.join(profile.skills)}")
    lines.append("=== END VERIFIED FACTS ===")
    return "\n".join(lines)
