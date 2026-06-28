"""Read-only transparency endpoints for how AI optimization works."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends

from src.api.deps import get_current_user
from src.config import settings
from src.models.membership import UserAccount

router = APIRouter(prefix="/ai", tags=["ai"])

PROMPTS_DIR = Path(__file__).resolve().parents[2] / "prompts"


@router.get("/pipeline")
async def get_ai_pipeline_info(_user: UserAccount = Depends(get_current_user)):
    """Explain optimization steps, model settings, and prompt templates (authenticated)."""
    prompt_files = sorted(PROMPTS_DIR.glob("*.txt"))
    prompts = {}
    for path in prompt_files:
        text = path.read_text(encoding="utf-8")
        prompts[path.name] = {
            "purpose": _prompt_purpose(path.name),
            "preview": text[:1200] + ("…" if len(text) > 1200 else ""),
            "char_count": len(text),
        }

    return {
        "llm_configured": settings.llm_configured,
        "provider": settings.llm_provider,
        "model": "gpt-4o-mini" if settings.llm_provider == "openai" else "claude-3-5-haiku-20241022",
        "temperature": 0.3,
        "response_format": "json_object (when supported)",
        "pipeline_steps": [
            {
                "step": 1,
                "name": "Parse & normalize",
                "ai": False,
                "detail": "Resume/LinkedIn PDF or DOCX → structured CandidateProfile JSON",
            },
            {
                "step": 2,
                "name": "ATS rule scoring",
                "ai": False,
                "detail": "Deterministic checks: sections, bullets, dates, keywords (ats_checker.py)",
            },
            {
                "step": 3,
                "name": "Build verified facts",
                "ai": False,
                "detail": "fact_validator extracts employers, titles, skills from source — injected into prompts",
            },
            {
                "step": 4,
                "name": "LLM resume review",
                "ai": True,
                "prompt": "resume_review.txt",
                "detail": "Rewrites summary/bullets; returns JSON with optimized_profile and suggestions",
            },
            {
                "step": 5,
                "name": "LLM LinkedIn optimize (optional)",
                "ai": True,
                "prompt": "linkedin_optimize.txt",
                "detail": "Headline, about, experience bullets aligned to resume facts",
            },
            {
                "step": 6,
                "name": "Validate output",
                "ai": False,
                "detail": "Reject invented employers/titles/skills not in verified facts",
            },
            {
                "step": 7,
                "name": "Render documents",
                "ai": False,
                "detail": "DOCX resume + LinkedIn text pack from validated profile",
            },
        ],
        "prompts": prompts,
        "fallback_behavior": (
            "If OPENAI_API_KEY is not set, llm_configured is false and optimize endpoints return 503. "
            "Internal dev fallback returns mock JSON without calling OpenAI."
            if not settings.llm_configured
            else "Platform API key is configured; real OpenAI/Anthropic calls are used."
        ),
    }


def _prompt_purpose(filename: str) -> str:
    return {
        "resume_review.txt": "Main resume optimization — ATS-aware rewrite with verified-facts guardrails",
        "linkedin_optimize.txt": "LinkedIn headline, about, and experience suggestions from resume + profile text",
        "resume_tailor.txt": "Prime: tailor resume bullets to a specific job description",
        "cover_letter.txt": "Prime: generate cover letter from profile + job description",
    }.get(filename, "LLM prompt template")
