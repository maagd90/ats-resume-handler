from pathlib import Path

from src.config import settings
from src.models.profile import CandidateProfile
from src.security.url_validator import validate_http_url


class BrowserApplyExecutor:
    """Playwright-based form apply for simple career pages."""

    def apply(
        self,
        profile: CandidateProfile,
        apply_url: str,
        resume_path: Path,
        cover_letter_path: Path | None = None,
    ) -> dict:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:
            raise RuntimeError("Playwright is not installed.") from exc

        screenshot_dir = settings.applications_path / "screenshots"
        screenshot_dir.mkdir(parents=True, exist_ok=True)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            safe_url = validate_http_url(apply_url, field_name="apply_url")
            page.goto(safe_url, timeout=30000)

            fields = {
                "input[name*='name' i], input[id*='name' i]": profile.contact.name or "",
                "input[type='email'], input[name*='email' i]": profile.contact.email or profile.email_for_applications or "",
                "input[type='tel'], input[name*='phone' i]": profile.contact.phone or "",
                "input[name*='linkedin' i]": profile.contact.linkedin_url or "",
            }
            for selector, value in fields.items():
                if not value:
                    continue
                locator = page.locator(selector).first
                if locator.count() > 0:
                    locator.fill(value)

            file_inputs = page.locator("input[type='file']")
            if file_inputs.count() > 0 and resume_path.exists():
                file_inputs.first.set_input_files(str(resume_path))

            submit = page.locator("button[type='submit'], input[type='submit']").first
            screenshot_path = screenshot_dir / f"apply_{abs(hash(apply_url))}.png"
            page.screenshot(path=str(screenshot_path))

            if submit.count() > 0:
                submit.click()
                page.wait_for_timeout(2000)
                page.screenshot(path=str(screenshot_path.with_name(screenshot_path.stem + "_after.png")))

            browser.close()

        return {"success": True, "screenshot": str(screenshot_path)}


browser_apply_executor = BrowserApplyExecutor()
