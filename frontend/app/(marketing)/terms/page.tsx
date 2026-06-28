import LegalPageShell from "@/components/marketing/LegalPageShell";

export const metadata = { title: "Terms of Service — PassATS" };

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <h2>Eligibility</h2>
      <p>You must be at least 16 and able to form a binding contract. You are responsible for your account credentials.</p>
      <h2>Acceptable use</h2>
      <p>
        Do not upload unlawful content, impersonate others, or attempt to abuse platform AI quotas, automation, or
        third-party job boards.
      </p>
      <h2>Auto-apply authorization</h2>
      <ul>
        <li>You authorize PassATS to prepare and, when approved or configured, submit applications on your behalf.</li>
        <li>You are responsible for the accuracy of all information submitted to employers.</li>
        <li>You must comply with each job board&apos;s terms of service.</li>
        <li>PassATS is not liable for hiring outcomes, rejections, or account actions taken by third-party platforms.</li>
      </ul>
      <h2>Billing</h2>
      <p>
        Free tier requires no payment. Prime is billed once for the selected term (3, 6, or 12 months) and does not
        auto-renew. Access continues until the term expires, then reverts to Free unless you purchase again.
      </p>
      <h2>Intellectual property</h2>
      <p>
        PassATS owns the platform, layout presets, and software. You retain ownership of your resume content and grant
        us a license to process it to provide the service.
      </p>
      <h2>Disclaimers</h2>
      <p>
        The service is provided &ldquo;as is.&rdquo; AI suggestions may contain errors — always review before submitting.
        We do not guarantee interviews or offers.
      </p>
      <h2>Termination</h2>
      <p>We may suspend accounts that violate these terms. You may stop using the service at any time.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
    </LegalPageShell>
  );
}
