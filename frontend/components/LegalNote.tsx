/** Small legal / attribution note — original UI, no third-party template claims. */
export default function LegalNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      Layout presets and UI on this site are original PassATS designs for ATS-friendly exports.
      We are not affiliated with, endorsed by, or copying any third-party resume marketplace or community template file.
      Company names on marketing pages are illustrative only unless you enter your own data.
    </p>
  );
}
