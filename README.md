# Roobet Tracker

Private gambling P&L tracker — bookmarklet ingest + monthly ROI dashboard.
Next.js App Router + PostgreSQL + Prisma 6 + Tailwind v4 + Recharts. Deployed to `private.forevergrateful.ie`.

## Retention answer (short)

Roobet does not publicly state a bet-history retention period. Their Trustpilot replies confirm history exists but give no window, and a 500k-bet player reported struggling to get full history from support. Treat Roobet's page as a **limited rolling window** — click the bookmarklet weekly. Your database is the permanent record.

## Quick start (macOS)

```bash
cp .env.example .env
# edit .env: DATABASE_URL, BOOKMARKLET_API_KEY, BASIC_USER, BASIC_PASS

pnpm install
pnpm exec prisma migrate dev --name init
pnpm dev
```

Open http://localhost:3000

## Quick start (Windows)

```powershell
# 1. Install Node 22 LTS from nodejs.org, then enable pnpm:
corepack enable
corepack prepare pnpm@10.33.2 --activate

# 2. In PowerShell (same folder):
Copy-Item .env.example .env
# edit .env in Notepad with your values (same DATABASE_URL works on both machines)

pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
pnpm dev
```

Notes for two-machine use:
- Same `DATABASE_URL` on both machines is fine — it's one shared Supabase database.
- Never commit `.env` (it's gitignored). Copy values to the Windows machine by hand.
- Use the same Node major on both (see `.nvmrc`, Node 22). `packageManager: pnpm@10.33.2` is pinned.
- Line endings are normalized to LF via `.gitattributes`, so Git on Windows won't create noise.

## Database URL (Supabase)

- This project needs **Postgres** (Prisma `provider = "postgresql"`).
  Firebase Firestore / Realtime Database URLs do **not** work here.
- In Supabase: Project Settings → Database → Connection string:
  - `migrate dev` needs the **Direct** string (port `5432`).
  - The Vercel app can use the **Pooled** string (port `6543` + `?pgbouncer=true`).
- If `migrate` fails with `P1001: Can't reach database server`, re-copy the
  Direct string — the hostname must resolve (test: `nslookup <host>`).

## How it works

1. **Bookmarklet** (`bookmarklet.js`) runs on roobet.com history page, scrapes visible rows, POSTs JSON to `/api/ingest` with `x-api-key`.
2. **Ingest API** validates with Zod, upserts by `externalId` (or creates when no ID).
3. **Stats API** (`/api/stats?month=YYYY-MM`) returns 24h / 7d / 30d summaries, daily P&L, game ROI, recent bets.
4. **Dashboard** (`src/app/page.tsx`) renders StatCards, BarCharts, bets table.
5. **Middleware** (`src/middleware.ts`) Basic-Auth protects everything except `/api/ingest`.

## Bookmarklet setup

1. Edit `bookmarklet.js`: set `API_URL` + `API_KEY`.
2. Inspect Roobet history DOM (F12), update `ROW_SELECTOR` + `CELLS`.
3. Minify, prefix `javascript:`, save as bookmark "Import Roobet Bets".
4. Click weekly on the history page.

## Deploy (Vercel)

1. Push to GitHub, import in Vercel.
2. Env vars: `DATABASE_URL` (Neon/Supabase), `BOOKMARKLET_API_KEY`, `BASIC_USER`, `BASIC_PASS`.
3. Domains → add `private.forevergrateful.ie`.
4. DNS: CNAME `private` → `cname.vercel-dns.com`.
5. `npx prisma migrate deploy` against prod DB (via `DATABASE_URL`).

## Scripts

- `pnpm dev` — dev server
- `pnpm typecheck` — `tsc --noEmit` (primary verification, never run `pnpm build` on 8GB machine)
- `pnpm lint` — eslint, must be zero errors
