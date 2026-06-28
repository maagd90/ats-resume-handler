from typing import Optional

from pydantic import BaseModel, Field

from src.models.profile import ContactInfo, EducationEntry, ExperienceEntry


class ProfileUpdate(BaseModel):
    contact: Optional[ContactInfo] = None
    summary: Optional[str] = None
    skills: Optional[list[str]] = None
    experience: Optional[list[ExperienceEntry]] = None
    education: Optional[list[EducationEntry]] = None
