import json
from pathlib import Path

from src.models.profile import CandidateProfile
from src.services.fact_validator import build_source_facts_block, validate_tailored_resume
from src.services.llm_client import llm_client


class TailorAgent:
    async def tailor(self, profile: CandidateProfile, job_title: str, job_description: str) -> dict:
        base = profile.base_resume_template or profile.resume_raw_text or ""
        facts = build_source_facts_block(profile)
        system_prompt = (Path(__file__).resolve().parents[1] / "prompts" / "resume_tailor.txt").read_text(encoding="utf-8")
        user_prompt = (
            f"{facts}\n\n"
            f"Job title: {job_title}\n\n"
            f"Job description:\n{job_description}\n\n"
            f"Base resume:\n{base}\n\n"
            "Tailor for this JD. Return valid JSON only."
        )
        raw = await llm_client.complete(system_prompt, user_prompt, json_mode=True)
        try:
            tailored = json.loads(raw)
        except json.JSONDecodeError:
            tailored = {
                "summary": profile.summary,
                "skills": profile.skills,
                "experience": [e.model_dump() for e in profile.experience],
                "tailored_text": base,
            }
        return validate_tailored_resume(profile, tailored)


tailor_agent = TailorAgent()
