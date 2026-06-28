import json
from pathlib import Path

from src.models.profile import CandidateProfile, LinkedInOptimizationResult
from src.parsers.linkedin_parser import merge_linkedin_into_profile, parse_linkedin_text
from src.services.llm_client import llm_client


class LinkedInAgent:
    async def analyze(self, profile: CandidateProfile, linkedin_text: str) -> LinkedInOptimizationResult:
        linkedin_data = parse_linkedin_text(linkedin_text)
        profile = merge_linkedin_into_profile(profile, linkedin_data)
        llm_result = await self._llm_optimize(profile, linkedin_text)
        return LinkedInOptimizationResult(
            profile=profile,
            headline_variants=llm_result.get("headline_variants", []),
            optimized_about=llm_result.get("optimized_about", linkedin_data.get("about", "")),
            experience_upgrades=llm_result.get("experience_upgrades", []),
            skills_to_add=llm_result.get("skills_to_add", []),
            analysis=llm_result.get("analysis", {}),
        )

    async def _llm_optimize(self, profile: CandidateProfile, linkedin_text: str) -> dict:
        prompt_path = Path(__file__).resolve().parents[1] / "prompts" / "linkedin_optimize.txt"
        system_prompt = prompt_path.read_text(encoding="utf-8")
        resume_context = profile.resume_raw_text or ""
        user_prompt = (
            f"Target roles: {', '.join(profile.target_roles)}\n"
            f"Resume context:\n{resume_context}\n\n"
            f"LinkedIn profile:\n{linkedin_text}\n\nReturn valid JSON only."
        )
        raw = await llm_client.complete(system_prompt, user_prompt, json_mode=True)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "headline_variants": [profile.linkedin_headline or "Professional open to opportunities"],
                "optimized_about": linkedin_text[:800],
                "experience_upgrades": [],
                "skills_to_add": [],
                "analysis": {"general": raw[:500]},
            }


linkedin_agent = LinkedInAgent()
