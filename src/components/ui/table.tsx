// SOURCED COMPONENT — not hand-designed.
// shadcn/ui Table composition (via Context7 /websites/ui_shadcn):
//   https://ui.shadcn.com/docs/components/base/table
//   "Render a basic Table in React JSX" + "Import Table subcomponents"
//   Table > Composition: Table > TableHeader(TableRow+TableHead) >
//   TableBody(TableRow+TableCell) + TableCaption.
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
