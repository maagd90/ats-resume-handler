from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile, ContactInfo, ExperienceEntry
from src.scoring.criteria_sync import effective_job_titles, sync_criteria_from_resume


def test_sync_replaces_generic_software_engineer():
    profile = CandidateProfile(
        id="u1",
        target_roles=["Senior SDET", "QA Consultant"],
        experience=[ExperienceEntry(title="Senior SDET", company="Co", location="Dubai", bullets=[])],
        contact=ContactInfo(location="Dubai"),
    )
    criteria = JobCriteria(user_id="u1", job_titles=["Software Engineer"], locations=["Remote"])
    synced = sync_criteria_from_resume(profile, criteria)
    assert synced.job_titles == ["Senior SDET", "QA Consultant"]
    assert "Dubai" in synced.locations


def test_effective_titles_prefers_resume():
    profile = CandidateProfile(
        id="u1",
        target_roles=["QA Automation Engineer"],
    )
    criteria = JobCriteria(user_id="u1", job_titles=["Software Engineer"])
    assert effective_job_titles(profile, criteria) == ["QA Automation Engineer"]
