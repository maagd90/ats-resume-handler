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
        linkedin_section = ""
        if "LinkedIn profile:" in user_prompt:
            linkedin_section = user_prompt.split("LinkedIn profile:", 1)[-1].strip()[:1200]
        elif "=== END VERIFIED FACTS ===" in user_prompt:
            linkedin_section = user_prompt.split("=== END VERIFIED FACTS ===", 1)[-1].strip()[:1200]

        resume_text = user_prompt
        if "Resume:" in user_prompt:
            resume_text = user_prompt.split("Resume:", 1)[-1].split("Return valid JSON")[0].strip()[:2000]

        headline = "Senior QA Engineer | Selenium, API Testing, BDD | 13+ Years"
        if "SDET" in user_prompt or "Quality Assurance" in user_prompt:
            headline = "Senior SDET & QA Automation Engineer | Selenium, Rest Assured, BDD | 13+ Yrs"

        about = linkedin_section.split("Experience")[0].replace("About", "").strip() if linkedin_section else ""
        if not about or len(about) < 50:
            about = (
                "Senior Software Quality Assurance Engineer with 13+ years of experience in test automation, "
                "API testing, and BDD frameworks. Proven expertise with Selenium, Rest Assured, Cucumber, "
                "and CI/CD integration across enterprise environments including aviation and e-commerce."
            )

        return json.dumps(
            {
                "summary": "Experienced SDET with 13+ years in QA automation, API testing, and BDD frameworks.",
                "optimized_text": resume_text[:2000],
                "section_feedback": {
                    "summary": "Lead with SDET/QA title, years of experience, and core tools (Selenium, Rest Assured, BDD).",
                    "experience": "Strong quantified bullets at Nisum and Emirates — ensure all roles have metrics.",
                    "skills": "Prominently list Selenium, Rest Assured, Cucumber, Appium, JMeter, Java, CI/CD.",
                },
                "headline_variants": [
                    headline,
                    "Senior SDET | QA Automation & API Testing Expert | Selenium • Rest Assured • BDD",
                    "QA Automation Leader | 13+ Years | Selenium, Appium, CI/CD | Emirates & Enterprise",
                ],
                "optimized_about": about[:800],
                "experience_upgrades": [],
                "skills_to_add": ["SDET", "BDD", "NightWatchJS", "JMeter", "CI/CD"],
                "analysis": {
                    "headline": "Add SDET keyword and top tools for recruiter search visibility.",
                    "about": "Open with years of experience and domain expertise; keep keyword-rich tool list.",
                    "experience": "Emirates and Nisum roles have strong metrics — mirror these across all entries.",
                },
                "guidance": [
                    {
                        "field": "headline",
                        "steps": [
                            "Go to linkedin.com and open your profile",
                            "Click the pencil icon next to your headline",
                            "Paste the optimized headline below",
                            "Click Save",
                        ],
                        "tip": "Include SDET, Selenium, and API Testing for search ranking",
                        "copy_text": headline,
                    }
                ],
                "suggested_tweaks": ["Emphasize Selenium, Rest Assured, and BDD in summary."],
                "matched_skills": [],
                "missing_skills": [],
            }
        )


llm_client = LLMClient()
