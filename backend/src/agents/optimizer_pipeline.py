import uuid
from pathlib import Path

from src.agents.linkedin_agent import linkedin_agent
from src.agents.resume_agent import resume_agent
from src.config import settings
from src.models.optimization_proposal import FieldChange, OptimizationProposal, ProposalStatus
from src.models.profile import CandidateProfile
from src.models.resume_template import DEFAULT_TEMPLATE, ResumeTemplateSettings
from src.scoring.impact_advisor import build_impact_improvement_plan
from src.services.data_store import data_store
from src.services.proposal_store import proposal_store
from src.services.resume_renderer import ResumeRenderer
from src.services.usage_service import usage_service


class OptimizerPipeline:
    async def run(self, profile: CandidateProfile, linkedin_text: str, user_id: str = "default") -> OptimizationProposal:
        usage_service.check_optimization_quota(user_id)

        if not profile.resume_raw_text:
            raise ValueError("Upload a resume before running optimization.")

        proposal_id = proposal_store.new_id()
        proposal = OptimizationProposal(id=proposal_id, user_id=user_id, status=ProposalStatus.DRAFT)
        warnings: list[str] = []

        review = await resume_agent.review(profile)
        proposal.resume_score = review.score
        proposal.resume_issues = [i.model_dump() for i in review.issues]
        proposal.impact_improvement_plan = build_impact_improvement_plan(profile, review.score.impact)

        if review.optimized_text and review.optimized_text != (profile.resume_raw_text or ""):
            proposal.resume_changes.append(
                FieldChange(
                    field="summary",
                    section="resume",
                    before=profile.summary or "",
                    after=review.section_feedback.get("summary", review.optimized_text[:500]),
                )
            )

        tmpl_settings = DEFAULT_TEMPLATE
        if profile.resume_template_settings:
            tmpl_settings = ResumeTemplateSettings.model_validate(profile.resume_template_settings)
        renderer = ResumeRenderer(tmpl_settings)

        linkedin_result = None
        if linkedin_text.strip():
            linkedin_result = await linkedin_agent.analyze(profile, linkedin_text)
            warnings.extend(linkedin_result.validation_warnings or [])

            if linkedin_result.headline_variants:
                proposal.headline_variants = linkedin_result.headline_variants
                proposal.linkedin_changes.append(
                    FieldChange(
                        field="headline",
                        section="linkedin",
                        before=profile.linkedin_headline or linkedin_text.splitlines()[0] if linkedin_text else "",
                        after=linkedin_result.headline_variants[0],
                        guidance_steps=[
                            "Go to linkedin.com and open your profile",
                            "Click the pencil icon next to your headline",
                            "Paste the optimized headline below",
                            "Click Save",
                        ],
                        guidance_tip="Keep headline under 220 characters",
                    )
                )

            if linkedin_result.optimized_about:
                proposal.linkedin_changes.append(
                    FieldChange(
                        field="about",
                        section="linkedin",
                        before=profile.linkedin_about or "",
                        after=linkedin_result.optimized_about,
                        guidance_steps=[
                            "Scroll to the About section on your profile",
                            "Click the pencil icon to edit",
                            "Replace with the optimized text below",
                            "Click Save",
                        ],
                        guidance_tip="Use first-person voice with 2-3 target-role keywords",
                    )
                )

            proposal.skills_to_add = linkedin_result.skills_to_add
            proposal.linkedin_guidance = linkedin_result.guidance or []

            for upgrade in linkedin_result.experience_upgrades:
                proposal.linkedin_changes.append(
                    FieldChange(
                        field=f"experience_{upgrade.get('role', 'role')}",
                        section="linkedin",
                        before="(current bullets)",
                        after=str(upgrade.get("upgraded_bullets") or upgrade),
                        guidance_steps=[
                            "Open the experience entry on LinkedIn",
                            "Click edit on the role description",
                            "Update bullets with the optimized text",
                            "Click Save",
                        ],
                        guidance_tip="Use quantified achievements from your resume",
                    )
                )

        export_dir = settings.applications_path / f"proposal_{proposal_id}"
        export_dir.mkdir(parents=True, exist_ok=True)

        tailored = {"summary": review.optimized_text[:500] if review.optimized_text else profile.summary}
        resume_path = renderer.render_docx(profile, tailored, export_dir / "optimized_resume.docx", tmpl_settings)
        proposal.optimized_resume_path = str(resume_path)

        if linkedin_result:
            pack_path = renderer.render_linkedin_pack_docx(
                {
                    "headline_variants": linkedin_result.headline_variants,
                    "optimized_about": linkedin_result.optimized_about,
                    "experience_upgrades": linkedin_result.experience_upgrades,
                    "skills_to_add": linkedin_result.skills_to_add,
                },
                export_dir / "linkedin_content_pack.docx",
            )
            proposal.linkedin_pack_path = str(pack_path)

        proposal.validation_warnings = warnings
        proposal.status = ProposalStatus.READY

        data_store.save_profile(review.profile)
        proposal_store.save(proposal)
        usage_service.increment_optimization(user_id)
        data_store.log_activity(f"Optimization complete. Proposal {proposal_id} ready for review.", user_id=user_id)
        return proposal


optimizer_pipeline = OptimizerPipeline()
