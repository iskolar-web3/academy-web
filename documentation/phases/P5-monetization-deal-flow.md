# Phase P5 — Monetization & Deal-Flow (Subscriptions · Entitlements · Vault · Deal-Flow · Saved Search · Watchlist · Badges)

**Status:** 📋 Planned
**Target:** after P4 (shared PayMongo billing) + §9 billing decisions
**Repo(s):** academy-client (this doc) · academy-server (`subscription/`, `vault/`, `saved-search/`, `badge/`)
**Traces to:** PRD — FR-M1…M4, FR-DF1…DF3, FR-V1…V4, FR-S8, FR-S9, FR-S9a · Plan — §4 (B2B/VC layer), §6, §7 (Phase 5), §9 (billing) · Stories — STU-17, STU-18, SPN-12, SPN-13, SPN-14, SPN-15, SPN-16, ADM-07
**Commit/PR:** —

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

- **Depends on:** P4 (shared `payments.ts`), P3 (discover data for deal-flow/watchlist/saved-search), P1 (projects to attach vaults/badges to).
- **Gating:** §9.12 pricing/seats/entitlements, §9.13 dunning, §9.14 vault policy (duration/revoke/watermark), §9.15 badge source.
- **Out of v1:** FR-M4 enterprise (promoted placement, incubation campaigns, CRM export) — 🔸 later.

## Verification Plan

- Tier-restricted routes (vault/alerts/watchlists/exports) blocked without entitlement, server-enforced (FR-S8/SPN-12).
- Subscribe/seat-manage bills via PayMongo; status tracked; every charge in the ledger; students never billed (SPN-12).
- Deal-flow board sliceable by stack/sector/region, Alpha+ gated; Trending stays bias-free (SPN-13).
- Saved search fires `saved_search_alert` on a matching go-live; watchlist invisible to students (SPN-14/15).
- Vault locked by default; sponsor access only via approved, time-bounded, revocable grant + signed links; access logged in Lumen (STU-17/18, SPN-16).
- Badge grant is admin-only, recorded with evidence + as a Lumen credential, renders on card, gates nothing (ADM-07).
- `pnpm check` clean.
