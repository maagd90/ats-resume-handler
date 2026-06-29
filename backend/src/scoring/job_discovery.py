"""Shared multi-title / multi-location job discovery with deduplication."""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

from src.models.profile import JobListing
from src.scoring.criteria_sync import effective_job_titles, effective_locations

if TYPE_CHECKING:
    from src.models.job_criteria import JobCriteria
    from src.models.profile import CandidateProfile

_search_cache: dict[tuple[str, str], tuple[float, list]] = {}
CACHE_TTL_SECONDS = 3600


def build_search_queries(profile: "CandidateProfile", criteria: "JobCriteria | None") -> list[tuple[str, str]]:
    titles = effective_job_titles(profile, criteria)
    locs = effective_locations(profile, criteria)
    pairs: list[tuple[str, str]] = []
    for role in titles:
        for loc in locs:
            pairs.append((role, loc))
            if len(pairs) >= 9:
                return pairs
    return pairs


async def discover_jobs(
    profile: "CandidateProfile",
    criteria: "JobCriteria | None",
    search_fn,
) -> tuple[list[JobListing], list[str]]:
    """Search JSearch across title×location combos; dedupe by url or company|title."""
    from src.services.jsearch_client import jsearch_client

    if search_fn is None:
        search_fn = jsearch_client.search

    seen: set[str] = set()
    jobs: list[JobListing] = []
    queries: list[str] = []

    for role, loc in build_search_queries(profile, criteria):
        cache_key = (role.lower(), loc.lower())
        now = time.time()
        cached = _search_cache.get(cache_key)
        if cached and now - cached[0] < CACHE_TTL_SECONDS:
            batch = cached[1]
        else:
            batch = await search_fn(f"{role} jobs in {loc}")
            _search_cache[cache_key] = (now, batch)
        queries.append(f"{role} jobs in {loc}")
        for job in batch:
            key = (job.apply_link or "").strip() or f"{job.company}|{job.title}".lower()
            if key not in seen:
                seen.add(key)
                jobs.append(job)

    return jobs, queries
