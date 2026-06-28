import re

from src.models.profile import CandidateProfile, ContactInfo, ExperienceEntry


def parse_linkedin_text(text: str) -> dict:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    headline = lines[0] if lines else None
    about = _extract_section(text, "about")
    experience_text = _extract_section(text, "experience")
    experience = _parse_experience_blocks(experience_text)
    skills = _extract_list_section(text, "skills")

    return {
        "headline": headline,
        "about": about,
        "experience": experience,
        "skills": skills,
    }


def merge_linkedin_into_profile(profile: CandidateProfile, linkedin_data: dict) -> CandidateProfile:
    profile.linkedin_headline = linkedin_data.get("headline") or profile.linkedin_headline
    if linkedin_data.get("about"):
        profile.linkedin_about = linkedin_data["about"]
    if linkedin_data.get("skills"):
        merged = list(dict.fromkeys(profile.skills + linkedin_data["skills"]))
        profile.skills = merged
    if linkedin_data.get("experience") and not profile.experience:
        profile.experience = linkedin_data["experience"]
    return profile


def _extract_section(text: str, section_name: str) -> str:
    pattern = rf"(?im)^{section_name}\s*\n(.+?)(?:\n(?:experience|education|skills|about)\s*\n|$)"
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""


def _extract_list_section(text: str, section_name: str) -> list[str]:
    section = _extract_section(text, section_name)
    if not section:
        return []
    return [item.strip() for item in re.split(r"[,|\n]", section) if item.strip()]


def _parse_experience_blocks(section: str) -> list[ExperienceEntry]:
    if not section:
        return []
    blocks = re.split(r"\n(?=[^\n]+\n[^\n]+)", section)
    entries: list[ExperienceEntry] = []
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if len(lines) < 2:
            continue
        title, company = lines[0], lines[1]
        bullets = [line.lstrip("-•* ") for line in lines[2:] if line.startswith(("-", "•", "*"))]
        entries.append(ExperienceEntry(title=title, company=company, bullets=bullets))
    return entries
