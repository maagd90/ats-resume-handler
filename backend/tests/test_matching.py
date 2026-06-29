from pathlib import Path

from src.agents.match_agent import score_job_with_criteria
from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile, JobListing
from src.parsers.resume_parser import parse_profile_from_text
from src.scoring.job_matcher import extract_skills_from_text, get_profile_skills, score_job_fit

FIXTURES = Path(__file__).parent / "fixtures"


def test_semantic_stub_when_embeddings_disabled():
    """With EMBEDDINGS_ENABLED=false, fit score still varies via keyword overlap."""
    text = (FIXTURES / "strong_sdet.txt").read_text(encoding="utf-8")
    profile = parse_profile_from_text(text, "test")
    jd_a = "Senior SDET Selenium Python pytest CI/CD test automation Jenkins"
    jd_b = "Marketing manager social media SEO content strategy brand campaigns"
    fit_a = score_job_fit(profile, jd_a).fit_score
    fit_b = score_job_fit(profile, jd_b).fit_score
    assert fit_a > fit_b


def test_gazetteer_multiword_skills():
    text = "Experience with test automation and ci/cd pipelines"
    skills = extract_skills_from_text(text)
    assert "test automation" in skills or "ci/cd" in skills


def test_get_profile_skills_from_noisy_entries():
    text = (FIXTURES / "strong_sdet.txt").read_text(encoding="utf-8")
    profile = parse_profile_from_text(text, "test")
    profile.skills = [
        "Java C# Axapta Selenium Rest Assured",
        "Led regression testing for enterprise ERP modules",
    ]
    profile.resume_raw_text = text

    skills = get_profile_skills(profile)
    assert "selenium" in skills
    assert "pytest" in skills
    assert "test automation" in skills or "ci/cd" in skills


def test_noisy_skills_score_qa_roles_above_threshold():
    text = (FIXTURES / "strong_sdet.txt").read_text(encoding="utf-8")
    profile = parse_profile_from_text(text, "test")
    profile.skills = [
        "Java C# Axapta Selenium Rest Assured",
        "Led regression testing for enterprise ERP modules",
    ]
    profile.resume_raw_text = text

    jd = """
    Senior QA Automation Engineer — Dubai
    Required: Selenium WebDriver, Playwright, pytest, CI/CD, test automation,
    API testing, Jenkins, Cucumber, BDD, Java, Jira, Agile.
    """
    criteria = JobCriteria(
        user_id="u",
        job_titles=["QA Engineer", "SDET", "QA Automation"],
        locations=["Dubai", "Remote"],
    )
    job = JobListing(
        id="1",
        title="Senior QA Automation Engineer",
        company="Finacle",
        description=jd,
        location="Dubai, UAE",
    )
    result = score_job_with_criteria(profile, job, criteria)
    assert result.fit_score >= 70
    assert len(result.matched_skills) >= 5
