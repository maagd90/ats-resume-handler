import LegalPageShell from "@/components/marketing/LegalPageShell";
import { SUPPORT_EMAIL } from "@/lib/marketing/content";

export const metadata = { title: "Refund Policy — PassATS" };

export default function RefundPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <p>
        Free tier requires no payment. Prime is billed once for the selected term (3, 6, or 12 months) and does not
        auto-renew.
      </p>
      <p>
        If you are unhappy with Prime, contact{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within <strong>7 days</strong> of purchase for a full
        refund, provided automated applications have not yet been sent on your behalf.
      </p>
      <p>
        After applications are sent, refunds may be prorated or declined at our discretion, depending on usage and
        third-party costs incurred.
      </p>
      <p>Chargebacks without contacting support first may result in account suspension.</p>
    </LegalPageShell>
  );
}
