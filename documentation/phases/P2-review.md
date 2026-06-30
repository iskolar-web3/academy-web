# Phase P2 — Review (Admin Queue · Quality Review · Decision · Moderation · Metrics)

**Status:** 📋 Planned
**Target:** after P1
**Repo(s):** academy-client (this doc) · academy-server (`review/`)
**Traces to:** PRD — FR-AD1…AD6 · Plan — §6, §7 (Phase 2) · Stories — ADM-01, ADM-03, ADM-04, ADM-05, ADM-06
**Commit/PR:** —

> ADM-02 (Grant Oversight) and ADM-07 (Verified Builder Badge) are admin stories but belong to P4 and P5 respectively — see those docs.

## Goal

Give Academy Admins (holders of the iSkolar `Admin` role) a review queue of submitted projects, a quality-review view (confirm MVP links work + clear purpose, pass/fail, no scoring), a decision action (approve→publish / return-with-notes / reject-terminal) that notifies the student, plus moderation (unpublish/flag) and lightweight platform metrics.

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| ADM-01 | Review queue | `_admin/review` |
| ADM-03 | Quality review | review detail |
| ADM-04 | Review decision | decision action |
| ADM-05 | Moderation | published-project actions |
| ADM-06 | Platform metrics | `_admin/dashboard` |

## Planned Build (by FE slice)

### `review` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/review/api.ts` | lib | **Create** | `getReviewQueueQuery()`, `getReviewTargetQuery(id)`, `decideReview()` (approve\|return\|reject + notes), `moderateProject()` (unpublish\|flag). |
| `src/lib/review/model.ts` | lib | **Create** | `ReviewDecision` enum, decision Zod schema (notes required on return). |
| `src/lib/metrics/api.ts` | lib | **Create** | `getPlatformMetricsQuery()` — counts only. |
| `src/hooks/review/useReviewQueue.ts` | hook | **Create** | Queue list query. |
| `src/hooks/review/useReviewDecision.ts` | hook | **Create** | Decision mutation + invalidation + student notification (server-side). |
| `src/hooks/review/useModeration.ts` | hook | **Create** | Unpublish/flag mutation. |
| `src/hooks/metrics/usePlatformMetrics.ts` | hook | **Create** | Metrics query. |

### Routes
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_admin/route.tsx` | route | **Affect** | Already created P0; ensure admin guard active. |
| `src/routes/_admin/review/index.tsx` | route | **Create** | Review queue (ADM-01). |
| `src/routes/_admin/review/$projectId.tsx` | route | **Create** | Quality review + decision view (ADM-03/04). |
| `src/routes/_admin/dashboard.tsx` | route | **Create** | Platform metrics (ADM-06). |
| `src/routeTree.gen.ts` | generated | **Affect** | `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/admin/ReviewQueueTable.tsx` | component | **Create** | Submitted + re-review list with key info. |
| `src/components/admin/ReviewDetail.tsx` | component | **Create** | MVP-link checklist, purpose read, decision controls (ADM-03/04). |
| `src/components/admin/DecisionDialog.tsx` | component | **Create** | Approve/return/reject; notes required for return. |
| `src/components/admin/ModerationControls.tsx` | component | **Create** | Unpublish/flag on a published project (ADM-05). |
| `src/components/admin/MetricsCards.tsx` | component | **Create** | Count tiles (ADM-06). |
| `src/components/project/ProjectStatusBadge.tsx` | component | **Affect** | Reuse for queue rows. |

### Server (academy-server — cross-reference)
`review/` slice: queue query, decision handler (sets `published`/`returned`/`rejected`, writes `review` row, emits `review_decision` notification), moderation; metrics read (counts). All admin routes behind `requireRole(Admin)`.

## Implementation Process (ordered)

1. `lib/review` model + api (decision schema with conditional notes).
2. Review queue route + table (ADM-01).
3. Review detail: MVP-link checklist + purpose + decision dialog (ADM-03/04); wire `review_decision` notification.
4. Moderation controls on published projects (ADM-05).
5. Metrics route + count tiles (ADM-06).
6. `pnpm generate-routes`, `pnpm check`.

## Decisions & Trade-offs

- **Pass/fail gate, no scoring** (FR-AD3) — UI offers exactly three terminal/transitional outcomes; no rubric or numeric inputs, keeping reviewer cognitive load low and the bar binary.
- **Notes required only on `return`** — approve publishes immediately, reject is terminal; only resubmittable returns need actionable feedback.
- **Metrics are counts, not analytics** (FR-AD5/ADM-06) — deliberately lightweight in v1; no charts/time-series to avoid scope creep.
- **Link "works" check is manual by the admin in v1** — automated deploy/GitHub checks are async/throttled and deferred (FR-S10 note); reviewer clicks through.

## Dependencies & Open Items

- **Depends on:** P1 (projects exist + reach `submitted`), P0 (admin guard, notification model if landed; otherwise land notification before ADM-04).
- **Open:** automated MVP-link health checks (async queue) deferred; manual in v1.

## Verification Plan

- Queue shows only `submitted` + re-review items; admin-only access enforced (ADM-01).
- Decision writes a `review` row, transitions status correctly, sets `published_at` on approve, and emits a `review_decision` notification (ADM-04).
- Return requires notes; student sees them on their dashboard (links to STU-09).
- Unpublish removes from public listings; actions logged + admin-restricted (ADM-05).
- Metrics visible to admin only (ADM-06).
- `pnpm check` clean.
