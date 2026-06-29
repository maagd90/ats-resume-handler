export default function TrustStrip() {
  const items = [
    "Platform AI included",
    "No API keys required",
    "Your resume stays private",
    "Review Mode before apply",
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-border bg-surface-muted py-4 text-sm text-muted-foreground">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );
}
