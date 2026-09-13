import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subHours, subDays, startOfMonth, endOfMonth } from 'date-fns'

type BetRow = {
  id: string
  timestamp: Date
  gameType: string
  gameName: string | null
  stake: unknown
  payout: unknown
  multiplier: unknown
  currency: string
  status: string
  notes: string | null
  tags: string[]
}

function toNum(v: unknown): number {
  if (v === null || v === undefined) return 0
  // Prisma Decimal serialises with toString()
  const n = Number(v.toString())
  return Number.isFinite(n) ? n : 0
}

function summarize(bets: BetRow[]) {
  let totalStake = 0
  let totalPayout = 0
  let wins = 0
  for (const b of bets) {
    const stake = toNum(b.stake)
    const payout = toNum(b.payout)
    totalStake += stake
    totalPayout += payout
    if (payout > stake) wins++
  }
  const net = totalPayout - totalStake
  return {
    bets: bets.length,
    totalStake,
    totalPayout,
    net,
    roi: totalStake ? (net / totalStake) * 100 : 0,
    winRate: bets.length ? (wins / bets.length) * 100 : 0,
  }
}

function serializeBet(b: BetRow) {
  const stake = toNum(b.stake)
  const payout = toNum(b.payout)
  const multRaw = b.multiplier === null || b.multiplier === undefined ? null : toNum(b.multiplier)
  return {
    id: b.id,
    timestamp: b.timestamp,
    gameType: b.gameType,
    gameName: b.gameName,
    stake,
    payout,
    net: payout - stake,
    multiplier: multRaw,
    currency: b.currency,
    status: b.status,
    notes: b.notes,
    tags: b.tags,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month') // "2026-09"

  const now = new Date()
  const bets = (await prisma.bet.findMany({
    orderBy: { timestamp: 'desc' },
    take: 5000,
  })) as unknown as BetRow[]

  const last24h = bets.filter((b) => b.timestamp >= subHours(now, 24))
  const last7d = bets.filter((b) => b.timestamp >= subDays(now, 7))
  const last30d = bets.filter((b) => b.timestamp >= subDays(now, 30))

  let monthBets: BetRow[] = []
  let monthKey: string | null = null
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number)
    if (m >= 1 && m <= 12) {
      monthKey = monthParam
      const start = startOfMonth(new Date(y, m - 1))
      const end = endOfMonth(start)
      monthBets = bets.filter((b) => b.timestamp >= start && b.timestamp <= end)
    }
  }

  const dailyMap: Record<string, number> = {}
  for (const b of monthBets) {
    const day = b.timestamp.toISOString().slice(0, 10)
    dailyMap[day] = (dailyMap[day] || 0) + (toNum(b.payout) - toNum(b.stake))
  }
  const dailyPnL = Object.entries(dailyMap)
    .map(([date, pnl]) => ({ date, pnl }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const byGame: Record<string, { stake: number; payout: number; count: number }> = {}
  for (const b of last30d) {
    const g = byGame[b.gameType] || { stake: 0, payout: 0, count: 0 }
    g.stake += toNum(b.stake)
    g.payout += toNum(b.payout)
    g.count++
    byGame[b.gameType] = g
  }
  const gameBreakdown = Object.entries(byGame)
    .map(([game, v]) => ({
      game,
      count: v.count,
      roi: v.stake ? ((v.payout - v.stake) / v.stake) * 100 : 0,
      net: v.payout - v.stake,
    }))
    .sort((a, b) => b.count - a.count)

  const netOf = (b: BetRow) => toNum(b.payout) - toNum(b.stake)
  let bestBet: BetRow | null = null
  let worstBet: BetRow | null = null
  for (const b of monthBets) {
    if (!bestBet || netOf(b) > netOf(bestBet)) bestBet = b
    if (!worstBet || netOf(b) < netOf(worstBet)) worstBet = b
  }

  return NextResponse.json({
    last24h: summarize(last24h),
    last7d: summarize(last7d),
    last30d: summarize(last30d),
    month: monthKey
      ? {
          key: monthKey,
          ...summarize(monthBets),
          dailyPnL,
          bestBet: bestBet ? serializeBet(bestBet) : null,
          worstBet: worstBet ? serializeBet(worstBet) : null,
        }
      : null,
    gameBreakdown,
    allBets: bets.slice(0, 500).map(serializeBet),
  })
}
