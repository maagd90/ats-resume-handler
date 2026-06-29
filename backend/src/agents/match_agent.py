import re
from typing import Optional

from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile, JobListing, JobScoreResult
from src.scoring.job_matcher import (
    build_profile_document,
    compute_embedding,
    cosine_similarity,
    extract_skills_from_text,
)


def title_match(criteria_titles: list[str], job_title: str) -> float:
    if not criteria_titles:
        return 0.5
    title_lower = job_title.lower()
    for target in criteria_titles:
        tokens = target.lower().split()
        if all(token in title_lower for token in tokens if len(token) > 2):
            return 1.0
        if target.lower() in title_lower:
            return 0.8
    return 0.2


def location_match(criteria_locations: list[str], job_location: Optional[str], remote_only: bool) -> float:
    loc = (job_location or "").lower()
    if remote_only:
        return 1.0 if "remote" in loc else 0.2
    if not criteria_locations:
        return 0.5
    for target in criteria_locations:
        if target.lower() in loc or "remote" in loc:
            return 1.0
    return 0.3


def passes_criteria_filters(job: JobListing, criteria: JobCriteria) -> bool:
    text = f"{job.title} {job.description} {job.company}".lower()
    for keyword in criteria.excluded_keywords:
        if keyword.lower() in text:
            return False
    for company in criteria.excluded_companies:
        if company.lower() in job.company.lower():
            return False
    if criteria.required_skills:
        jd_text = f"{job.title} {job.description}".lower()
        jd_skills = extract_skills_from_text(job.description)

        def present(skill: str) -> bool:
            s = skill.lower()
            return s in jd_skills or s in jd_text

        if not all(present(s) for s in criteria.required_skills):
            return False
    if criteria.remote_only and job.location and "remote" not in job.location.lower():
        return False
    return True


def score_job_with_criteria(
    profile: CandidateProfile,
    job: JobListing,
    criteria: JobCriteria,
) -> JobScoreResult:
    description = job.description
    profile_doc = build_profile_document(profile)
    profile_skills = {skill.lower() for skill in profile.skills}
    jd_skills = extract_skills_from_text(description)
    matched = sorted(profile_skills.intersection(jd_skills))
    missing = sorted(jd_skills - profile_skills)
    keyword_overlap = len(matched) / max(len(jd_skills), 1)

    semantic = 0.5
    profile_embedding = profile.embedding or compute_embedding(profile_doc)
    jd_embedding = compute_embedding(description)
    if profile_embedding and jd_embedding:
        semantic = cosine_similarity(profile_embedding, jd_embedding)

    title_score = title_match(criteria.job_titles or profile.target_roles, job.title)
    loc_score = location_match(criteria.locations or profile.target_locations, job.location, criteria.remote_only)
    experience_level = 0.7 if profile.experience else 0.3

    fit_score = round(
        100
        * (
            0.4 * semantic
            + 0.25 * keyword_overlap
            + 0.15 * title_score
            + 0.10 * loc_score
            + 0.10 * experience_level
        ),
        1,
    )

    suggested_tweaks = []
    if missing:
        suggested_tweaks.append(f"Emphasize or add: {', '.join(missing[:8])}")
    if fit_score < criteria.min_fit_score:
        suggested_tweaks.append(f"Fit score {fit_score} is below threshold {criteria.min_fit_score}.")

    return JobScoreResult(
        fit_score=fit_score,
        gap_analysis={"matched_skills": matched, "missing_skills": missing},
        suggested_tweaks=suggested_tweaks,
        matched_skills=matched,
        missing_skills=missing,
    )


def rank_jobs_with_criteria(
    profile: CandidateProfile,
    jobs: list[JobListing],
    criteria: JobCriteria,
) -> list[JobListing]:
    ranked: list[JobListing] = []
    for job in jobs:
        if not passes_criteria_filters(job, criteria):
            continue
        result = score_job_with_criteria(profile, job, criteria)
        job.fit_score = result.fit_score
        job.gap_analysis = result.gap_analysis
        ranked.append(job)
    ranked.sort(key=lambda item: item.fit_score or 0, reverse=True)
    return ranked
