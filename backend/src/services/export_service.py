from pathlib import Path

from src.models.optimization_proposal import OptimizationProposal
from src.models.profile import CandidateProfile
from src.models.resume_template import DEFAULT_TEMPLATE, ResumeTemplateSettings
from src.services.data_store import data_store
from src.services.resume_renderer import ResumeRenderer


def _template_settings(profile: CandidateProfile) -> ResumeTemplateSettings:
    if profile.resume_template_settings:
        return ResumeTemplateSettings.model_validate(profile.resume_template_settings)
    return DEFAULT_TEMPLATE


def _tailored_from_proposal(proposal: OptimizationProposal) -> dict:
    tailored: dict = {}
    for change in proposal.resume_changes:
        if change.field == "summary" and change.after:
            tailored["summary"] = change.after
    return tailored


def _linkedin_content_from_proposal(proposal: OptimizationProposal) -> dict:
    about = next(
        (change.after for change in proposal.linkedin_changes if change.field == "about" and change.after),
        "",
    )
    return {
        "headline_variants": proposal.headline_variants,
        "optimized_about": about,
        "experience_upgrades": [
            {"role": change.field.replace("experience_", ""), "upgraded_bullets": change.after}
            for change in proposal.linkedin_changes
            if change.field.startswith("experience_")
        ],
        "skills_to_add": proposal.skills_to_add,
    }


def ensure_ascii_resume_export(proposal: OptimizationProposal) -> Path:
    if not proposal.optimized_resume_path:
        raise FileNotFoundError("Resume file not found")

    export_dir = Path(proposal.optimized_resume_path).parent
    ascii_path = export_dir / "optimized_resume_ascii.docx"
    if ascii_path.exists():
        return ascii_path

    profile = data_store.get_profile()
    tmpl = _template_settings(profile)
    renderer = ResumeRenderer(tmpl)
    tailored = _tailored_from_proposal(proposal)
    renderer.render_docx(profile, tailored or None, ascii_path, tmpl, ascii_safe=True)
    return ascii_path


def ensure_ascii_linkedin_export(proposal: OptimizationProposal) -> Path:
    if not proposal.linkedin_pack_path:
        raise FileNotFoundError("LinkedIn pack not found")

    export_dir = Path(proposal.linkedin_pack_path).parent
    ascii_path = export_dir / "linkedin_content_pack_ascii.docx"
    if ascii_path.exists():
        return ascii_path

    profile = data_store.get_profile()
    tmpl = _template_settings(profile)
    renderer = ResumeRenderer(tmpl)
    content = _linkedin_content_from_proposal(proposal)
    renderer.render_linkedin_pack_docx(content, ascii_path, ascii_safe=True)
    return ascii_path
