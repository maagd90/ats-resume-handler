import hashlib

import httpx

from src.config import settings
from src.models.profile import JobListing


class JSearchClient:
    BASE_URL = "https://jsearch.p.rapidapi.com/search"

    async def search(self, query: str) -> list[JobListing]:
        if not settings.jsearch_api_key:
            return self._mock_jobs(query)

        headers = {
            "X-RapidAPI-Key": settings.jsearch_api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        }
        params = {"query": query, "page": "1", "num_pages": "1"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(self.BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            payload = response.json()

        jobs: list[JobListing] = []
        for item in payload.get("data", []):
            jobs.append(
                JobListing(
                    id=item.get("job_id") or hashlib.md5(item.get("job_title", "").encode()).hexdigest(),
                    title=item.get("job_title") or "Unknown",
                    company=item.get("employer_name") or "Unknown",
                    location=item.get("job_city") or item.get("job_country"),
                    description=item.get("job_description") or "",
                    apply_link=item.get("job_apply_link"),
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
