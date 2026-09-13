# Changelog

## 13/09/2026 @ 17:52:52 IST — "opencode/muse-spark-1.3-contributor-free"

**Goal:** Friend handout — full setup walkthrough PDF with flow diagrams.

**Added:**
- `Roobet-Tracker-Friend-Guide.pdf` (11 pages, reportlab): cover + milestones, system overview diagram, sites/accounts map, Parts A-G (clone `-b roobet-tracker`, Node/pnpm Mac+Windows, own Supabase project with Direct 5432 URL, 4-var `.env`, migrate+run+login, bookmarklet configure/adapt/install, dashboard tour), weekly-habit rule, troubleshooting table, house rules, final checklist; Figures 1-3 flow diagrams. Cause: friend needs code + laptop run + Roobet sites in one handout. Verification: pypdf 11 pages + all key phrases present; rendered diagram pages visually checked.

**Files Touched:** `Roobet-Tracker-Friend-Guide.pdf`, `CHANGELOG.md`

## 13/09/2026 @ 05:49:53 IST — "opencode/muse-spark-1.3-contributor-free"

**Goal:** Visual pass at 375/768/1024/1440px + console + Lighthouse; fix all findings.

**Fixed:**
- Sidebar group headings `text-muted-foreground/50` → solid `text-muted-foreground`. Cause: Lighthouse `color-contrast` fail (2 nodes). Verification: re-audit Accessibility 97→100.
- Import CTA `bg-primary/white` (≈3.7:1) → `bg-[#2563eb] hover:bg-[#1d4ed8]` white text (≈5.2:1); workspace avatar same swap. Cause: Lighthouse `color-contrast` fail on header CTA. Same blue family, 21st shape kept. Verification: re-audit 0 contrast failures.
- Mobile drawer ignored Escape → added `keydown` closer (active only when open) with focus already on toggle. Cause: manual keyboard test (backdrop click worked, Escape didn't). Verification: open drawer → Escape → drawer gone from a11y tree, focus back on toggle.
- `llms.txt` had no links → rewrote Pages section with markdown links to `/#overview|month|games|roi|recent|import`. Cause: Lighthouse `llms-txt` fail ("no links"). Verification: re-audit Agentic 50→100.
- Console `label for` issue investigated: both labels (`month-top`, `month`) resolve to real inputs with correct accessible names (verified via DOM query + snapshot) — Chromium false positive on `type=month` shadow DOM. No change.

**Verified (no changes):** 375 (toggle+drawer+tablist OK), 768 (drawer overlays, Import visible ≥640 OK), 1024/1440 (desktop rail + hero + cards + bento OK); `pnpm typecheck` + `pnpm lint` clean; final Lighthouse 38/38 — A11y 100, Best Practices 100, SEO 100, Agentic 100. Zero-state (0 bets) renders correctly; populated-state sort/TableFooter logic unchanged. Dev-only notes: floating "N" in screenshots is the Next.js DevTools button, not app UI; visual pass used auth-bypassed local dev (empty BASIC_USER/PASS, dev-only, no code change).

**Files Touched:** `src/app/page.tsx`, `src/components/ui/sidebar-nav.tsx`, `src/middleware.ts`, `public/llms.txt`, `CHANGELOG.md`

## 13/09/2026 @ 05:35:54 IST — "opencode/muse-spark-1.3-contributor-free"

**Goal:** Config 21st.dev MCP (fix auth headers) + rescan entire site via MCP + adapt top-2 components with zero new deps.

**Fixed:**
- `~/.config/opencode/opencode.jsonc`: `21st-dev-mcp` used `environment.X_API_KEY` (remote MCP ignores it) → `headers.x-api-key` + `oauth:false`. Cause: opencode remote MCP requires `headers`, not `environment`; tools never loaded. Fix verified via MCP `initialize` 200 (21st v0.1.1) + `tools/list` 34 tools + `get_usage` free 2/2. Verification: curl MCP POST clean.
- `src/components/ui/table.tsx` lint warning `aria-sort on button` → moved `aria-sort` to `TableHead` (columnheader), `SortButton` uses `aria-label` only. Cause: jsx-a11y role-supports-aria-props. Verification: `pnpm lint` clean.

**Added:**
- `src/components/ui/sidebar-nav.tsx` (new): adapted from 21st MCP `get_component [14941] Dashboard Sidebar` by arunjdass (WorkspaceSwitcher, collapsible NavItem w/ grid-rows animation, breadcrumb header pattern). Adapted to inline SVG icons (no lucide-react dep), Roobet anchors (#overview/#month/#games/#recent/#roi/#import), button+aria-expanded/aria-current, OLED tokens. Cause: prior shell was topbar-only, no sidebar rail. Verification: typecheck/lint clean.
- `src/app/page.tsx`: sidebar rail (desktop sticky) + drawer (mobile toggle w/ IconPanel) + workspace in subtitle, sortable Recent bets (time/stake/payout/net via SortButton, aria-sort on th), TableFooter totals, new anchors `#roi`/`#import`. Cause: 21st rescan gaps (shell + table). Verification: typecheck/lint clean; visual QA still needs `pnpm dev` 375/768/1024/1440px.
- 21st MCP rescan (all via `tools/call search`, free): shell→14941/19070/19009, metric→26138/4245/7461, bento→9758/25311/9658, chart→3090/2366/10123, table→89/1050/4794, theme→none (kept OLED). Quota spent 2/2 retrieving 14941+1050; AI generation disabled so manual adapt. Verification: `/tmp/21st_rescan/*.json` saved.

**Changed:**
- `src/components/ui/table.tsx`: added `TableFooter` (1050 canonical) + `SortButton` (ArrowUpDown demo pattern, no TanStack dep to keep bundle lean for 50 rows). Cause: align to 21st [1050] without new deps. Verification: typecheck/lint clean.

**Files Touched:** `src/components/ui/sidebar-nav.tsx`, `src/app/page.tsx`, `src/components/ui/table.tsx`, `CHANGELOG.md` (+ `~/.config/opencode/opencode.jsonc` outside repo)

## 13/09/2026 @ 05:15:57 IST — "opencode/muse-spark-1.3-contributor-free"

**Goal:** Rebuild dashboard UI top-to-bottom from sourced patterns only (design-critique + ui-ux-pro-max + Context7 shadcn/Tailwind + 21st.dev; VGPU honestly excluded).

**Added:**
- Sourced component library under `src/components/ui/`: `card.tsx` (shadcn Card composition), `badge.tsx` (shadcn Badge custom dark colors + dot+text P&L badge), `table.tsx` (shadcn Table composition with caption/scope), `feedback.tsx` (shadcn SkeletonTable + EmptyMuted), `chart.tsx` (shadcn ChartContainer/chartConfig + BarChart-with-Legend pattern on recharts only). Cause: prior UI was hand-built zinc divs with no tokens. Verification: `pnpm typecheck` + `pnpm lint` clean.
- Full dashboard shell: sticky 21st-style topbar (logo, live badge, month picker, Import CTA) + shadcn Tabs tablist (Overview/Month/Games/Recent) + 30-day headline hero + metric-card grid + Analytics-Bento month/games split + ROI chart + Recent-bets table + footer. Cause: design-critique must-fix (no hierarchy, blank loading, raw input, color-only P&L, caption-less table). Verification: typecheck/lint clean; visual QA still needs `pnpm dev` + 375/768/1024/1440px pass.

**Changed:**
- `globals.css`: OLED dark tokens (Primary #3B82F6 / Secondary #60A5FA / CTA #F97316), sidebar tokens, radial-gradient wash, focus-visible ring, reduced-motion guard, thin scrollbars. `layout.tsx`: Fira Sans + Fira Code via next/font, `dark` class, viewport/themeColor. Cause: ui-ux-pro-max design-system output for fintech dark analytics. Verification: typecheck/lint clean.
- Honesty notes: VGPU corpus contains only WebGPU infra (`/guides`, `/vgpu/*`) — zero dashboard UI found, so no UI sourced from VGPU. 21st.dev has no MCP server in this env (only agentmemory/chrome-devtools/cloudflare/context7/instagram/supabase/vgpu); 21st patterns pulled via web docs (dashboard-parts blog + shell/cards/bento writeups) instead of MCP.

**Files Touched:** `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/table.tsx`, `src/components/ui/feedback.tsx`, `src/components/ui/chart.tsx`, `CHANGELOG.md`

## 13/09/2026 @ 04:50:00 IST — "muse-spark-1.3-contributor-free"

**Goal:** Record end-to-end proof of the live deployment.

**Changed:**
- Verified live at `https://roobet-tracker.zboyd712.workers.dev`: Basic Auth challenge works, dashboard renders, `/api/stats` returns clean zero-state (no bets). This proves the full chain — Workers runtime + per-request `PrismaPg` client + Supabase pooled `6543` connection all work in production. Worker secrets (`DATABASE_URL`, `BOOKMARKLET_API_KEY`, `BASIC_USER`, `BASIC_PASS`) confirmed live. Remaining: custom domain attach + bookmarklet first import (user-side).

**Files Touched:** `CHANGELOG.md`

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
