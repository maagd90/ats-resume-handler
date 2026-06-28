from pathlib import Path

from docx import Document
from jinja2 import Template

from src.config import settings
from src.models.profile import CandidateProfile


RESUME_TEMPLATE = """{{ contact.name or 'Candidate' }}
{{ contact.email or '' }} | {{ contact.phone or '' }} | {{ contact.location or '' }}

SUMMARY
{{ summary or '' }}

EXPERIENCE
{% for exp in experience %}
{{ exp.title }} | {{ exp.company }}
{% for bullet in exp.bullets %}- {{ bullet }}
{% endfor %}
{% endfor %}

EDUCATION
{% for edu in education %}{{ edu.degree }} | {{ edu.institution }}
{% endfor %}

SKILLS
{{ skills | join(', ') }}
"""


class ResumeRenderer:
    def render_text(self, profile: CandidateProfile, tailored: dict | None = None) -> str:
        data = {
            "contact": profile.contact.model_dump(),
            "summary": (tailored or {}).get("summary") or profile.summary or "",
            "experience": (tailored or {}).get("experience") or [e.model_dump() for e in profile.experience],
            "education": [e.model_dump() for e in profile.education],
            "skills": (tailored or {}).get("skills") or profile.skills or [],
        }
        return Template(RESUME_TEMPLATE).render(**data)

    def render_docx(self, profile: CandidateProfile, tailored: dict | None, output_path: Path) -> Path:
        text = self.render_text(profile, tailored)
        doc = Document()
        for line in text.splitlines():
            doc.add_paragraph(line)
        doc.save(output_path)
        return output_path

    def render_cover_letter_txt(self, body: str, output_path: Path) -> Path:
        output_path.write_text(body, encoding="utf-8")
        return output_path

    def application_dir(self, application_id: str) -> Path:
        path = settings.applications_path / application_id
        path.mkdir(parents=True, exist_ok=True)
        return path


resume_renderer = ResumeRenderer()
