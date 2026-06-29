from pathlib import Path

from src.models.profile import CandidateProfile
from src.parsers.resume_parser import parse_profile_from_text
from src.scoring.job_matcher import extract_skills_from_text, score_job_fit

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
