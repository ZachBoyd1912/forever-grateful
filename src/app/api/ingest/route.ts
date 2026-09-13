import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/prisma'
import { z } from 'zod'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://roobet.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

const BetSchema = z.object({
  externalId: z.string().min(1).max(128).optional(),
  timestamp: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: 'Invalid timestamp — must be ISO date string',
  }),
  gameType: z.string().min(1).max(64),
  gameName: z.string().max(256).optional(),
  stake: z.number().finite(),
  payout: z.number().finite(),
  currency: z.string().max(16).default('USD'),
  multiplier: z.number().finite().optional(),
  status: z.string().max(32).default('settled'),
  rawData: z.unknown().optional(),
})

type BetInput = z.infer<typeof BetSchema>

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

function withCors(res: NextResponse) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v)
  return res
}

export async function POST(req: NextRequest) {
  const prisma = getDb()
  const apiKey = req.headers.get('x-api-key')
  if (!process.env.BOOKMARKLET_API_KEY || apiKey !== process.env.BOOKMARKLET_API_KEY) {
    return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return withCors(NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }))
  }

  const bets = Array.isArray(body) ? body : [body]
  if (bets.length === 0) {
    return withCors(NextResponse.json({ received: 0, imported: 0, results: [] }))
  }
  if (bets.length > 2000) {
    return withCors(
      NextResponse.json({ error: 'Too many bets in one request (max 2000)' }, { status: 413 })
    )
  }

  const results: Array<Record<string, unknown>> = []
  let imported = 0

  for (const raw of bets) {
    const parsed = BetSchema.safeParse(raw)
    if (!parsed.success) {
      results.push({ ok: false, error: parsed.error.flatten(), raw })
      continue
    }
    const b: BetInput = parsed.data
    const timestamp = new Date(b.timestamp)
    try {
      if (b.externalId) {
        const bet = await prisma.bet.upsert({
          where: { externalId: b.externalId },
          update: {
            timestamp,
            gameType: b.gameType,
            gameName: b.gameName,
            stake: b.stake,
            payout: b.payout,
            currency: b.currency,
            multiplier: b.multiplier,
            status: b.status,
            rawData: b.rawData ?? undefined,
          },
          create: {
            externalId: b.externalId,
            timestamp,
            gameType: b.gameType,
            gameName: b.gameName,
            stake: b.stake,
            payout: b.payout,
            currency: b.currency,
            multiplier: b.multiplier,
            status: b.status,
            rawData: b.rawData ?? undefined,
          },
        })
        imported++
        results.push({ ok: true, id: bet.id, externalId: b.externalId })
      } else {
        // No stable ID — create a new row. Re-imports without IDs may
        // duplicate, which is why the bookmarklet should always send
        // externalId when Roobet exposes one.
        const bet = await prisma.bet.create({
          data: {
            timestamp,
            gameType: b.gameType,
            gameName: b.gameName,
            stake: b.stake,
            payout: b.payout,
            currency: b.currency,
            multiplier: b.multiplier,
            status: b.status,
            rawData: b.rawData ?? undefined,
          },
        })
        imported++
        results.push({ ok: true, id: bet.id })
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Database error'
      results.push({ ok: false, error: message, raw })
    }
  }

  return withCors(
    NextResponse.json({ received: bets.length, imported, failed: bets.length - imported, results })
  )
}
