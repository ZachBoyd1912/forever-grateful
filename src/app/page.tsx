'use client'
// FULL REBUILD — sourced UI only, no hand-built design.
// ── design-critique audit (must-fix → fixed) ──────────────────────
// - No shell/hierarchy → 21st.dev shell: sticky topbar + tablist + bento.
// - "Loading…" blank → shadcn SkeletonTable/SkeletonCards.
// - Raw month input → labeled InputGroup-style control w/ focus ring.
// - Low-contrast zinc-500 + color-only P&L → 4.5:1 tokens + dot+text badges.
// - Table w/o caption/scope → shadcn Table composition + caption + scope.
// ── sources ───────────────────────────────────────────────────────
// - Shell: 21st.dev “React Dashboard Components” blog (shell + metric
//   cards + 1–2 charts + table) + “Dashboard Sidebar” shell header
//   pattern (breadcrumb bar + toggle + search slot) + shadcn SidebarInset
//   header (flex h-16 items-center gap-2 px-4).
// - Cards: shadcn Card composition + Tailwind Basic Card dark: pattern +
//   21st “Animated Dashboard Card” hover + “Statistics Card” grid.
// - Charts: shadcn Complete BarChart with Legend (CartesianGrid
//   vertical={false}, XAxis tickLine false/tickMargin 10/axisLine false,
//   Bar radius 4, var(--color-*) fill) on recharts only (21st one-lib rule).
// - Table: shadcn “Render a basic Table in React JSX” composition.
// - Badges: shadcn “Customize Badge Colors” dark: pattern.
// - Loading/Empty: shadcn SkeletonTable + EmptyMuted composition.
// - Tokens/type: ui-ux-pro-max Dark OLED (#3B82F6/#60A5FA/#F97316,
//   Fira Code/Sans, glow, 150–300ms, 44px targets, reduced-motion).
// - VGPU: corpus is WebGPU-only (/guides, /vgpu/*) — no dashboard UI
//   found, so no UI sourced from VGPU (honest fallback).
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, chartTooltipStyle, type ChartConfig } from '@/components/ui/chart'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
  SkeletonCards,
  SkeletonTable,
} from '@/components/ui/feedback'

type Summary = {
  bets: number
  totalStake: number
  totalPayout: number
  net: number
  roi: number
  winRate: number
}

type BetView = {
  id: string
  timestamp: string
  gameType: string
  gameName: string | null
  stake: number
  payout: number
  net: number
  multiplier: number | null
  currency: string
  status: string
  notes: string | null
  tags: string[]
}

type DashboardData = {
  last24h: Summary
  last7d: Summary
  last30d: Summary
  month: (Summary & {
    key: string
    dailyPnL: { date: string; pnl: number }[]
    bestBet: BetView | null
    worstBet: BetView | null
  }) | null
  gameBreakdown: { game: string; count: number; roi: number; net: number }[]
  allBets: BetView[]
}

const pnlChartConfig = {
  pnl: { label: 'Daily P&L', color: '#3b82f6' },
} satisfies ChartConfig

const roiChartConfig = {
  roi: { label: 'ROI %', color: '#60a5fa' },
} satisfies ChartConfig

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}`
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// Lucide SVG paths (ui-ux-pro-max no-emoji-icons rule: Heroicons/Lucide only)
function TrendIcon({ up, className }: { up: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
    >
      {up ? (
        <>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </>
      ) : (
        <>
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </>
      )}
    </svg>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className ?? 'size-8'}>
      <defs>
        <linearGradient id="rt-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#rt-logo)" />
      <path
        d="M7 15.5v-7h4.2a2.6 2.6 0 0 1 0 5.2H9.4l3.1 3.1"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="17" cy="8" r="1.4" fill="white" />
    </svg>
  );
}

function MetricCard({
  title,
  description,
  summary,
  accent,
}: {
  title: string
  description: string
  summary: Summary
  accent?: string
}) {
  const up = summary.net >= 0
  return (
    // 21st Animated Dashboard Card: motion on hover, no layout shift
    <Card className="group relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(59,130,246,0.35)]">
      <div
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100',
        )}
      />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant={up ? 'profit' : 'loss'}>
            <TrendIcon up={up} className="size-3" />
            {up ? 'Profit' : 'Loss'}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div
          aria-live="polite"
          className={cx(
            'font-mono text-3xl font-semibold tracking-tight tabular-nums',
            up ? 'text-green-300' : 'text-red-300',
            // ui-ux-pro-max minimal glow
            '[text-shadow:0_0_18px_rgba(34,197,94,0.25)]',
          )}
          style={up ? undefined : { textShadow: '0 0 18px rgba(239,68,68,0.25)' }}
        >
          {formatMoney(summary.net)}
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.06]">
            <dt className="text-muted-foreground">ROI</dt>
            <dd className="mt-0.5 font-mono font-semibold text-foreground tabular-nums">
              {summary.roi.toFixed(1)}%
            </dd>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.06]">
            <dt className="text-muted-foreground">Bets</dt>
            <dd className="mt-0.5 font-mono font-semibold text-foreground tabular-nums">
              {summary.bets}
            </dd>
          </div>
          <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.06]">
            <dt className="text-muted-foreground">Win</dt>
            <dd className="mt-0.5 font-mono font-semibold text-foreground tabular-nums">
              {summary.winRate.toFixed(0)}%
            </dd>
          </div>
        </dl>
        {accent ? <p className="mt-2 text-[11px] text-muted-foreground">{accent}</p> : null}
      </CardContent>
    </Card>
  )
}

function BetHighlight({ label, bet }: { label: string; bet: BetView | null }) {
  if (!bet) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm ring-1 ring-white/[0.06]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">— no bets</span>
      </div>
    )
  }
  const up = bet.net >= 0
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-sm ring-1 ring-white/[0.06]">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <TrendIcon up={up} className={cx('size-3.5', up ? 'text-green-400' : 'text-red-400')} />
        {label}
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className={cx('font-mono font-semibold tabular-nums', up ? 'text-green-300' : 'text-red-300')}>
          {formatMoney(bet.net)}
        </span>
        <span className="text-xs text-muted-foreground">
          {bet.gameName || bet.gameType} · {new Date(bet.timestamp).toLocaleDateString()}
        </span>
      </span>
    </div>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'month', label: 'Month', href: '#month' },
  { id: 'games', label: 'Games', href: '#games' },
  { id: 'recent', label: 'Recent bets', href: '#recent' },
] as const

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [activeTab, setActiveTab] = useState<string>('overview')

  function handleMonthChange(value: string) {
    setError(null)
    setMonth(value)
  }

  useEffect(() => {
    let cancelled = false
    fetch(`/api/stats?month=${month}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Stats request failed (${r.status})`)
        return r.json()
      })
      .then((json: DashboardData) => {
        if (!cancelled) setData(json)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load stats')
      })
    return () => {
      cancelled = true
    }
  }, [month])

  const headline = data?.last30d ?? null
  const headlineUp = (headline?.net ?? 0) >= 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── 21st shell header (Dashboard Sidebar + SidebarInset pattern) ── */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href="#overview" className="flex min-h-11 min-w-11 cursor-pointer items-center gap-2.5 rounded-lg">
            <LogoMark />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">Roobet Tracker</span>
              <span className="block text-[11px] text-muted-foreground">Private P&L dashboard</span>
            </span>
          </a>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-green-400" />
              Live · {data ? `${data.allBets.length} bets` : 'syncing'}
            </Badge>
            <label htmlFor="month-top" className="sr-only">
              Select month
            </label>
            <input
              id="month-top"
              type="month"
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="h-11 cursor-pointer rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors duration-200 hover:border-foreground/25"
            />
            <a
              href="#recent"
              className="hidden h-11 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-[#2f6fed] sm:inline-flex"
            >
              Import bets
            </a>
          </div>
        </div>
        {/* shadcn Tabs composition: Tabs > TabsList > TabsTrigger */}
        <nav aria-label="Dashboard sections" className="border-t border-border/50">
          <div
            role="tablist"
            aria-label="Dashboard sections"
            className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6"
          >
            {TABS.map((t) => {
              const selected = activeTab === t.id
              return (
                <a
                  key={t.id}
                  role="tab"
                  aria-selected={selected}
                  href={t.href}
                  onClick={() => setActiveTab(t.id)}
                  className={cx(
                    'relative flex min-h-11 cursor-pointer items-center px-3 text-sm whitespace-nowrap transition-colors duration-200',
                    selected ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary transition-opacity duration-200',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </a>
              )
            })}
          </div>
        </nav>
      </header>

      <main id="overview" className="mx-auto w-full max-w-7xl scroll-mt-32 px-4 pt-6 pb-16 sm:px-6">
        {error ? (
          <Card role="alert" className="border-red-500/30">
            <CardHeader>
              <CardTitle>Couldn&apos;t load dashboard</CardTitle>
              <CardDescription>Check DATABASE_URL, migrations, and /api/stats.</CardDescription>
              <CardAction>
                <Badge variant="loss">Error</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg bg-red-500/10 px-3 py-2 font-mono text-[13px] text-red-200 ring-1 ring-red-500/30">
                {error}
              </p>
            </CardContent>
          </Card>
        ) : !data || !headline ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-10 w-56" />
              <Skeleton className="mt-3 h-3 w-full" />
            </div>
            <SkeletonCards />
            <SkeletonTable rows={6} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* ── 21st hierarchy: one headline number, then trend, then breakdown ── */}
            <Card className="relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_16rem_at_20%_0%,rgba(59,130,246,0.16),transparent_65%)]"
              />
              <CardHeader>
                <CardTitle className="text-base">30-day headline</CardTitle>
                <CardDescription>Wagered {headline.totalStake.toFixed(2)} across {headline.bets} bets</CardDescription>
                <CardAction>
                  <Badge variant={headlineUp ? 'profit' : 'loss'}>
                    <TrendIcon up={headlineUp} className="size-3" />
                    ROI {headline.roi.toFixed(1)}%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Net P&L</div>
                    <div
                      aria-live="polite"
                      className={cx(
                        'font-mono text-5xl font-semibold tracking-tight tabular-nums',
                        headlineUp ? 'text-green-300' : 'text-red-300',
                      )}
                      style={
                        headlineUp
                          ? { textShadow: '0 0 24px rgba(34,197,94,0.3)' }
                          : { textShadow: '0 0 24px rgba(239,68,68,0.3)' }
                      }
                    >
                      {formatMoney(headline.net)}
                    </div>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                      Win rate {headline.winRate.toFixed(1)}% · Paid out {headline.totalPayout.toFixed(2)}.
                      Scroll for the monthly trend, game breakdown, and every bet.
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                    {[
                      { k: 'Bets', v: String(headline.bets) },
                      { k: 'Win rate', v: `${headline.winRate.toFixed(1)}%` },
                      { k: 'Wagered', v: headline.totalStake.toFixed(0) },
                    ].map((s) => (
                      <div key={s.k} className="min-w-20 rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.06]">
                        <dt className="text-[11px] text-muted-foreground">{s.k}</dt>
                        <dd className="font-mono font-semibold tabular-nums">{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/* ── 21st Statistics Card grid ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard title="Last 24 hours" description="Rolling daily window" summary={data.last24h} />
              <MetricCard title="Last 7 days" description="Rolling weekly window" summary={data.last7d} />
              <MetricCard
                title="Last 30 days"
                description="Rolling monthly window"
                summary={data.last30d}
                accent={`Wagered ${data.last30d.totalStake.toFixed(2)} · ${data.last30d.bets} bets`}
              />
            </div>

            {/* ── 21st Analytics Bento: month (2 cols) + highlights ── */}
            <div id="month" className="grid scroll-mt-32 grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly trend</CardTitle>
                  <CardDescription>
                    {data.month ? `Daily net P&L for ${data.month.key}` : `No monthly data for ${month}`}
                  </CardDescription>
                  <CardAction>
                    <label htmlFor="month" className="sr-only">
                      Month
                    </label>
                    <input
                      id="month"
                      type="month"
                      value={month}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="h-11 cursor-pointer rounded-lg border border-border bg-muted/60 px-3 text-sm transition-colors duration-200 hover:border-foreground/25"
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {data.month ? (
                    <>
                      <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {[
                          { k: 'Net P&L', v: formatMoney(data.month.net), up: data.month.net >= 0 },
                          { k: 'ROI', v: `${data.month.roi.toFixed(1)}%`, up: data.month.roi >= 0 },
                          { k: 'Bets', v: String(data.month.bets), up: true },
                          { k: 'Win rate', v: `${data.month.winRate.toFixed(1)}%`, up: true },
                        ].map((s) => (
                          <div key={s.k} className="rounded-lg bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]">
                            <dt className="text-[11px] text-muted-foreground">{s.k}</dt>
                            <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{s.v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-3 space-y-2">
                        <BetHighlight label="Best bet" bet={data.month.bestBet} />
                        <BetHighlight label="Worst bet" bet={data.month.worstBet} />
                      </div>
                      <ChartContainer config={pnlChartConfig} className="mt-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.month.dailyPnL}>
                            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                            <XAxis
                              dataKey="date"
                              stroke="var(--chart-tick)"
                              fontSize={11}
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                            />
                            <YAxis stroke="var(--chart-tick)" fontSize={11} tickLine={false} axisLine={false} width={48} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Bar dataKey="pnl" fill="var(--color-pnl)" radius={4}>
                              {data.month.dailyPnL.map((d, i) => (
                                <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia>
                          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                            <rect x="3" y="4" width="18" height="17" rx="2" />
                            <path d="M8 2v4M16 2v4M3 9h18" strokeLinecap="round" />
                          </svg>
                        </EmptyMedia>
                        <EmptyTitle>No data for {month}</EmptyTitle>
                        <EmptyDescription>Import bets for this month, or pick another month above.</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <Card id="games" className="scroll-mt-32">
                  <CardHeader>
                    <CardTitle>Top games · 30d</CardTitle>
                    <CardDescription>By bet count</CardDescription>
                    <CardAction>
                      <Badge variant="secondary">{data.gameBreakdown.length} games</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {data.gameBreakdown.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bets in the last 30 days.</p>
                    ) : (
                      <ul className="space-y-2">
                        {data.gameBreakdown.slice(0, 5).map((g) => {
                          const up = g.net >= 0
                          return (
                            <li
                              key={g.game}
                              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-white/[0.02] px-3 py-2 ring-1 ring-white/[0.06] transition-colors duration-200 hover:bg-white/[0.05]"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">{g.game}</span>
                                <span className="block text-[11px] text-muted-foreground">{g.count} bets</span>
                              </span>
                              <span className="text-right">
                                <span className={cx('block font-mono text-sm font-semibold tabular-nums', up ? 'text-green-300' : 'text-red-300')}>
                                  {formatMoney(g.net)}
                                </span>
                                <span className="block font-mono text-[11px] text-muted-foreground tabular-nums">
                                  {g.roi.toFixed(1)}%
                                </span>
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">Full ROI chart below.</p>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How to import</CardTitle>
                    <CardDescription>Bookmarklet → history page → auto-ingest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-muted-foreground">
                      <li>Open Roobet bet history while logged in.</li>
                      <li>Click your tracker bookmarklet.</li>
                      <li>Return here — stats refresh automatically.</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ROI by game type · 30 days</CardTitle>
                <CardDescription>Green holds, red bleeds — size bets accordingly.</CardDescription>
                <CardAction>
                  <Badge variant="secondary">{data.gameBreakdown.length} types</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                {data.gameBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bets in the last 30 days.</p>
                ) : (
                  <ChartContainer config={roiChartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.gameBreakdown}>
                        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                        <XAxis
                          dataKey="game"
                          stroke="var(--chart-tick)"
                          fontSize={11}
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <YAxis stroke="var(--chart-tick)" fontSize={11} tickLine={false} axisLine={false} width={48} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="roi" fill="var(--color-roi)" radius={4}>
                          {data.gameBreakdown.map((g, i) => (
                            <Cell key={i} fill={g.roi >= 0 ? '#22c55e' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* ── shadcn DataTable region (headless logic stays ours) ── */}
            <Card id="recent" className="scroll-mt-32">
              <CardHeader>
                <CardTitle>Recent bets</CardTitle>
                <CardDescription>Newest first · showing up to 50</CardDescription>
                <CardAction>
                  <Badge variant="secondary">{data.allBets.length} total</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                {data.allBets.length === 0 ? (
                  <Empty className="bg-muted/30">
                    <EmptyHeader>
                      <EmptyMedia>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                          <rect x="3" y="6" width="18" height="13" rx="2" />
                          <path d="M3 10h18M8 3v3M16 3v3" strokeLinecap="round" />
                        </svg>
                      </EmptyMedia>
                      <EmptyTitle>No bets yet</EmptyTitle>
                      <EmptyDescription>
                        Click your bookmarklet on Roobet&apos;s history page to import your first bets.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <a
                        href="#overview"
                        className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.06]"
                      >
                        Back to overview
                      </a>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>
                        Showing {Math.min(50, data.allBets.length)} of {data.allBets.length} bets.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Game</TableHead>
                          <TableHead className="text-right">Stake</TableHead>
                          <TableHead className="text-right">Payout</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.allBets.slice(0, 50).map((b) => {
                          const up = b.net >= 0
                          return (
                            <TableRow key={b.id}>
                              <TableCell className="text-muted-foreground">
                                {new Date(b.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium">{b.gameName || b.gameType}</TableCell>
                              <TableCell className="text-right font-mono tabular-nums">
                                {b.stake.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-mono tabular-nums">
                                {b.payout.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={cx(
                                    'inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums',
                                    up ? 'text-green-300' : 'text-red-300',
                                  )}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={cx('size-1.5 rounded-full', up ? 'bg-green-400' : 'bg-red-400')}
                                  />
                                  {formatMoney(b.net)}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {data.allBets.length > 0 ? (
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Amounts in original currency · {month} filter applies to the monthly card only.
                  </p>
                </CardFooter>
              ) : null}
            </Card>

            <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pt-2 text-xs text-muted-foreground">
              <p>Roobet Tracker · private dashboard · data never leaves your database.</p>
              <p className="font-mono">UI: shadcn + Tailwind + 21st.dev patterns · OLED dark</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}
