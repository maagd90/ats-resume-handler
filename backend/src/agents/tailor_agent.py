import json
from pathlib import Path

from src.models.profile import CandidateProfile
from src.services.llm_client import llm_client


class TailorAgent:
    async def tailor(self, profile: CandidateProfile, job_title: str, job_description: str) -> dict:
        base = profile.base_resume_template or profile.resume_raw_text or ""
        system_prompt = (Path(__file__).resolve().parents[1] / "prompts" / "resume_tailor.txt").read_text(encoding="utf-8")
        user_prompt = (
            f"Job title: {job_title}\n\n"
            f"Job description:\n{job_description}\n\n"
            f"Base resume:\n{base}\n\n"
            "Return valid JSON with keys: summary, skills (array), experience (array of "
            "{title, company, bullets}), tailored_text (full resume text). "
            "Only use facts from the base resume. Do not invent employers or dates."
        )
        raw = await llm_client.complete(system_prompt, user_prompt, json_mode=True)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "summary": profile.summary,
                "skills": profile.skills,
                "experience": [e.model_dump() for e in profile.experience],
                "tailored_text": base,
            }


tailor_agent = TailorAgent()
