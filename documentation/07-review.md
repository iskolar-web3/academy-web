# Phase 07 — Review (Admin Queue · Quality Review · Decision · Moderation · Metrics)

**Status:** ✅ Client done · ✅ server live
**Date:** 2026-07-06
**Repo(s):** academy-client (this doc) · academy-server (`review/` — see `academy-server/documentation/05-review-server.md`)
**Traces to:** PRD — FR-AD1…AD6 · Plan — §6, §7 (Phase 2) · Stories — ADM-01, ADM-03, ADM-04, ADM-05, ADM-06
**Commit/PR:** —

## Goal

Give Academy Admins (holders of the iSkolar `Admin` role) a review queue of submitted projects, a quality-review view (confirm MVP links work + clear purpose, pass/fail, no scoring), a decision action (approve→publish / return-with-notes / reject-terminal) that notifies the student, plus moderation (unpublish/flag) and lightweight platform metrics.

## What Was Built

1. **Admin console as one screen, not separate routes**
   - **File:** `src/routes/admin/dashboard.tsx`
   - **Purpose:** The design-template renders the whole admin area as one console — a sticky 220px tab-rail (Review queue · Moderation · Metrics) beside the active panel — rather than the originally-planned separate `_admin/review/index.tsx` + `$projectId.tsx` routes. The console stays at `/admin/dashboard`; the tab-rail switches panels via local state.
2. **Review queue + decision modal**
   - **File:** `src/lib/review/model.ts`, `src/lib/review/api.ts`, `src/hooks/review/useReviewQueue.ts`, `src/hooks/review/useReviewDecision.ts`, `src/components/admin/ReviewQueuePanel.tsx`, `src/components/admin/ReviewDecisionModal.tsx`
   - **Functions/Components:** `ReviewDecision` (approve\|return\|reject), `reviewDecisionSchema` (note required on return only), `reviewQueueQuery` (`GET /admin/review/queue`), `decideReview` (`POST /admin/review/:id/decision`)
   - **Purpose:** ADM-01 queue cards (title, type pill, school, submitted date, MVP-link summary) open a 680px review modal (ADM-03/04) rather than navigating to a separate detail route. The template's "Return to student" button is a bare action in the mockup, but a return is only useful with actionable feedback — the build adds an inline note textarea, required before the return fires.
3. **Moderation + metrics**
   - **File:** `src/lib/review/api.ts` (`moderationProjectsQuery`, `moderateProject`), `src/lib/metrics/api.ts`, `src/components/admin/ModerationPanel.tsx`, `src/components/admin/MetricsPanel.tsx`
   - **Purpose:** ADM-05 published-project flag/unpublish; ADM-06 live count cards. The template's two bar charts (Grants funded, Sponsor MRR) and the grant-requests moderation section render with placeholder data until the grants (Phase 09) and monetization (Phase 10) phases land — a deliberate cross-phase stub, not an oversight.

## Decisions & Trade-offs

- **Pass/fail gate, no scoring** — exactly three terminal/transitional outcomes; no rubric or numeric inputs, keeping reviewer cognitive load low and the bar binary.
- **Notes required only on `return`** — approve publishes immediately, reject is terminal; only resubmittable returns need actionable feedback.
- **Metrics are counts, not analytics** — deliberately lightweight in v1; no charts/time-series to avoid scope creep beyond the template's own illustrative bars.
- **Link "works" check is manual by the admin in v1** — automated deploy/GitHub checks are async/throttled and deferred; the reviewer clicks through.

## Verification

- Queue shows only `submitted` + re-review items; admin-only access enforced.
- Decision writes a `review` row, transitions status correctly, sets `published_at` on approve, and emits a `review_decision` notification.
- Return requires notes; student sees them on their dashboard.
- Unpublish removes from public listings.
- `pnpm exec tsc --noEmit` — 0 errors; `pnpm build` — client + SSR; `pnpm exec biome check` — clean (only the pre-existing `Hero.tsx` finding, unrelated).

## Open Items

- Automated MVP-link health checks (async queue) are deferred; the admin clicks through manually in v1.
- The Grants-funded / Sponsor-MRR metrics bar charts and the Moderation grant-requests section carry placeholder data until Phases 11 and 12 land real numbers.
