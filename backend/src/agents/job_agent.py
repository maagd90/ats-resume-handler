from src.agents.match_agent import rank_jobs_with_criteria, score_job_with_criteria
from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile, JobListing, JobMatchResult, JobScoreResult
from src.scoring.job_discovery import discover_jobs
from src.scoring.job_matcher import extract_jd_requirements, rank_jobs, score_job_fit
from src.services.jsearch_client import jsearch_client


class JobAgent:
    async def search(
        self,
        profile: CandidateProfile,
        query: str | None = None,
        location: str | None = None,
        criteria: JobCriteria | None = None,
    ) -> JobMatchResult:
        if query or location:
            role = query or "software engineer"
            loc = location or "remote"
            jobs = await jsearch_client.search(f"{role} jobs in {loc}")
            search_query = f"{role} jobs in {loc}"
        else:
            jobs, queries = await discover_jobs(profile, criteria, jsearch_client.search)
            search_query = "; ".join(queries[:3])

        if criteria:
            ranked = rank_jobs_with_criteria(profile, jobs, criteria)
        else:
            ranked = rank_jobs(profile, jobs)
        return JobMatchResult(jobs=ranked[:20], query=search_query)

    async def score_description(self, profile: CandidateProfile, description: str) -> JobScoreResult:
        llm_req = await extract_jd_requirements(description)
        return score_job_fit(profile, description, llm_requirements=llm_req)


job_agent = JobAgent()
