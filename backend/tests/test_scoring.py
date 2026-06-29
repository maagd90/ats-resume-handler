from pathlib import Path

import pytest

from src.models.job_criteria import JobCriteria
from src.models.profile import CandidateProfile, ContactInfo, JobListing
from src.parsers.resume_parser import parse_profile_from_text
from src.scoring.ats_checker import audit_resume
from src.scoring.job_matcher import extract_skills_from_text, score_job_fit
from src.scoring.red_flags import detect_red_flags
from src.scoring.recruiter_appeal import score_recruiter_appeal

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str) -> tuple[str, CandidateProfile]:
    text = (FIXTURES / name).read_text(encoding="utf-8")
    profile = parse_profile_from_text(text, "test-user")
    return text, profile


def test_gazetteer_finds_qa_skills():
    jd = "Required: Selenium, Cucumber, BDD, CI/CD, Test Automation, Python"
    skills = extract_skills_from_text(jd)
    assert "selenium" in skills
    assert "cucumber" in skills
    assert "bdd" in skills
    assert "ci/cd" in skills


def test_tables_in_bullet_text_no_parseability_penalty():
    text = "EXPERIENCE\n- Designed star-schema tables for analytics warehouse\nSKILLS\npython\nEDUCATION\ndegree"
    profile = CandidateProfile(id="t", skills=["python"], contact=ContactInfo(email="a@b.com"))
    score, issues = audit_resume(text, profile, layout_features={"has_tables": False})
    assert score.parseability == 100.0
    assert not any("layout" in i.message.lower() for i in issues)


def test_layout_features_penalize_real_tables():
    text = "EXPERIENCE\nEngineer\nSKILLS\npython\nEDUCATION\ndegree"
    profile = CandidateProfile(id="t", skills=["python"], contact=ContactInfo(email="a@b.com"))
    score, issues = audit_resume(text, profile, layout_features={"has_tables": True})
    assert score.parseability < 100.0


def test_red_flags_gap_hopper():
    text, profile = _load("gap_hopper.txt")
    flags = detect_red_flags(profile, text)
    categories = {f.category for f in flags}
    assert "pronouns" in categories or "passive_phrasing" in categories
    assert len(flags) >= 2


def test_red_flags_clean_resume():
    text, profile = _load("strong_sdet.txt")
    flags = detect_red_flags(profile, text)
    pronoun_flags = [f for f in flags if f.category == "pronouns"]
    assert len(pronoun_flags) == 0


def test_recruiter_appeal_strong_vs_weak():
    _, strong = _load("strong_sdet.txt")
    _, weak = _load("weak_vague.txt")
    strong_score, _ = score_recruiter_appeal(strong)
    weak_score, _ = score_recruiter_appeal(weak)
    assert strong_score > weak_score


def test_ats_scores_strong_resume():
    text, profile = _load("strong_sdet.txt")
    score, _ = audit_resume(text, profile)
    assert score.overall >= 60
    assert score.impact >= 50


def test_fit_ranking_on_target_above_off_target():
    sdet_jd = """
    Senior SDET — required Selenium, Python, pytest, CI/CD, test automation, Jenkins, API testing.
    """
    _, sdet_profile = _load("strong_sdet.txt")
    _, marketing_profile = _load("wrong_domain.txt")
    sdet_fit = score_job_fit(sdet_profile, sdet_jd).fit_score
    marketing_fit = score_job_fit(marketing_profile, sdet_jd).fit_score
    assert sdet_fit > marketing_fit


def test_required_skills_filter():
    from src.agents.match_agent import passes_criteria_filters

    criteria = JobCriteria(
        user_id="u",
        job_titles=["sdet"],
        locations=["remote"],
        required_skills=["selenium"],
    )
    matching = JobListing(
        id="1", title="SDET", company="Co", description="We need Selenium and Python experience."
    )
    missing = JobListing(
        id="2", title="SDET", company="Co", description="We need Java and Spring experience only."
    )
    assert passes_criteria_filters(matching, criteria) is True
    assert passes_criteria_filters(missing, criteria) is False
