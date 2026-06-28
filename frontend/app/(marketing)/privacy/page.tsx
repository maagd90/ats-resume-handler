import LegalPageShell from "@/components/marketing/LegalPageShell";
import { PRIVACY_EMAIL } from "@/lib/marketing/content";

export const metadata = { title: "Privacy Policy — PassATS" };

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        We process your resume and profile solely to deliver optimization, tailoring, and (for Prime) automated
        applications you initiate. We use third-party AI providers to generate suggestions and never sell your data.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li>Account email and password (hashed)</li>
        <li>Uploaded resumes, LinkedIn exports, and profile text you provide</li>
        <li>Job criteria and automation settings (Prime)</li>
        <li>Payment metadata via Stripe (we do not store full card numbers)</li>
        <li>Usage logs for quotas and activity transparency</li>
      </ul>
      <h2>How we use data</h2>
      <ul>
        <li>Resume parsing, ATS scoring, and AI-assisted rewriting</li>
        <li>LinkedIn optimization suggestions</li>
        <li>Job search, fit scoring, and (Prime) preparing or sending applications you authorize</li>
        <li>Billing and membership management</li>
      </ul>
      <h2>Third parties</h2>
      <ul>
        <li>OpenAI or Anthropic for platform AI processing</li>
        <li>Stripe for payments</li>
        <li>JSearch (or similar) for job listings when configured</li>
        <li>SMTP providers when email apply is used</li>
        <li>Optional analytics (only if enabled) — see cookie section below</li>
      </ul>
      <h2>Auto-apply data flow</h2>
      <p>
        When you enable Prime automation and approve (or auto-send, if you disable Review Mode) an application, we may
        transmit your resume, cover letter, and contact details to employers or job boards on your behalf. You authorize
        this action and remain responsible for accuracy and compliance.
      </p>
      <h2>Retention & deletion</h2>
      <p>
        We retain data while your account is active and as needed to provide the service. Request export or deletion at{" "}
        <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
      </p>
      <h2>Cookies & analytics</h2>
      <p>
        We use httpOnly session cookies for authentication. If analytics is enabled, we may use privacy-friendly
        page-view analytics with no cross-site tracking. You will be notified in-product when analytics is active.
      </p>
      <h2>International processing</h2>
      <p>
        Data may be processed in regions where our infrastructure and subprocessors operate. By using PassATS you
        consent to transfer as needed to deliver the service.
      </p>
      <h2>Children</h2>
      <p>PassATS is not intended for users under 16.</p>
    </LegalPageShell>
  );
}
