import json
from pathlib import Path

from src.models.profile import CandidateProfile
from src.services.llm_client import llm_client


class CoverLetterAgent:
    async def generate(
        self,
        profile: CandidateProfile,
        job_title: str,
        company: str,
        job_description: str,
        resume_highlights: str = "",
    ) -> dict:
        tone = profile.cover_letter_template or "professional and concise"
        system_prompt = (Path(__file__).resolve().parents[1] / "prompts" / "cover_letter.txt").read_text(encoding="utf-8")
        user_prompt = (
            f"Tone: {tone}\n"
            f"Candidate: {profile.contact.name or 'Candidate'}\n"
            f"Job: {job_title} at {company}\n\n"
            f"Resume highlights:\n{resume_highlights}\n\n"
            f"Job description:\n{job_description}\n\n"
            "Return valid JSON with keys: subject, body (plain text cover letter)."
        )
        raw = await llm_client.complete(system_prompt, user_prompt, json_mode=True)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            body = (
                f"Dear Hiring Manager,\n\n"
                f"I am writing to express my interest in the {job_title} role at {company}. "
                f"My background aligns well with your requirements.\n\n"
                f"Sincerely,\n{profile.contact.name or 'Candidate'}"
            )
            return {"subject": f"Application for {job_title} — {profile.contact.name or 'Candidate'}", "body": body}


cover_letter_agent = CoverLetterAgent()
