from pathlib import Path
import re
from typing import Optional

import pdfplumber
from docx import Document

from src.models.profile import CandidateProfile, ContactInfo, EducationEntry, ExperienceEntry


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\s().-]{7,}\d)")
LINKEDIN_RE = re.compile(r"(https?://(?:www\.)?linkedin\.com/\S+)", re.I)
GITHUB_RE = re.compile(r"(https?://(?:www\.)?github\.com/\S+)", re.I)


def extract_text_from_file(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf(file_path)
    if suffix == ".docx":
        return _extract_docx(file_path)
    if suffix == ".txt":
        return file_path.read_text(encoding="utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(file_path: Path) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _extract_docx(file_path: Path) -> str:
    doc = Document(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def parse_profile_from_text(text: str, profile_id: str) -> CandidateProfile:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    contact = _extract_contact(text, lines)
    sections = _split_sections(text)
    skills = _extract_skills(sections.get("skills", ""))
    experience = _extract_experience(sections.get("experience", ""))
    education = _extract_education(sections.get("education", ""))
    summary = sections.get("summary") or sections.get("profile") or _first_paragraph(lines)

    return CandidateProfile(
        id=profile_id,
        contact=contact,
        summary=summary,
        skills=skills,
        experience=experience,
        education=education,
        resume_raw_text=text,
    )


def _extract_contact(text: str, lines: list[str]) -> ContactInfo:
    email_match = EMAIL_RE.search(text)
    phone_match = PHONE_RE.search(text)
    linkedin_match = LINKEDIN_RE.search(text)
    github_match = GITHUB_RE.search(text)
    name = lines[0] if lines else None
    return ContactInfo(
        name=name,
        email=email_match.group(0) if email_match else None,
        phone=phone_match.group(0).strip() if phone_match else None,
        linkedin_url=linkedin_match.group(1) if linkedin_match else None,
        github_url=github_match.group(1) if github_match else None,
    )


def _split_sections(text: str) -> dict[str, str]:
    section_headers = {
        "summary": r"^(summary|professional summary|profile)$",
        "experience": r"^(experience|work experience|employment)$",
        "education": r"^(education|academic background)$",
        "skills": r"^(skills|technical skills|core competencies)$",
        "certifications": r"^(certifications|licenses)$",
    }
    lines = text.splitlines()
    sections: dict[str, list[str]] = {}
    current: Optional[str] = None

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        matched = False
        for key, pattern in section_headers.items():
            if re.match(pattern, line, re.I):
                current = key
                sections.setdefault(current, [])
                matched = True
                break
        if not matched and current:
            sections[current].append(line)

    return {key: "\n".join(value).strip() for key, value in sections.items()}


def _extract_skills(section: str) -> list[str]:
    if not section:
        return []
    parts = re.split(r"[,|•\n;]", section)
    return [part.strip() for part in parts if part.strip()][:40]


def _extract_experience(section: str) -> list[ExperienceEntry]:
    if not section:
        return []
    blocks = re.split(r"\n(?=[A-Z][^\n]{0,80}(?:\|| at | - ))", section)
    entries: list[ExperienceEntry] = []
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        title_line = lines[0]
        company = "Unknown"
        title = title_line
        if "|" in title_line:
            title, company = [part.strip() for part in title_line.split("|", 1)]
        elif " at " in title_line.lower():
            parts = re.split(r"\s+at\s+", title_line, maxsplit=1, flags=re.I)
            title, company = parts[0].strip(), parts[1].strip()
        bullets = [line.lstrip("-•* ").strip() for line in lines[1:] if line.startswith(("-", "•", "*"))]
        entries.append(ExperienceEntry(title=title, company=company, bullets=bullets))
    return entries[:10]


def _extract_education(section: str) -> list[EducationEntry]:
    if not section:
        return []
    entries: list[EducationEntry] = []
    for line in section.splitlines():
        line = line.strip()
        if not line:
            continue
        if "|" in line:
            degree, institution = [part.strip() for part in line.split("|", 1)]
        else:
            degree, institution = line, "Institution"
        entries.append(EducationEntry(degree=degree, institution=institution))
    return entries[:5]


def _first_paragraph(lines: list[str]) -> Optional[str]:
    if len(lines) > 1:
        return lines[1]
    return None
