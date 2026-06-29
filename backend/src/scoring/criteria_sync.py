"""Derive job search titles and locations from resume + criteria."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.job_criteria import JobCriteria
    from src.models.profile import CandidateProfile

# Generic defaults — replaced by resume roles when criteria still has these
GENERIC_TITLE_DEFAULTS = frozenset({"software engineer", "developer", "engineer"})


def _dedupe_strings(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        key = item.strip().lower()
        if key and key not in seen:
            seen.add(key)
            out.append(item.strip())
    return out


def _criteria_titles_are_generic(criteria: JobCriteria | None) -> bool:
    if not criteria or not criteria.job_titles:
        return True
    return all(t.strip().lower() in GENERIC_TITLE_DEFAULTS for t in criteria.job_titles)


def _resume_locations(profile: CandidateProfile) -> list[str]:
    locs: list[str] = []
    if profile.contact.location:
        locs.append(profile.contact.location)
    for entry in profile.experience[:3]:
        if entry.location:
            locs.append(entry.location)
    for loc in profile.target_locations or []:
        locs.append(loc)
    return _dedupe_strings(locs)


def effective_job_titles(profile: CandidateProfile, criteria: JobCriteria | None) -> list[str]:
    """Resume roles first; criteria titles only when user set specific roles."""
    resume_roles = _dedupe_strings(profile.target_roles or [])
    criteria_titles = _dedupe_strings(criteria.job_titles if criteria else [])

    if resume_roles:
        if _criteria_titles_are_generic(criteria):
            return resume_roles[:5]
        return _dedupe_strings(resume_roles + criteria_titles)[:5]

    if criteria_titles:
        return criteria_titles[:5]
    return ["Software Engineer"]


def effective_locations(profile: CandidateProfile, criteria: JobCriteria | None) -> list[str]:
    resume_locs = _resume_locations(profile)
    criteria_locs = _dedupe_strings((criteria.locations if criteria else []) or [])

    if resume_locs:
        if not criteria_locs or criteria_locs == ["Remote"]:
            return _dedupe_strings(resume_locs + ["Remote"])[:3]
        return _dedupe_strings(resume_locs + criteria_locs)[:3]

    return criteria_locs[:3] or ["Remote"]


def sync_criteria_from_resume(profile: CandidateProfile, criteria: JobCriteria) -> JobCriteria:
    """After resume upload, align search criteria with parsed resume when still on defaults."""
    if profile.target_roles and _criteria_titles_are_generic(criteria):
        criteria.job_titles = profile.target_roles[:5]

    resume_locs = _resume_locations(profile)
    if resume_locs and (not criteria.locations or criteria.locations == ["Remote"]):
        criteria.locations = _dedupe_strings(resume_locs + ["Remote"])[:3]

    return criteria
