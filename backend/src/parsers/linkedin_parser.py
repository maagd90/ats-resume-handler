import re

from src.models.profile import CandidateProfile, ExperienceEntry


def normalize_linkedin_export_text(text: str) -> str:
    """Clean text extracted from LinkedIn PDF exports (Save to PDF)."""
    lines: list[str] = []
    skip_patterns = (
        r"^page \d+",
        r"^linkedin\.com",
        r"^www\.linkedin\.com",
        r"^contact info$",
        r"^messages$",
    )
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        lower = line.lower()
        if any(re.match(pat, lower) for pat in skip_patterns):
            continue
        if len(line) == 1 and not line.isalnum():
            continue
        lines.append(line)
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def parse_linkedin_text(text: str) -> dict:
    text = normalize_linkedin_export_text(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    headline = _find_headline(lines, text)
    about = _extract_section(text, "about") or _extract_section(text, "summary")
    experience_text = _extract_section(text, "experience") or _extract_section(text, "work experience")
    experience = _parse_experience_blocks(experience_text)
    skills = _extract_list_section(text, "skills") or _extract_list_section(text, "top skills")

    return {
        "headline": headline,
        "about": about,
        "experience": experience,
        "skills": skills,
        "raw_text": text,
    }


def _find_headline(lines: list[str], text: str) -> str | None:
    for marker in ("about", "experience", "education", "skills"):
        section = _extract_section(text, marker)
        if section:
            idx = text.lower().find(marker)
            if idx > 0:
                prefix = text[:idx].strip().splitlines()
                prefix = [p.strip() for p in prefix if p.strip()]
                if len(prefix) >= 2:
                    return prefix[1] if len(prefix[1]) < 220 else prefix[0]
    return lines[0] if lines else None


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
    pattern = rf"(?im)^{re.escape(section_name)}\s*\n(.+?)(?:\n(?:experience|education|skills|about|summary|certifications|projects)\s*\n|$)"
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""


def _extract_list_section(text: str, section_name: str) -> list[str]:
    section = _extract_section(text, section_name)
    if not section:
        return []
    return [item.strip() for item in re.split(r"[,|\n•·]", section) if item.strip()]


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
