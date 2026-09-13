'use client'
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

function formatMoney(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}`
}

function StatCard({ title, s }: { title: string; s: Summary }) {
  const color = s.net >= 0 ? 'text-green-400' : 'text-red-400'
  return (
    <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
      <div className="text-zinc-400 text-sm">{title}</div>
      <div className={`text-3xl font-bold ${color}`}>{formatMoney(s.net)}</div>
      <div className="text-zinc-500 text-xs mt-2 space-y-1">
        <div>ROI: {s.roi.toFixed(1)}%</div>
        <div>
          Bets: {s.bets} · Win rate: {s.winRate.toFixed(1)}%
        </div>
        <div>Wagered: {s.totalStake.toFixed(2)}</div>
      </div>
    </div>
  )
}

function BetHighlight({
  label,
  bet,
}: {
  label: string
  bet: BetView | null
}) {
  if (!bet) {
    return (
      <div className="text-zinc-500 text-sm">
        {label}: — (no bets this month)
      </div>
    )
  }
  const color = bet.net >= 0 ? 'text-green-400' : 'text-red-400'
  return (
    <div className="text-sm">
      <span className="text-zinc-400">{label}: </span>
      <span className={`font-semibold ${color}`}>{formatMoney(bet.net)}</span>
      <span className="text-zinc-500">
        {' '}
        · {bet.gameName || bet.gameType} · {new Date(bet.timestamp).toLocaleString()}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))

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

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Roobet Tracker</h1>
        <div className="bg-red-950 border border-red-800 rounded-xl p-5">
          <div className="font-semibold">Couldn&apos;t load dashboard</div>
          <div className="text-sm text-red-300 mt-1">{error}</div>
          <div className="text-sm text-zinc-400 mt-3">
            Is DATABASE_URL set and migrated? Check /api/stats directly for details.
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return <div className="min-h-screen bg-black text-white p-10">Loading…</div>
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Roobet Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Last 24 hours" s={data.last24h} />
        <StatCard title="Last 7 days" s={data.last7d} />
        <StatCard title="Last 30 days" s={data.last30d} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="month" className="text-zinc-400 text-sm">
          Month
        </label>
        <input
          id="month"
          type="month"
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1"
        />
      </div>

      {data.month ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-zinc-400 text-xs">Net P&L</div>
              <div
                className={`text-2xl font-bold ${
                  data.month.net >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatMoney(data.month.net)}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs">ROI</div>
              <div className="text-2xl font-bold">{data.month.roi.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs">Bets</div>
              <div className="text-2xl font-bold">{data.month.bets}</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs">Win rate</div>
              <div className="text-2xl font-bold">{data.month.winRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <BetHighlight label="Best bet" bet={data.month.bestBet} />
            <BetHighlight label="Worst bet" bet={data.month.worstBet} />
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.month.dailyPnL}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a' }}
                />
                <Bar dataKey="pnl">
                  {data.month.dailyPnL.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8 text-zinc-400 text-sm">
          No monthly data for {month}.
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-xl font-semibold mb-4">ROI by Game Type (30 days)</h2>
        {data.gameBreakdown.length === 0 ? (
          <div className="text-zinc-500 text-sm">No bets in the last 30 days.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.gameBreakdown}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="game" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a' }}
                />
                <Bar dataKey="roi">
                  {data.gameBreakdown.map((g, i) => (
                    <Cell key={i} fill={g.roi >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Recent Bets</h2>
        {data.allBets.length === 0 ? (
          <div className="text-zinc-500 text-sm">
            No bets yet. Click your bookmarklet on Roobet&apos;s history page to import.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Game</th>
                  <th className="text-right py-2">Stake</th>
                  <th className="text-right py-2">Payout</th>
                  <th className="text-right py-2">Net</th>
                </tr>
              </thead>
              <tbody>
                {data.allBets.slice(0, 50).map((b) => (
                  <tr key={b.id} className="border-b border-zinc-800/50">
                    <td className="py-2">{new Date(b.timestamp).toLocaleString()}</td>
                    <td className="py-2">{b.gameName || b.gameType}</td>
                    <td className="py-2 text-right">{b.stake.toFixed(2)}</td>
                    <td className="py-2 text-right">{b.payout.toFixed(2)}</td>
                    <td
                      className={`py-2 text-right ${
                        b.net >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatMoney(b.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
