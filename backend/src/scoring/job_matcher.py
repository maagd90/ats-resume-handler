import hashlib
import logging
import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np

from src.config import settings
from src.models.profile import CandidateProfile, JobListing, JobScoreResult

logger = logging.getLogger(__name__)

_embedding_model = None
_jd_requirements_cache: dict[str, dict] = {}


def _get_embedding_model():
    global _embedding_model
    if not settings.embeddings_enabled:
        return None
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            _embedding_model = SentenceTransformer(settings.embedding_model_name)
        except Exception as exc:
            logger.warning("Failed to load embedding model: %s", exc)
            _embedding_model = False
    return _embedding_model if _embedding_model is not False else None


@lru_cache
def _gazetteer() -> frozenset[str]:
    path = Path(__file__).parent / "skills_gazetteer.txt"
    if not path.exists():
        return frozenset()
    skills = {ln.strip().lower() for ln in path.read_text(encoding="utf-8").splitlines() if ln.strip() and not ln.startswith("#")}
    return frozenset(skills)


def extract_skills_from_text(text: str) -> set[str]:
    t = text.lower()
    found: set[str] = set()
    for skill in _gazetteer():
        if re.search(rf"(?<!\w){re.escape(skill)}(?!\w)", t):
            found.add(skill)
    return found


async def extract_jd_requirements(description: str) -> dict[str, list[str]]:
    """LLM-based JD skill extraction for single-JD scoring (precise path)."""
    jd_hash = hashlib.sha256(description.encode()).hexdigest()
    if jd_hash in _jd_requirements_cache:
        return _jd_requirements_cache[jd_hash]

    from src.services.llm_client import llm_client

    prompt_path = Path(__file__).resolve().parents[1] / "prompts" / "jd_requirements.txt"
    system_prompt = prompt_path.read_text(encoding="utf-8") if prompt_path.exists() else (
        "Extract required, preferred, and soft skills from the job description. Return JSON with keys: required, preferred, soft."
    )
    user_prompt = f"<job_description>\n{description[:8000]}\n</job_description>\nReturn valid JSON only."
    try:
        import json

        raw = await llm_client.complete(system_prompt, user_prompt, json_mode=True)
        result = json.loads(raw)
        parsed = {
            "required": [s.lower() for s in result.get("required", [])],
            "preferred": [s.lower() for s in result.get("preferred", [])],
            "soft": [s.lower() for s in result.get("soft", [])],
        }
    except Exception as exc:
        logger.warning("JD requirements LLM extraction failed: %s — falling back to gazetteer", exc)
        gaz = extract_skills_from_text(description)
        parsed = {"required": sorted(gaz), "preferred": [], "soft": []}

    _jd_requirements_cache[jd_hash] = parsed
    return parsed


def _jd_skill_set(description: str, llm_requirements: dict[str, list[str]] | None = None) -> set[str]:
    if llm_requirements:
        return set(llm_requirements.get("required", []) + llm_requirements.get("preferred", []))
    return extract_skills_from_text(description)


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


def score_job_fit(
    profile: CandidateProfile,
    description: str,
    *,
    llm_requirements: dict[str, list[str]] | None = None,
) -> JobScoreResult:
    profile_doc = build_profile_document(profile)
    profile_skills = {skill.lower() for skill in profile.skills}
    jd_skills = _jd_skill_set(description, llm_requirements)
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
