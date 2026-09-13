// SOURCED COMPONENTS — not hand-designed.
// 1) SkeletonTable pattern (via Context7 /websites/ui_shadcn):
//      https://ui.shadcn.com/docs/components/aria/skeleton
//      "Skeleton Table Placeholder" — map over array of Skeletons.
// 2) EmptyMuted pattern:
//      https://ui.shadcn.com/docs/components/aria/empty
//      "Adding a Background to the Empty State" — Empty > EmptyHeader
//      (Media + Title + Description) + EmptyContent.
// 3) ui-ux-pro-max loading-states rule: skeleton screens or spinners,
//    never blank screen while loading.
import type { HTMLAttributes, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cx("animate-pulse rounded-md bg-white/[0.07]", className)}
      {...props}
    />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-col gap-2" role="status" aria-label="Loading bets">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="status" aria-label="Loading stats">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function Empty({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      data-slot="empty"
      className={cx(
        "flex h-full min-h-40 flex-col items-center justify-center gap-4 rounded-lg bg-muted/30 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="empty-header" className={cx("flex flex-col items-center gap-2", className)} {...props} />;
}

export function EmptyMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-media"
      className={cx(
        "flex size-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 data-slot="empty-title" className={cx("text-sm font-semibold text-foreground", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p data-slot="empty-description" className={cx("max-w-xs text-[13px] text-pretty text-muted-foreground", className)} {...props} />
  );
}

export function EmptyContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="empty-content" className={cx("flex items-center gap-2", className)} {...props} />;
}
