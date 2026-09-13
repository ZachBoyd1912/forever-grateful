// SOURCED CHART PRIMITIVES — not hand-designed.
// shadcn/ui Chart docs (via Context7 /websites/ui_shadcn):
//   https://ui.shadcn.com/docs/components/base/chart
//   - "Install Recharts via npm" (already a project dep — 21st.dev rule:
//     one chart lib per dashboard, so recharts only)
//   - "Define Chart Data" + "Define Chart Configuration" (chartConfig
//     label+color, satisfies ChartConfig)
//   - "Complete BarChart with Legend example" — BarChart +
//     CartesianGrid vertical={false} + XAxis tickLine={false}
//     tickMargin={10} axisLine={false} + ChartTooltip + Bar radius={4}
//     + fill="var(--color-*)" theming.
// Adapted to zero extra deps: ChartContainer is a plain div exposing
// --color-* vars; ChartTooltip uses recharts default tooltip styled
// via contentStyle (same technique as before, now token-driven).
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type ChartConfig = Record<string, { label: string; color: string }>;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { config: ChartConfig; children: ReactNode }) {
  const vars = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as CSSProperties;
  return (
    <div data-slot="chart" className={cx("min-h-[200px] w-full", className)} style={vars} {...props}>
      {children}
    </div>
  );
}

export const chartTooltipStyle = {
  background: "#101014",
  border: "1px solid #232329",
  borderRadius: 10,
  color: "#f4f4f5",
  fontSize: 12,
} as const;
