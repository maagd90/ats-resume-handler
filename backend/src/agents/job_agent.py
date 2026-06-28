from src.models.profile import CandidateProfile, JobListing, JobMatchResult, JobScoreResult
from src.scoring.job_matcher import rank_jobs, score_job_fit
from src.services.jsearch_client import jsearch_client


class JobAgent:
    async def search(self, profile: CandidateProfile, query: str | None = None, location: str | None = None) -> JobMatchResult:
        role = query or (profile.target_roles[0] if profile.target_roles else "software engineer")
        loc = location or (profile.target_locations[0] if profile.target_locations else "remote")
        search_query = f"{role} jobs in {loc}"
        jobs = await jsearch_client.search(search_query)
        ranked = rank_jobs(profile, jobs)
        return JobMatchResult(jobs=ranked[:20], query=search_query)

    async def score_description(self, profile: CandidateProfile, description: str) -> JobScoreResult:
        return score_job_fit(profile, description)


job_agent = JobAgent()
