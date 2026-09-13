import { cache } from 'react'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function getConnectionString(): string {
  // On Cloudflare Workers, secrets arrive as env bindings — prefer those
  // when running inside a request scope, fall back to process.env locally.
  try {
    // Lazy require so `next dev` (plain Node) never loads the Workers shim.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare') as typeof import('@opennextjs/cloudflare')
    const ctx = getCloudflareContext()
    const url = (ctx.env as Record<string, string | undefined>).DATABASE_URL
    if (url) return url
  } catch {
    // Not in a Workers request scope — use process.env below.
  }
  return process.env.DATABASE_URL ?? ''
}

// Per-request client. Workers isolates can't share pooled TCP connections,
// so never hoist this into a global singleton in production. `cache()` dedupes
// within one request (server components); route handlers get a fresh client
// per call and the pg pool is single-use (maxUses: 1).
export const getDb = cache(() => {
  const connectionString = getConnectionString()
  const adapter = new PrismaPg({ connectionString, maxUses: 1 })
  return new PrismaClient({ adapter })
})

// Local-dev convenience only (long-lived Node process with its own pool).
// Route handlers MUST use getDb() so Workers deployments stay per-request.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createDevClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createDevClient())
