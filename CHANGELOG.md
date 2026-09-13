# Changelog

## 13/09/2026 @ 04:44:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** First successful deploy to Cloudflare Workers.

**Changed:**
- CI run `34736267452` (re-run): **Typecheck + Lint ✅, Build + Deploy ✅** — live at `https://roobet-tracker.zboyd712.workers.dev`. Unblocked by the `CF_API_TOKEN`/`CF_ACCOUNT_ID` secret remap + fresh token. `/api/stats` currently returns `Auth not configured` (expected — worker secrets not set yet).

**Files Touched:** none (CI re-run of `ece0bcc`) — remaining work is secrets + domain, see blockers list.

## 13/09/2026 @ 04:40:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** Fix OpenNext esbuild failure `Could not resolve "pg-cloudflare"` (second attempt; installing the package wasn't enough).

**Fixed:**
- `next.config.ts`: added `pg` + `pg-cloudflare` to `serverExternalPackages`. Cause: `pg/lib/stream.js` lazily `require('pg-cloudflare')`s for Workers sockets; OpenNext's static bundling can't resolve it in the pruned `.open-next` tree even when installed (verified package files exist locally — pure tracing gap). Externals are traced as runtime requires instead. Verification: typecheck + lint clean; real proof is the CI OpenNext build.

**Files Touched:** `next.config.ts`, `CHANGELOG.md`

## 13/09/2026 @ 04:36:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** Fix OpenNext bundling failure on `pg`.

**Fixed:**
- Added `pg-cloudflare@1.4.0` dependency. Cause: CI deploy failed in esbuild with `Could not resolve "pg-cloudflare"` from `pg/lib/stream.js` — `pg@8.23` requires that package for Workers runtimes and it wasn't installed. Verification: typecheck + lint clean; real proof is the CI OpenNext build (pushed, watching).

**Files Touched:** `package.json`, `pnpm-lock.yaml`, `CHANGELOG.md`

## 13/09/2026 @ 04:33:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** Point CI at the repo's existing Cloudflare secret names.

**Changed:**
- `.github/workflows/deploy-cloudflare.yml`: `secrets.CLOUDFLARE_API_TOKEN` → `secrets.CF_API_TOKEN`, `secrets.CLOUDFLARE_ACCOUNT_ID` → `secrets.CF_ACCOUNT_ID` (env names exposed to wrangler unchanged). Cause: repo secrets already exist as `CF_*`; workflow referenced names that evaluated `null`. Verification: lint clean; pushed, CI re-runs automatically.

**Files Touched:** `.github/workflows/deploy-cloudflare.yml`, `CHANGELOG.md`

## 13/09/2026 @ 04:31:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** Fix CI deploy step failing with `ERR_PNPM_NOTHING_TO_DEPLOY`.

**Fixed:**
- `.github/workflows/deploy-cloudflare.yml`: `pnpm deploy` → `pnpm run deploy`. Cause: bare `pnpm deploy` invokes pnpm's builtin package-deploy command instead of the `deploy` script in `package.json`, so nothing ran (exit 1). Verification: lint clean; CI re-runs on push. Note: deploy will still fail until the `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo secrets are added (both evaluated `null` in run `34735574175`) — that's a manual step.

**Files Touched:** `.github/workflows/deploy-cloudflare.yml`, `CHANGELOG.md`

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
