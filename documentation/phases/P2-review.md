# Phase P2 — Review (Admin Queue · Quality Review · Decision · Moderation · Metrics)

**Status:** ✅ **Client done** 2026-07-06 · ✅ **server live** 2026-07-06 (`academy-server/.../phases/P2-review-server.md` — DB v5, 32/32 in-process)
**Target:** after P1
**Repo(s):** academy-client (this doc) · academy-server (`review/`)
**Traces to:** PRD — FR-AD1…AD6 · Plan — §6, §7 (Phase 2) · Stories — ADM-01, ADM-03, ADM-04, ADM-05, ADM-06
**Commit/PR:** —

> ADM-02 (Grant Oversight) and ADM-07 (Verified Builder Badge) are admin stories but belong to P4 and P5 respectively — see those docs.

### What's done vs still in progress

| | Scope | State |
|---|---|---|
| ✅ Done (client) | Admin console (tab-rail: Review queue · Moderation · Metrics), review-decision modal (approve/return/reject + inline return note), published-project moderation (flag/unpublish), live count metrics. `lib/review` + `lib/metrics` call the **live** server contract via `apiFetch`. | Shipped, green |
| ✅ Server live (2026-07-06) | The `review` slice + `GET /admin/metrics` shipped on academy-server (DB v5); the console's Queue/Moderation/Metrics surfaces are live end-to-end. `review_decision` notification emit deferred to P3. | Realized in `P2-review-server.md` |
| 🔨 Deferred (cross-phase stub) | **Moderation › Open grant requests** (P4 — grants module) and the **Metrics bar charts** (Grants funded → P4, Sponsor MRR → P5) render their design with illustrative/placeholder data until those phases land. | Stubbed by design |

## Realized Build (2026-07-06)

**Structure — followed the design-template, not the plan's route sketch.** The design-template
renders the admin area as **one console** (`ADMIN` §, lines 908–1015): a sticky 220px tab-rail
(**Review queue · Moderation · Metrics**) beside the active panel, with the review as a **modal**
(`ADMIN REVIEW MODAL` §, lines 1017–1084) — not the planned separate `_admin/review/index.tsx`
+ `$projectId.tsx` routes. The console stays at `/admin/dashboard` (the admin RoleNav entry);
the tab-rail switches panels via local state. So the plan's `ReviewQueueTable`/`ReviewDetail`/
`DecisionDialog`/`ModerationControls`/`MetricsCards` collapsed into four panels + one modal.

| File | Layer | Change | Notes |
|---|---|---|---|
| `src/lib/review/model.ts` | lib | **Created** | `ReviewDecision` (approve\|return\|reject), `ModerationAction` (unpublish\|flag), `reviewDecisionSchema` (note required on **return** only, refinement), `moderationSchema`, `PlatformMetrics`/`metricCardSchema`. Queue items reuse the project `Project`/`projectSchema`. |
| `src/lib/review/api.ts` | lib | **Created** | `reviewQueueQuery` (`GET /admin/review/queue`), `moderationProjectsQuery` (`GET /admin/moderation/projects`), `decideReview` (`POST /admin/review/:id/decision`), `moderateProject` (`POST /admin/moderation/:id`). |
| `src/lib/metrics/api.ts` | lib | **Created** | `platformMetricsQuery` (`GET /admin/metrics`) — counts only. |
| `src/hooks/review/useReviewQueue.ts` | hook | **Created** | `useReviewQueue`, `useModerationProjects`. |
| `src/hooks/review/useReviewDecision.ts` | hook | **Created** | `decide` + `moderate` mutations; invalidates `review`/`metrics`/`project` caches. |
| `src/hooks/metrics/usePlatformMetrics.ts` | hook | **Created** | Metrics query. |
| `src/components/admin/ReviewQueuePanel.tsx` | component | **Created** | ADM-01 queue cards (title · type pill · school · submitted · MVP-link summary) → opens the modal. |
| `src/components/admin/ReviewDecisionModal.tsx` | component | **Created** | ADM-03/04 — the 680px review modal (pitch · purpose · tech · MVP links · team · ownership) + Reject/Return/Approve. |
| `src/components/admin/ModerationPanel.tsx` | component | **Created** | ADM-05 published-projects flag/unpublish; grant-requests section is a P4 stub. |
| `src/components/admin/MetricsPanel.tsx` | component | **Created** | ADM-06 live count cards + the two template bar charts (illustrative → P4/P5). |
| `src/routes/admin/dashboard.tsx` | route | **Rewritten** | The console: tab-rail + panels + modal state (was a P0 placeholder). |

Notes vs the design-template:
- **Return note** — the static template's "Return to student" is a bare button; the build reveals
  an inline note textarea + confirm on click, because a return is only useful with actionable
  feedback (ADM-04, notes-required). This is the sole interaction state the mockup can't depict.
- **MVP-link rows** reuse the lucide icon treatment already shipped in `ProjectDetailView` (the
  realized P1 design language) rather than the mockup's glyph stand-ins.
- **Metrics charts + grant-request moderation** are rendered 1:1 but back their cross-phase data
  with placeholders until P4/P5, per the P1 cross-phase-stub convention.

## Verification (realized)

- `pnpm exec tsc --noEmit` → **0 errors**; `pnpm build` (client + SSR) → **✓**; `pnpm exec biome
  check src` → only the pre-existing `Hero.tsx` `noStaticElementInteractions` finding (unrelated).
- Admin console renders under the `/admin` guard; tab-rail switches Queue/Moderation/Metrics;
  the review modal opens from a queue card and closes on ✕/backdrop/Escape; Return requires a
  note before it fires. Live surfaces show loading/empty/error until the server slice ships.

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
