import asyncio
import re
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from src.config import settings
from src.models.profile import CandidateProfile


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def detect_apply_email(job_description: str, job_url: str = "") -> str | None:
    text = f"{job_description}\n{job_url}"
    emails = EMAIL_RE.findall(text)
    for email in emails:
        if not email.endswith((".png", ".jpg")):
            return email
    if job_url.startswith("mailto:"):
        return job_url.replace("mailto:", "").split("?")[0]
    return None


class EmailApplyExecutor:
    def send_application(
        self,
        profile: CandidateProfile,
        to_email: str,
        subject: str,
        body: str,
        resume_path: Path | None = None,
        cover_letter_path: Path | None = None,
    ) -> None:
        if not settings.smtp_user or not settings.smtp_password:
            raise RuntimeError("SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD.")

        from_email = profile.email_for_applications or profile.contact.email or settings.smtp_user
        msg = MIMEMultipart()
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        for label, path in [("resume.docx", resume_path), ("cover_letter.txt", cover_letter_path)]:
            if path and path.exists():
                with open(path, "rb") as f:
                    part = MIMEApplication(f.read(), Name=path.name)
                part["Content-Disposition"] = f'attachment; filename="{label}"'
                msg.attach(part)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(from_email, [to_email], msg.as_string())


email_apply_executor = EmailApplyExecutor()
