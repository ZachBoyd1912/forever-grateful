// SOURCED COMPONENT — not hand-designed.
// shadcn/ui Badge (via Context7 /websites/ui_shadcn):
//   https://ui.shadcn.com/docs/components/aria/badge (Badge API + variants)
//   "Customize Badge Colors using Tailwind CSS" snippet — custom
//   bg-*/text-* with dark: variants copied as the pattern.
// ui-ux-pro-max: critical info never color-only (badge pairs dot + text).
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "profit" | "loss" | "secondary" | "outline";

const styles: Record<BadgeVariant, string> = {
  default: "bg-primary/15 text-[#93c5fd] ring-1 ring-primary/30",
  profit: "bg-green-500/10 text-green-300 dark:bg-green-950 dark:text-green-300 ring-1 ring-green-500/30",
  loss: "bg-red-500/10 text-red-300 dark:bg-red-950 dark:text-red-300 ring-1 ring-red-500/30",
  secondary: "bg-white/5 text-zinc-300 ring-1 ring-white/10",
  outline: "bg-transparent text-zinc-300 ring-1 ring-white/15",
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  variant = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cx(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
        "rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        "transition-colors duration-200",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ProfitBadge({ value, className }: { value: number; className?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold",
        positive
          ? "bg-green-500/10 text-green-300 ring-1 ring-green-500/30"
          : "bg-red-500/10 text-red-300 ring-1 ring-red-500/30",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx("size-1.5 rounded-full", positive ? "bg-green-400" : "bg-red-400")}
      />
      {positive ? "+" : ""}
      {value.toFixed(2)}
    </span>
  );
}
