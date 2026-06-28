from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FontFamily(str, Enum):
    CALIBRI = "Calibri"
    ARIAL = "Arial"
    TIMES = "Times New Roman"
    HELVETICA = "Helvetica"


class DateFormat(str, Enum):
    MM_YYYY = "MM/YYYY"
    MON_YYYY = "Mon YYYY"
    YEAR_ONLY = "YYYY"


class BulletStyle(str, Enum):
    DASH = "-"
    BULLET = "•"
    DISC = "●"


class ResumeTemplateSettings(BaseModel):
    """ATS-safe resume template configuration — preserved across all generated resumes."""

    font_name: FontFamily = FontFamily.CALIBRI
    font_size_body: int = 11
    font_size_name: int = 16
    font_size_section: int = 12
    margin_inches: float = 1.0
    line_spacing: float = 1.15
    date_format: DateFormat = DateFormat.MON_YYYY
    bullet_style: BulletStyle = BulletStyle.DASH
    section_order: list[str] = Field(
        default_factory=lambda: ["summary", "experience", "education", "skills", "certifications"]
    )
    include_section_headers: bool = True
    single_column: bool = True
    max_pages: int = 2
    header_fields: list[str] = Field(
        default_factory=lambda: ["name", "email", "phone", "location", "linkedin_url"]
    )


DEFAULT_TEMPLATE = ResumeTemplateSettings()
