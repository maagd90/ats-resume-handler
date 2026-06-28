import json
from typing import Any

from src.config import settings


class LLMClient:
    async def complete(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        provider = settings.llm_provider.lower()

        if provider == "anthropic" and settings.anthropic_api_key:
            return await self._anthropic_complete(system_prompt, user_prompt)
        if settings.openai_api_key:
            return await self._openai_complete(system_prompt, user_prompt, json_mode=json_mode)
        return self._fallback_complete(system_prompt, user_prompt)

    async def _openai_complete(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        kwargs: dict[str, Any] = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.3,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    async def _anthropic_complete(self, system_prompt: str, user_prompt: str) -> str:
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            temperature=0.3,
        )
        parts = [block.text for block in response.content if block.type == "text"]
        return "\n".join(parts)

    def _fallback_complete(self, system_prompt: str, user_prompt: str) -> str:
        return json.dumps(
            {
                "summary": "Configure OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-powered analysis.",
                "optimized_text": user_prompt[:2000],
                "section_feedback": {
                    "summary": "Add quantified achievements and role-specific keywords.",
                    "experience": "Use action verbs and measurable outcomes.",
                    "skills": "Align skills with target job descriptions.",
                },
                "headline_variants": ["Results-driven professional seeking new opportunities"],
                "optimized_about": user_prompt[:500],
                "experience_upgrades": [],
                "skills_to_add": [],
                "analysis": {"headline": "Configure an LLM API key for detailed LinkedIn analysis."},
                "suggested_tweaks": ["Highlight matching skills from the job description."],
                "matched_skills": [],
                "missing_skills": [],
            }
        )


llm_client = LLMClient()
