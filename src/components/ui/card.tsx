// SOURCED COMPONENT — not hand-designed.
// shadcn/ui Card composition (via Context7 /websites/ui_shadcn):
//   https://ui.shadcn.com/docs/components/aria/card  (Basic Card Usage + API Reference)
//   https://ui.shadcn.com/docs/components/base/card  (CardImage cover pattern)
// Tailwind card pattern (via Context7 /websites/tailwindcss):
//   https://tailwindcss.com/docs/styling-with-utility-classes (Basic Card w/ dark: variant)
//   https://tailwindcss.com/docs/dark-mode (dark: prefix)
// ui-ux-pro-max rules applied: cursor-pointer on interactive, 150-300ms
// transitions, visible ring, no layout-shifting hover scale.
import type { HTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cx(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground",
        "ring-1 ring-foreground/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]",
        "transition-colors duration-200 hover:border-foreground/20",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cx(
        "grid auto-rows-min items-start gap-1 rounded-t-xl px-5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cx("text-sm font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cx("text-[13px] leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-action" className={cx("flex items-center gap-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cx("px-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cx("flex items-center rounded-b-xl border-t border-border bg-muted/40 px-5 py-3", className)}
      {...props}
    />
  );
}
