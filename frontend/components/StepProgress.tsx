const STEPS = ["Upload", "LinkedIn", "Analyze", "Download"];

export default function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-brand-600 text-white" : active ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:inline ${active ? "text-brand-700" : done ? "text-slate-600" : "text-slate-400"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${done ? "bg-brand-400" : "bg-slate-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}
