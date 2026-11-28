'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-lg ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="size-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading records"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 py-2">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <Skeleton className="h-4 flex-1 max-w-[200px]" />
          <Skeleton className="h-4 flex-1 max-w-[140px] hidden sm:block" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}
