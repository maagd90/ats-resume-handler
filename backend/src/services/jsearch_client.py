import hashlib
import re

import httpx

from src.config import settings
from src.models.profile import JobListing
from src.security.url_validator import safe_href_or_none


class JSearchClient:
    BASE_URL = "https://jsearch.p.rapidapi.com/search-v2"

    def _country_for_query(self, query: str) -> str:
        q = query.lower()
        if any(x in q for x in ("dubai", "uae", "abu dhabi", "sharjah")):
            return "ae"
        if "uk" in q or "london" in q:
            return "gb"
        return "us"

    def _parse_jobs_payload(self, payload: dict) -> list[dict]:
        data = payload.get("data")
        if isinstance(data, dict):
            return data.get("jobs") or []
        if isinstance(data, list):
            return data
        return []

    def _best_apply_link(self, item: dict) -> str | None:
        link = item.get("job_apply_link")
        if link:
            return link
        for opt in item.get("apply_options") or []:
            if opt.get("apply_link"):
                return opt["apply_link"]
        return None

    def _format_location(self, item: dict) -> str | None:
        return (
            item.get("job_location")
            or item.get("job_city")
            or (f"{item.get('job_city')}, {item.get('job_state')}" if item.get("job_city") else None)
            or item.get("job_country")
        )

    async def search(self, query: str) -> list[JobListing]:
        if not settings.jsearch_api_key:
            return self._mock_jobs(query)

        headers = {
            "X-RapidAPI-Key": settings.jsearch_api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        }
        params = {
            "query": query,
            "page": "1",
            "num_pages": "1",
            "country": self._country_for_query(query),
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.get(self.BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            payload = response.json()

        if payload.get("message") and not self._parse_jobs_payload(payload):
            raise RuntimeError(payload.get("message"))

        jobs: list[JobListing] = []
        for item in self._parse_jobs_payload(payload):
            title = item.get("job_title") or "Unknown"
            jobs.append(
                JobListing(
                    id=item.get("job_id") or hashlib.md5(title.encode()).hexdigest(),
                    title=title,
                    company=item.get("employer_name") or "Unknown",
                    location=self._format_location(item),
                    description=item.get("job_description") or "",
                    apply_link=safe_href_or_none(self._best_apply_link(item)),
                    employment_type=item.get("job_employment_type"),
                    posted_at=item.get("job_posted_at_datetime_utc"),
                )
            )
        return jobs

    def _mock_jobs(self, query: str) -> list[JobListing]:
        return [
            JobListing(
                id="mock-1",
                title="Senior Software Engineer",
                company="TechCorp",
                location="Remote",
                description=(
                    "We are hiring a Senior Software Engineer with Python, FastAPI, React, AWS, "
                    "Docker, and SQL experience. You will build scalable APIs and lead delivery."
                ),
                apply_link="https://example.com/jobs/1",
                employment_type="FULLTIME",
            ),
            JobListing(
                id="mock-2",
                title="Full Stack Developer",
                company="StartupXYZ",
                location="New York, NY",
                description=(
                    "Looking for a Full Stack Developer skilled in JavaScript, TypeScript, Node.js, "
                    "PostgreSQL, and CI/CD. Experience with job platforms is a plus."
                ),
                apply_link="https://example.com/jobs/2",
                employment_type="FULLTIME",
            ),
            JobListing(
                id="mock-3",
                title="Backend Engineer",
                company="DataFlow Inc",
                location="San Francisco, CA",
                description=(
                    "Backend Engineer role requiring Python, Django, Redis, Kubernetes, and machine learning basics. "
                    f"Search context: {query}."
                ),
                apply_link="https://example.com/jobs/3",
                employment_type="FULLTIME",
            ),
        ]


jsearch_client = JSearchClient()
