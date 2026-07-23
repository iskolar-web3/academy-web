# Phase P5 — Monetization & Deal-Flow (Subscriptions · Entitlements · Vault · Deal-Flow · Saved Search · Watchlist · Badges)

**Status:** ✅ Client done (2026-07-15) · ✅ server live (2026-07-15) — DB v9, 67/67 in-process
**Target:** after P4 (shared `src/payments.ts`); **no §9 billing decision was needed** — see the roadmap revision below
**Repo(s):** academy-client (this doc) · academy-server (`subscription/`, `vault/`, `watchlist/`, `badge/`)
**Traces to:** PRD — FR-M1…M4, FR-DF1…DF3, FR-V1…V4, FR-S8, FR-S9, FR-S9a · Plan — §4 (B2B/VC layer), §6, §7 (Phase 5), §9 (billing) · Stories — STU-17, STU-18, SPN-12, SPN-13, SPN-14, SPN-15, SPN-16, ADM-07

> **Roadmap revision (2026-07-15):** this doc's original gate ("after P4 (shared PayMongo
> billing) + §9 billing decisions") no longer applies. Per
> `academy-client/documentation/phases/next-steps-lumen-p4-p5.md`'s 2026-07-15 correction:
> checking `documents/iskolar-academy-plan.md`'s §4 body text (not just its §9 numbered
> "open items" list, which had drifted stale) showed the entitlement matrix, the vault
> revoke/time-bound policy, and the badge source were **all already settled** — only real
> peso pricing (§9.12) and dunning (§9.13) stay open, both deferred to the eventual
> PayMongo pass. See "Realized Build — Client" below for what shipped and every place the
> template or the plan corrected this doc's original assumptions.

> Enterprise pieces (promoted placement, incubation campaigns, CRM/Notion/Airtable export — FR-M4) are 🔸 **Could / later**, out of v1 P5.

## Goal

Monetize the sponsor side without ever charging students: subscription tiers (Scout free / Alpha pro / Venture Partner) with entitlement-gated routes; a consent-gated Venture-Pitch Vault (Lumen-stored deck/financials/cap-table, time-bounded student-granted access); the deal-flow dashboard with saved-search go-live alerts and private watchlists; and additive Verified Builder badges.

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| SPN-12 | Manage subscription | `_sponsor/billing` |
| SPN-13 | Deal-flow dashboard | `_sponsor/deal-flow` |
| SPN-14 | Saved searches & alerts | `_sponsor/saved-searches` |
| SPN-15 | Watchlists | `_sponsor/watchlist` |
| SPN-16 | Request vault access | card action |
| STU-17 | Set up Venture-Pitch Vault | `_student/projects/$id/vault` |
| STU-18 | Respond to vault access | notification + grant decision |
| ADM-07 | Verified Builder badge | `_admin/badges` |

## Planned Build (by FE slice)

### `subscription` slice (entitlements)
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/subscription/api.ts` | lib | **Create** | `getPlansQuery()`, `getMySubscriptionQuery()`, `subscribe()`, `manageSeats()`, `cancel()` — PayMongo recurring billing. |
| `src/lib/subscription/model.ts` | lib | **Create** | `PlanKey` (scout\|alpha\|venture_partner), `Entitlement` keys, subscription status enum, Zod. |
| `src/lib/subscription/helper.ts` | lib | **Create** | Pure `hasEntitlement(subscription, key)` for client-side gating mirrors. |
| `src/hooks/subscription/useMySubscription.ts` | hook | **Create** | Active plan + entitlements (SPN-12). |
| `src/hooks/subscription/useEntitlement.ts` | hook | **Create** | Client-side gate helper (UX; server `requireEntitlement()` is the enforcer). |

### `vault` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/vault/api.ts` | lib | **Create** | `getProjectVaultQuery(projectId)`, `createVault()`, `uploadVaultDoc()` (Lumen `vault/`), `requestAccess()`, `decideAccess()` (approve time-bounded\|deny\|revoke), `getSignedDocUrl()`. |
| `src/lib/vault/model.ts` | lib | **Create** | `VaultDocument` (deck\|financials\|cap_table\|other), `VaultAccessGrant` status enum, Zod. |
| `src/hooks/vault/useVault.ts` | hook | **Create** | Owner vault management (STU-17). |
| `src/hooks/vault/useVaultAccess.ts` | hook | **Create** | Request (sponsor, SPN-16) + decide (student, STU-18). |

### `saved-search` slice (deal-flow + watchlist)
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/saved-search/api.ts` | lib | **Create** | `getSavedSearchesQuery()`, `saveSearch()`, `deleteSearch()`, watchlist `addWatch()`/`removeWatch()`/`getWatchlistQuery()`. |
| `src/lib/saved-search/model.ts` | lib | **Create** | Saved-search query (jsonb: tech/sector/region/type) + watchlist types + Zod. |
| `src/hooks/saved-search/useSavedSearches.ts` | hook | **Create** | List + manage (SPN-14). |
| `src/hooks/saved-search/useWatchlist.ts` | hook | **Create** | Private watchlist (SPN-15). |
| `src/hooks/discover/useDealFlow.ts` | hook | **Create** | Multi-column board over published projects (SPN-13). |

### `badge` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/badge/api.ts` | lib | **Create** | `grantBadge(projectId, kind, evidenceUrl)` (admin) — records Lumen credential file. |
| `src/lib/badge/model.ts` | lib | **Create** | `BadgeKind` (verified_deploy\|hackathon\|capstone\|repo_signal) + Zod. |
| `src/hooks/badge/useGrantBadge.ts` | hook | **Create** | Admin grant mutation (ADM-07). |

### Routes
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_sponsor/billing.tsx` | route | **Create** | Tiers + seats + status (SPN-12). |
| `src/routes/_sponsor/deal-flow.tsx` | route | **Create** | Entitlement-gated dashboard (SPN-13). |
| `src/routes/_sponsor/saved-searches.tsx` | route | **Create** | Saved searches + alerts (SPN-14). |
| `src/routes/_sponsor/watchlist.tsx` | route | **Create** | Private watchlist (SPN-15). |
| `src/routes/_student/projects/$projectId/vault.tsx` | route | **Create** | Owner vault management (STU-17). |
| `src/routes/_admin/badges.tsx` | route | **Create** | Grant Verified Builder badges (ADM-07). |
| `src/routeTree.gen.ts` | generated | **Affect** | `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/subscription/PlanTable.tsx` | component | **Create** | Tier comparison + subscribe (SPN-12). |
| `src/components/subscription/SeatManager.tsx` | component | **Create** | Seat add/remove. |
| `src/components/discover/DealFlowBoard.tsx` | component | **Create** | Multi-column board by stack/sector/region (SPN-13). |
| `src/components/saved-search/SavedSearchForm.tsx` | component | **Create** | Save a deal-flow query + alert toggle (SPN-14). |
| `src/components/saved-search/WatchlistButton.tsx` | component | **Create** | Private watch toggle on a card (SPN-15). |
| `src/components/vault/VaultManager.tsx` | component | **Create** | Upload/list vault docs; access-grant table (STU-17/18). |
| `src/components/vault/VaultAccessButton.tsx` | component | **Create** | Sponsor request-access on a card (SPN-16). |
| `src/components/project/ProjectCard.tsx` | component | **Affect** | Add Verified Builder badge + vault-access entry points; gate by entitlement. |
| `src/components/admin/BadgeGrantForm.tsx` | component | **Create** | Admin badge grant w/ evidence (ADM-07). |

### Server (academy-server — cross-reference)
`subscription/` (catalog + plan + seats + billing; resolves entitlements for `auth.ts`), `vault/` (Lumen `vault/` docs + access grants + signed links), `saved-search/` (queries + alerts + watchlists), `badge/` (Lumen `credentials/`); `auth.ts` gains `requireEntitlement()`; migrations for `subscription_plan`, `subscription`, `project_vault`, `vault_document`, `vault_access_grant`, `saved_search`, `watchlist_item`, `verification_badge`.

## Implementation Process (ordered)

1. **Resolve §9.12 tier pricing/seats/entitlements + §9.13 dunning, §9.14 vault access policy.**
2. `subscription` slice + `requireEntitlement()` (server) + billing UI (SPN-12) on shared `payments.ts`.
3. Deal-flow dashboard, entitlement-gated (SPN-13); reuses P3 discover data.
4. Saved searches + go-live alerts (SPN-14, emits `saved_search_alert`); watchlists (SPN-15).
5. Vault: owner setup + Lumen `vault/` upload (STU-17); sponsor request (SPN-16) → student decide, time-bounded (STU-18); signed-link reads; `vault_access_*` notifications.
6. Verified Builder badges (ADM-07) → Lumen `credentials/`; render on card.
7. `pnpm generate-routes`, `pnpm check`.

## Decisions & Trade-offs

- **Entitlements gate at the API edge (`requireEntitlement()`), client gate is UX only** (FR-S8) — never trust the client; `useEntitlement` only hides/disables controls.
- **Vault docs in Lumen, signed-link access only, time-bounded grants** (FR-S9) — student controls the open door; personal contact never auto-shared even after access (FR-V3/STU-18).
- **Doc-drift correction:** stories PLT-05 AC#4 & STU-17 AC#2 say vault docs are "AES-256 at rest"; **PRD FR-S9a is authoritative** — Lumen vault docs are immutable + activity-logged (no separate AES step); **AES-256 applies to S3-stored sensitive media**. Build to FR-S9a.
- **Badges are additive, never a gate** (FR-V4/ADM-07) — ownership stays self-declared; badge is a trust signal only; manual admin grant in v1, automated deploy-ping later (§9.15).
- **Bias-free discovery preserved** — paid promoted placement (FR-M4) stays 🔸 later and, when built, renders in separate labeled slots, never mixed into organic Trending/Top.

## Dependencies & Open Items

- **Depends on:** P4 (shared `src/payments.ts`), P3 (discover data for deal-flow/watchlist), P1 (projects to attach vaults/badges to).
- ~~**Gating:** §9.12 pricing/seats/entitlements, §9.13 dunning, §9.14 vault policy (duration/revoke/watermark), §9.15 badge source.~~ **Superseded (2026-07-15):** only §9.12's real pricing and §9.13 dunning remain open, both deferred to the PayMongo pass — see the roadmap revision at the top of this doc and "Realized Build" below.
- **Out of v1:** FR-M4 enterprise (promoted placement, incubation campaigns, CRM export) — 🔸 later.

## Verification Plan

- Tier-restricted routes (vault/alerts/watchlists/exports) blocked without entitlement, server-enforced (FR-S8/SPN-12).
- Subscribe/seat-manage bills via PayMongo; status tracked; every charge in the ledger; students never billed (SPN-12).
- Deal-flow board sliceable by stack/sector/region, Alpha+ gated; Trending stays bias-free (SPN-13).
- Saved search fires `saved_search_alert` on a matching go-live; watchlist invisible to students (SPN-14/15).
- Vault locked by default; sponsor access only via approved, time-bounded, revocable grant + signed links; access logged in Lumen (STU-17/18, SPN-16).
- Badge grant is admin-only, recorded with evidence + as a Lumen credential, renders on card, gates nothing (ADM-07).
- `pnpm check` clean.

## Realized Build — Client (2026-07-15)

Built to the plan above, **with corrections found during the reference pass** (design-
template SPONSOR DEAL-FLOW §~813, SUBSCRIPTION & BILLING §~1443, STUDENT VAULTS §~1386,
the `SponsorRail` import used across Discover/Grants/Deal-flow, and the VM seeds for
plans/vaults/deal-flow) — every correction below changed the build to match what the
template and the plan document actually say, not this doc's original assumptions:

- **The tier-subscribe entitlement matrix was already settled, not open.** This doc's
  original §9.12 gate ("what exactly each tier unlocks") turned out to be answered in
  `documents/iskolar-academy-plan.md` §4's own prose (Scout: browse/filter/express-interest;
  Alpha: vault-access-requests + saved-search alerts + private watchlists; Venture Partner:
  promoted placement/incubation/CRM export, 🔸 later) — matching the template's
  `planFeat`/`tierInfo` seeds exactly, and **already hardcoded** in the pre-P5
  `sponsor/subscription.tsx` mock. Reused directly in `lib/subscription/model.ts`'s `PLANS`
  array; only the real peso pricing stayed open.
- **Tier subscribe is a simulated checkout, not "Coming soon."** Clicking a paid tier opens
  `TierConfirmModal` — a real dialog (features + price) → **Authorize** → a ~1.8s
  "Redirecting to PayMongo…" pause → `src/payments.ts`'s `subscribeToTier()` (simulated,
  same module P4 built) → success, a real `subscription` row. Requested explicitly as a
  modal (the static template's own prototype JS just flashes a toast on click with no
  confirm step at all — a real gap the mockup doesn't depict, same class of correction as
  `ReviewDecisionModal`'s return note). Free-tier switches and seat changes stay direct, no
  modal ceremony (not distinct money actions).
- **Seats have no real "N of M used" to show.** The pre-P5 mock's "3 of 5 seats used" was a
  static number with nothing behind it — there's no sponsor-org-member/invite system
  anywhere in this app. `SeatManager` shows the real billed quantity only (`seats: number`,
  editable), not a fabricated usage fraction.
- **Invoices stay empty** — no recurring billing cycle runs in simulated mode; that's the
  PayMongo pass, not this phase. The template's static invoice rows were mock data with no
  real billing behind them either way.
- **Deal-flow's "feed of followed builders" turned out to be decorative flavor text over
  real project data, not a real social feature.** Checked directly: `sponsorFeed` (the only
  list actually rendered on `isDealFlow` — `sponsorCols`, a sector-columns board matching
  the *plan's* SPN-13 description, is computed in the template's JS but never rendered
  anywhere, exactly like P4's dead `fundChips`) is `[...PROJECTS()].sort(upvotes).slice(0,6)`
  with a caption from `ftext()`, a fixed rotation of sentences like "just crossed 340
  upvotes" that don't correspond to any real event-tracking system — this app has no
  activity log recording *when* such a thing happened. Built `sponsor/home.tsx` as a real
  feed over P3's trending published projects (same card shape, same visual rhythm) with the
  fabricated caption line dropped and the real pitch (already in the template's own nested
  preview block) carrying the description; the decorative rotating "kind" tag became the
  real `trending` flag or category.
- **"Your subscriptions"/"Suggested to follow" in `SponsorRail` stay mock, deliberately —
  not an oversight.** There's no "sponsor follows a builder" relationship anywhere else in
  this app and no story asks for one; building a real follow backend for one rail panel
  would be scope with nothing requiring it. Go-live alerts, watchlist count, and the plan
  card in the same rail **are** real.
- **Saved search reduces to one global alert toggle, not a `saved_search` entity.** The
  template has no "save a query" management UI anywhere — the only saved-search surface
  that exists is the single go-live-alerts on/off switch. Modeled as
  `Subscription.alertsEnabled` (a sponsor-level preference), not a separate jsonb-query
  table; dropped the planned `saved-searches.tsx` route entirely.
  **Open item, not silently built as working:** there is also no notification type or
  emit-trigger for "a project matching your alert criteria went live" anywhere in the
  template's notification seed — with no saved query, there's no criteria to match against.
  The toggle is a real, persisted preference; the emit that would consume it is out of
  scope here, flagged below.
- **Watchlist is a real per-project boolean, Alpha+ gated**, wired on `DealFlowCard` only
  (matches the template's actual usage — the Watch button only appears on `sponsorFeed`/
  `sponsorCols` cards, never on the main Discover gallery).
- **Vault duration is 14 days, not a guess.** The template's own "Approve (14d)" button and
  "expires in 14d" status label state this explicitly — used as-is, not the 30-day
  placeholder floated before this reference pass.
- **A vault is created implicitly by uploading its first document — there is no separate
  "set up a vault" action anywhere in the template.** `VaultManager` shows one card per
  project the student owns (even with zero documents) with an Upload action per card; the
  Upload button itself isn't depicted in the template's static view (which only ever shows
  vaults that already have documents), added for the same reason as the badge-grant form
  and the tier-confirm modal — necessary functionality the mockup doesn't render.
- **A sponsor's approved vault access needed an actual document-viewing surface, which
  wasn't in the original plan's component list.** `VaultAccessButton` (the project detail's
  third rail button, alongside upvote + interest, matching the template's `vaultLabel`/
  `onVault` living on the exact same detail view-model as `interestLabel`/`onInterest`)
  shows the real request/pending/approved states, and — new, not in the original file list —
  a small real document list once approved, via a new `GET /projects/:id/vault-documents`
  sponsor-facing read. Without this, "approved" would have had nothing for the sponsor to
  actually open.
- **The Verified Builder badge had two existing wrong stand-ins, now fixed, not just
  added to.** `ProjectDetailView.tsx` showed the badge whenever `project.status ===
  "published"`, and `discover/model.ts`'s landing-teaser mapper hardcoded `verified: true`
  for every card — both factually wrong (a badge is a separate, admin-granted signal, not
  automatic from publishing). Added a real `verified: boolean` to the base `Project` type
  (not just the showcase extension, since the owner's own detail view needed the fix too)
  and rewired both call sites to it. Also added the small inline ✔ to `DiscoverCard` (the
  gallery card) — it was missing entirely, not just wrong.
- **No template screen exists for ADM-07, but the *source* decision was already settled** —
  `documents/iskolar-academy-plan.md` §9.15 already recommends "manual admin grant in v1,
  deploy-ping later," matching this doc's own original Decisions section. Only the UI
  location needed deciding: composed as a fourth "Badges" tab on the existing admin console
  (`Queue`/`Moderation`/`Metrics`/`Badges`), not a product ask.
- **Badge evidence reuses the shared PDF/15MB `documents.ts` constants**, same as the
  thesis paper and grant proposal uploads — no new MIME category for images/screenshots
  (flagged as a possible future widening, not built now).

### Files (by domain slice)

| File | Layer | Purpose |
|---|---|---|
| `src/lib/subscription/{model,api,helper}.ts` | lib | `PlanKey`/`PLANS` (real feature lists)/`Subscription`, `subscribeToTier`/`updateSeats`/`setAlertsEnabled`, `hasEntitlement` |
| `src/hooks/subscription/{useMySubscription,useEntitlement,useSubscriptionMutations}.ts` | hooks | Query + mutation wrappers |
| `src/components/subscription/{PlanTable,TierConfirmModal,SeatManager}.tsx` | components | Tier cards, simulated-checkout modal, real seat CRUD |
| `src/routes/sponsor/subscription.tsx` | route | Rewritten off real hooks (was local `useState` mock) |
| `src/lib/saved-search/{model,api}.ts` | lib | Watchlist ids + toggle (no saved-search entity) |
| `src/hooks/saved-search/useWatchlist.ts` | hooks | Watchlist query + toggle mutation |
| `src/components/discover/SponsorRail.tsx` | component (affect) | Real alerts/watchlist/plan; follow panels stay mock, documented why |
| `src/components/discover/DealFlowCard.tsx` | component | Real feed card (P3 data, honest captions) |
| `src/routes/sponsor/home.tsx` | route | Rewritten as the real deal-flow board |
| `src/lib/vault/{model,api}.ts` | lib | `MyVault`/`VaultAccessRequest`, upload/read/decide/request-access, sponsor doc read |
| `src/hooks/vault/{useVault,useVaultAccess}.ts` | hooks | Query + mutation wrappers |
| `src/components/vault/{VaultManager,VaultAccessRequests,VaultAccessButton}.tsx` | components | Student vault + requests columns; sponsor rail button |
| `src/routes/student/vaults.tsx` | route | "Pitch vaults" — two-column page |
| `src/lib/badge/{model,api}.ts` | lib | `BadgeKind`, `grantBadge` (multipart, reuses `documents.ts`) |
| `src/hooks/badge/useGrantBadge.ts` | hook | Grant mutation, invalidates review + discover caches |
| `src/components/admin/BadgeGrantForm.tsx` | component | New admin Badges-tab form |
| `src/routes/admin/dashboard.tsx` | route (affect) | Fourth "Badges" tab |
| `src/lib/project/model.ts` | lib (affect) | Added real `verified: boolean` to the base `Project` type |
| `src/lib/discover/model.ts` | lib (affect) | Added `vaultAccessStatus` (per-viewer); fixed `toProjectCardData`'s hardcoded `verified: true` |
| `src/components/project/ProjectDetailView.tsx` | component (affect) | Fixed the `status === "published"` badge stand-in |
| `src/components/discover/DiscoverCard.tsx` | component (affect) | Added the missing gallery-card ✔ |
| `src/routes/_app/projects.$projectId.tsx` | route (affect) | Added `VaultAccessButton` to the sponsor interact rail |
| `src/components/notification/NotificationItem.tsx` | component (affect) | `vault_request` now links to `/student/vaults` (was the generic dashboard fallback) |
| `src/components/layout/RoleNav.tsx` | component (affect) | "My pitch vaults" now a real link (was inert) |

### Verification

`pnpm generate-routes` ✓ · `pnpm exec biome check src` clean (only the pre-existing
`Hero.tsx` `noStaticElementInteractions`, unrelated) · `tsc --noEmit` 0 errors · `pnpm
build` ✓. Zero new client packages.

## Open Items

- ~~**Server not yet built**~~ **RESOLVED (2026-07-15):** all four slices shipped —
  `academy-server/documentation/phases/P5-monetization-server.md` (67/67 in-process).
  Two things the server team caught and fixed before implementing, worth knowing about
  even though nothing on the client needed to change: (1) `PlanTable` never offers
  Venture Partner as a self-serve subscribe action, so nothing else stopped a direct call
  from bypassing that — the server now independently rejects `tier:"venture_partner"` on
  `POST /subscriptions/subscribe`; (2) `VaultAccessButton` falls through to the plain,
  enabled "Request vault access" button for a `denied`/`revoked` status exactly the same
  as "never requested" — there's no distinct "permanently denied" state in the UI — so
  the server now **reopens** a denied/revoked grant back to `requested` on a fresh
  request instead of silently no-op'ing forever, matching what the button actually
  promises.
- **Go-live alert emit has no defined trigger** — the toggle is a real, persisted
  preference; nothing yet fires a notification when a project matching "whatever a sponsor
  might care about" goes live, because there's no saved query to define "matching" against.
  Needs a product decision on trigger criteria (all new publishes? category-filtered
  somehow?) before it can be built — not silently assumed to already work.
- **SPN-11-adjacent:** no sponsor "my funded grants"/"my watchlist as a page" surface beyond
  the rail count — matches the P4 precedent of deferring the equivalent funded-grants list.
- **Badge evidence MIME allow-list** — PDF-only via the shared `documents.ts` constants;
  screenshots/images would need a widened allow-list, not built now.
- **PayMongo pass** (deferred, see roadmap doc) will need to add a pending/async state to
  `TierConfirmModal`'s success flow, same as P4's `GrantFundPanel`, once real capture is
  webhook-driven instead of immediate.
- **Enterprise pieces** (promoted placement, incubation campaigns, CRM export) — 🔸 later,
  untouched.
