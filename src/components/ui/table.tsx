// SOURCED COMPONENT — not hand-designed.
// shadcn/ui Table composition (via Context7 /websites/ui_shadcn):
//   https://ui.shadcn.com/docs/components/base/table
//   "Render a basic Table in React JSX" + "Import Table subcomponents"
//   Table > Composition: Table > TableHeader(TableRow+TableHead) >
//   TableBody(TableRow+TableCell) + TableCaption.
// 21st.dev MCP [id:1050] by shadcn — "Data Table" (TanStack demo):
//   canonical Table primitives (caption-bottom, [&_tr]:border-b,
//   hover:bg-muted/50, h-10 px-2, TableFooter) + sortable header demo
//   (ArrowUpDown). Adapted: TableFooter added verbatim-pattern; full
//   TanStack progression deliberately NOT installed (zero-new-deps rule —
//   50-row Recent bets sorts client-side via SortButton below, same UX).
// 21st.dev blog guidance: sticky header + headless sorting logic stays ours.
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table
        data-slot="table"
        className={cx("w-full caption-bottom text-sm text-foreground", className)}
        {...props}
      />
    </div>
  );
}

export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      data-slot="table-caption"
      className={cx("mt-3 px-4 pb-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead data-slot="table-header" className={cx("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody data-slot="table-body" className={cx("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cx(
        "border-b border-border/60 transition-colors duration-200",
        "hover:bg-white/[0.03] data-[state=selected]:bg-white/[0.06]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cx(
        "h-10 bg-muted/60 px-4 text-left align-middle text-xs font-medium whitespace-nowrap",
        "text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      data-slot="table-cell"
      className={cx("px-4 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cx("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

export function SortButton({
  label,
  active,
  direction,
  onToggle,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? `Sort by ${label}, ${direction === "asc" ? "ascending" : "descending"} (activate to reverse)` : `Sort by ${label}`}
      title={active ? `${label} (${direction})` : `Sort by ${label}`}
      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {label}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 opacity-70"
      >
        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
      </svg>
      <span className="sr-only">{active ? (direction === "asc" ? "(ascending)" : "(descending)") : ""}</span>
    </button>
  );
}
