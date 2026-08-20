# Phase 10 — Monetization & Deal-Flow (Subscriptions · Entitlements · Vault · Deal-Flow · Watchlist · Badges)

**Status:** ✅ Client done · ✅ server live
**Date:** 2026-07-15
**Repo(s):** academy-client (this doc) · academy-server (`subscription/`, `vault/`, `watchlist/`, `badge/` — see `academy-server/documentation/08-monetization-server.md`)
**Traces to:** PRD — FR-M1…M4, FR-DF1…DF3, FR-V1…V4, FR-S8, FR-S9, FR-S9a · Plan — §4 (B2B/VC layer), §6, §7 (Phase 5), §9 (billing) · Stories — STU-17, STU-18, SPN-12, SPN-13, SPN-14, SPN-15, SPN-16, ADM-07
**Commit/PR:** —

## Goal

Monetize the sponsor side without ever charging students: subscription tiers (Scout free / Alpha pro / Venture Partner) with entitlement-gated routes; a consent-gated Venture-Pitch Vault (Lumen-stored deck/financials/cap-table, time-bounded student-granted access); the deal-flow dashboard with saved-search go-live alerts and private watchlists; and additive Verified Builder badges.

The original plan gated this phase on a shared PayMongo billing pass and a §9 tier-pricing decision. Neither held: checking the plan's §4 body text (rather than just its stale §9 open-items list) showed the entitlement matrix, the vault revoke/time-bound policy, and the badge source were all already settled — only real peso pricing and dunning stayed open, both deferred to the eventual real-PayMongo pass.

Enterprise pieces (promoted placement, incubation campaigns, CRM/Notion/Airtable export) are out of v1 scope, untouched.

## What Was Built

1. **Subscription tiers — simulated checkout**
   - **File:** `src/lib/subscription/model.ts`, `src/lib/subscription/api.ts`, `src/lib/subscription/helper.ts`, `src/components/subscription/PlanTable.tsx`, `src/components/subscription/TierConfirmModal.tsx`, `src/components/subscription/SeatManager.tsx`, `src/routes/sponsor/subscription.tsx`
   - **Functions/Components:** `PlanKey`, `PLANS`, `hasEntitlement()`, `subscribeToTier()`
   - **Purpose:** The tier-subscribe entitlement matrix (Scout: browse/filter/express-interest; Alpha: vault-access-requests + saved-search alerts + private watchlists; Venture Partner: promoted placement/incubation/CRM export, later) was already answered in the plan's own prose and matched the template's seed data exactly — only real peso pricing stayed open. Clicking a paid tier opens `TierConfirmModal` — features + price, Authorize, a short "Redirecting to PayMongo…" pause, then the same `src/payments.ts` simulated module Phase 09 built, then a real `subscription` row. Free-tier switches and seat changes stay direct, no modal ceremony. `SeatManager` shows only the real billed seat quantity — there is no sponsor-org-member/invite system anywhere in this app to back a fabricated "N of M used" fraction, so that mockup detail was dropped rather than faked.
2. **Deal-flow feed**
   - **File:** `src/routes/sponsor/home.tsx`, `src/components/discover/DealFlowCard.tsx`, `src/components/discover/SponsorRail.tsx`
   - **Purpose:** The template's "feed of followed builders" turned out to be decorative flavor text over real project data, not a real social feature — the only list actually rendered is a sector-agnostic feed of the top trending published projects. Built as a real feed over Phase 08's trending data, same card shape, with the fabricated rotating captions dropped in favor of the project's own real pitch text. `SponsorRail`'s "Your subscriptions"/"Suggested to follow" panels stay mock deliberately — there's no follow relationship anywhere else in the app and no story asks for one — while go-live alerts, watchlist count, and the plan card in the same rail are real.
3. **Saved-search alert + watchlist**
   - **File:** `src/lib/saved-search/model.ts`, `src/lib/saved-search/api.ts`, `src/hooks/saved-search/useWatchlist.ts`
   - **Purpose:** The template has no "save a query" management UI anywhere — the only saved-search surface that exists is a single go-live-alerts on/off switch, modeled as `Subscription.alertsEnabled` (a sponsor-level preference), not a separate saved-search entity; the planned `saved-searches.tsx` route was dropped entirely. Watchlist is a real per-project boolean, Alpha+ gated, wired only on the deal-flow card (matching the template's actual usage — the Watch button never appears on the main Discover gallery).
4. **Venture-Pitch Vault**
   - **File:** `src/lib/vault/model.ts`, `src/lib/vault/api.ts`, `src/hooks/vault/useVault.ts`, `src/hooks/vault/useVaultAccess.ts`, `src/components/vault/VaultManager.tsx`, `src/components/vault/VaultAccessButton.tsx`, `src/routes/student/vaults.tsx`
   - **Purpose:** A vault is created implicitly by uploading its first document — there is no separate "set up a vault" action in the template. `VaultManager` shows one card per project the student owns, even with zero documents, with an Upload action. Access grants are time-bounded at 14 days (the template's own "Approve (14d)" copy, not a guess). `VaultAccessButton` needed a real document-viewing surface for an approved sponsor that wasn't in the original file list — added a `GET /projects/:id/vault-documents` sponsor-facing read, otherwise "approved" would have had nothing to actually open.
5. **Verified Builder badges**
   - **File:** `src/lib/badge/model.ts`, `src/lib/badge/api.ts`, `src/hooks/badge/useGrantBadge.ts`, `src/components/admin/BadgeGrantForm.tsx`, `src/routes/admin/dashboard.tsx`
   - **Purpose:** A fourth "Badges" tab on the existing admin console. Fixed two existing wrong stand-ins along the way: `ProjectDetailView` showed the badge whenever a project was merely published (a badge is a separate, admin-granted signal, not automatic from publishing), and the discover-teaser mapper hardcoded `verified: true` for every card. Added a real `verified: boolean` to the base `Project` type and rewired both call sites, plus the gallery card's missing inline checkmark. Badge evidence reuses the shared PDF/15MB upload constants — no new MIME category for images/screenshots yet.

## Decisions & Trade-offs

- **Entitlements gate at the API edge**, client gate is UX only — the client's `useEntitlement` only hides/disables controls, never the enforcer.
- **Vault docs in Lumen, signed-link access only, time-bounded grants** — the student controls the open door; personal contact is never auto-shared even after access.
- **Doc-drift correction:** some stories describe vault docs as "AES-256 at rest," but the PRD is authoritative — Lumen vault docs are immutable + activity-logged (no separate AES step); AES-256 applies to S3-stored sensitive media instead.
- **Badges are additive, never a gate** — ownership stays self-declared; the badge is a trust signal only, manually admin-granted in v1.
- **Bias-free discovery preserved** — paid promoted placement stays out of scope, and when built will render in separate labeled slots, never mixed into organic Trending/Top.

## Verification

- Tier-restricted routes (vault/alerts/watchlists) blocked without entitlement, server-enforced.
- Subscribe/seat-manage runs through the simulated checkout; status tracked; students never billed.
- Deal-flow feed reflects real trending data; Trending stays bias-free.
- Vault locked by default; sponsor access only via approved, time-bounded, revocable grant + signed links.
- Badge grant is admin-only, recorded with evidence, renders on card, gates nothing.
- `pnpm generate-routes`, `pnpm exec biome check`, `pnpm exec tsc --noEmit`, `pnpm build` — all clean. Zero new client packages.

## Open Items

- **Go-live alert emit has no defined trigger** — the toggle is a real, persisted preference, but nothing yet fires a notification when a matching project goes live, since there's no saved query to define "matching" against. Needs a product decision on trigger criteria before it can be built.
- **Sponsor "my funded grants"/"my watchlist as a page"** — no dedicated surface beyond the rail count, matching the Phase 09 precedent of deferring the equivalent funded-grants list.
- **Badge evidence MIME allow-list** — PDF-only for now; screenshots/images would need a widened allow-list.
- **Real-PayMongo pass** (deferred) will need to add a pending/async state to `TierConfirmModal`'s success flow, same as Phase 09's fund panel, once real capture is webhook-driven.
- **Enterprise pieces** (promoted placement, incubation campaigns, CRM export) — later, untouched.
