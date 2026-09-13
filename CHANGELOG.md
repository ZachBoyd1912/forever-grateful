# Changelog

## 13/09/2026 @ 04:28:18 IST — "muse-spark-1.3-contributor-free"

**Goal:** Fix CI verify failure so the Cloudflare deploy pipeline goes green.

**Fixed:**
- `src/app/layout.tsx`: replaced Next-generated `LayoutProps<"/">` with plain `{ children: React.ReactNode }`. Cause: first CI run failed with `TS2304: Cannot find name 'LayoutProps'` — that type only exists after a local `.next/` typegen, which a fresh CI runner never has. Fix removes the dependency entirely. Verification: `pnpm typecheck` clean.
- `.github/workflows/deploy-cloudflare.yml`: added `pnpm exec prisma generate` before typecheck in the verify job. Cause: CI failed with `Module '"@prisma/client"' has no exported member 'PrismaClient'` — fresh installs don't run Prisma's codegen (build scripts are skipped). Verification: typecheck + lint clean locally; CI re-runs on push.

**Files Touched:** `src/app/layout.tsx`, `.github/workflows/deploy-cloudflare.yml`, `CHANGELOG.md`

## 13/09/2026 @ 04:23:33 IST — "muse-spark-1.3-contributor-free"

**Goal:** Host the tracker on Cloudflare Workers (not Vercel) under `private.forevergrateful.ie`, keeping all other domains untouched.

**Added:**
- Cloudflare Workers deployment via `@opennextjs/cloudflare` + `wrangler` (`open-next.config.ts`, `wrangler.jsonc` with `nodejs_compat`, `.dev.vars.example`). Cause: README targeted Vercel but the account hosts DNS on Cloudflare with no Vercel usage. Fix: OpenNext Workers adapter (current path; `next-on-pages` deprecated). Verification: `pnpm typecheck` + `pnpm lint` clean; heavy `opennext build` intentionally deferred to CI per 8GB-machine rule.
- Per-request Prisma client (`src/lib/prisma.ts` → `getDb()` with `PrismaPg` adapter, `maxUses: 1`, Cloudflare-env-first connection string; `ingest`/`stats` routes switched to it). Cause: global singleton would exhaust Supabase connections on Workers isolates. Verification: typecheck + lint clean.
- `serverExternalPackages` for `@prisma/client` in `next.config.ts` (required for OpenNext patching). Verification: typecheck clean.
- CI workflow (`.github/workflows/deploy-cloudflare.yml`): typecheck + lint gate, then OpenNext build + `wrangler deploy` on pushes to `roobet-tracker`. Cause: 8GB machine must never run `next build` locally. Verification: YAML added; first run happens on push.

**Fixed:**
- `bookmarklet.js` ingest URL `https://www.private.forevergrateful.ie` → `https://private.forevergrateful.ie` (extra `www.` didn't match the planned `private` CNAME). Verification: lint clean.

**Changed:**
- Remote `origin` set to `github.com:ZachBoyd1912/forever-grateful.git`; work ships on branch `roobet-tracker` so `origin/main` (photo upload) stays untouched.
- `.gitignore`: added `.dev.vars`, `.open-next/`, `.wrangler/`.

**Known blockers (manual follow-ups):** Supabase Direct DB auth fails (`P1000` — re-copy password into local `.env`); GitHub repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` needed before first CI deploy; Worker secrets (`DATABASE_URL` pooled `6543`, `BOOKMARKLET_API_KEY`, `BASIC_USER`, `BASIC_PASS`) via `wrangler secret put`; custom domain attach in Workers → Custom Domains; Roobet DOM selector tuning in bookmarklet.

**Files Touched:** `bookmarklet.js`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `src/lib/prisma.ts`, `src/app/api/ingest/route.ts`, `src/app/api/stats/route.ts`, `.gitignore`, `open-next.config.ts` (new), `wrangler.jsonc` (new), `.dev.vars.example` (new), `.github/workflows/deploy-cloudflare.yml` (new), `CHANGELOG.md` (new)
