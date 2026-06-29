export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-8 w-48 rounded-lg bg-muted dark:bg-slate-800" />
      <div className="h-4 w-96 max-w-full rounded bg-muted dark:bg-slate-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card h-32" />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-8">
      <div className="h-10 rounded-lg bg-muted dark:bg-slate-800" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-muted/70 dark:bg-slate-800/70" />
      ))}
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-surface-muted">
      <div className="hidden w-64 border-r border-border bg-surface p-4 md:block">
        <div className="h-8 w-32 rounded bg-muted dark:bg-slate-800" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-muted dark:bg-slate-800" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-8">
        <PageSkeleton />
      </div>
    </div>
  );
}
