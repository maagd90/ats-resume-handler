import re
from typing import Optional

import numpy as np

from src.models.profile import CandidateProfile, JobListing, JobScoreResult

_embedding_model = None


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _embedding_model = False
    return _embedding_model if _embedding_model is not False else None


def build_profile_document(profile: CandidateProfile) -> str:
    parts = [
        profile.summary or "",
        "Skills: " + ", ".join(profile.skills),
    ]
    for entry in profile.experience:
        parts.append(f"{entry.title} at {entry.company}")
        parts.extend(entry.bullets)
    return "\n".join(part for part in parts if part)


def compute_embedding(text: str) -> Optional[list[float]]:
    model = _get_embedding_model()
    if not model:
        return None
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a)
    vb = np.array(b)
    return float(np.dot(va, vb))


def extract_skills_from_text(text: str) -> set[str]:
    tokens = re.findall(r"[A-Za-z+#.]{2,}", text.lower())
    common = {
        "python",
        "javascript",
        "typescript",
        "react",
        "node",
        "aws",
        "docker",
        "kubernetes",
        "sql",
        "java",
        "go",
        "rust",
        "fastapi",
        "django",
        "flask",
        "postgres",
        "mongodb",
        "redis",
        "git",
        "ci/cd",
        "agile",
        "scrum",
        "leadership",
        "communication",
        "machine",
        "learning",
        "data",
        "analysis",
    }
    return {token for token in tokens if token in common}


def score_job_fit(profile: CandidateProfile, description: str) -> JobScoreResult:
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
    experience_level = 0.7 if profile.experience else 0.3
    fit_score = round(100 * (0.5 * semantic + 0.3 * keyword_overlap + 0.2 * experience_level), 1)

    suggested_tweaks = []
    if missing:
        suggested_tweaks.append(f"Add or emphasize these JD skills: {', '.join(missing[:8])}")
    if fit_score < 70:
        suggested_tweaks.append("Rewrite your summary to mirror the job title and top requirements.")
    if not any(re.search(r"\d", bullet) for entry in profile.experience for bullet in entry.bullets):
        suggested_tweaks.append("Add quantified outcomes to your most recent role.")

    return JobScoreResult(
        fit_score=fit_score,
        gap_analysis={"matched_skills": matched, "missing_skills": missing},
        suggested_tweaks=suggested_tweaks,
        matched_skills=matched,
        missing_skills=missing,
    )


def rank_jobs(profile: CandidateProfile, jobs: list[JobListing]) -> list[JobListing]:
    ranked: list[JobListing] = []
    for job in jobs:
        result = score_job_fit(profile, job.description)
        job.fit_score = result.fit_score
        job.gap_analysis = result.gap_analysis
        ranked.append(job)
    ranked.sort(key=lambda item: item.fit_score or 0, reverse=True)
    return ranked
