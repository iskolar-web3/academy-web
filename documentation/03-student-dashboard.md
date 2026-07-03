# Phase 03 — Student dashboard (design-template match)

**Status:** ✅ Done (client-only; mock-backed via P1 project store)
**Date:** 2026-07-02
**Repo(s):** academy-client
**Traces to:** PRD — FR-ST9 (dashboard), FR-ST10 (withdraw), FR-ST11 (edit-after-publish) · Plan — §6, §7 (Phase 1) · Stories — STU-09, STU-10, STU-11
**Design source:** `design-template/iskolar-academy/project/iSkolar Academy.dc.html` (STUDENT DASHBOARD section) · `Design System.dc.html`

## Goal

Complete the student's main page as a **1:1 build of the design-template STUDENT
DASHBOARD** — profile sidebar + stat tiles + owned-project cards with a lifecycle pipeline
tracker — replacing the placeholder home. No new design was invented; structure, colors,
spacing, and type were ported from the `.dc.html` reference (which the `styles.css` tokens
already mirror).

## What Was Built

1. **Dashboard route**
   - **File:** `src/routes/student/home.tsx`
   - **Component:** `StudentHome`
   - **Purpose:** `282px + 1fr` grid — sticky profile sidebar, a right-aligned "+ Submit a
     project" action, four stat tiles, and the owned-project list. Profile name comes from the
     live session; school/skills are placeholder until the profile API (STU-01/02).

2. **Profile sidebar**
   - **File:** `src/components/account/StudentProfileCard.tsx`
   - **Component:** `StudentProfileCard` (`StudentProfileCardModel`)
   - **Purpose:** Gradient header, 68px rounded avatar (initials), name/role/school/since,
     skills chips, "View public profile" → `/u/$userId`. Ported pixel-for-pixel.

3. **Pipeline tracker + project card**
   - **Files:** `src/components/project/ProjectPipeline.tsx`,
     `src/components/project/MyProjectCard.tsx`
   - **Components:** `ProjectPipeline`, `MyProjectCard`
   - **Purpose:** Draft → Submitted → In review → Published stepper (returned = danger dot);
     card = hue color bar + title + 6px status badge + category·updated + pipeline + inline
     returned note + single contextual action.

4. **Project domain helpers + display fields**
   - **Files:** `src/lib/project/helper.ts`, `model.ts`, `mock.ts`, `api.ts`
   - **Functions:** `pipelineSteps`, `dashboardStats`, `dashboardAction`, `statusChipClass`,
     `projectCover`, `hueFromString`. Added server-owned display fields to `Project`
     (`upvotes`, `hue`, `school`; excluded from `ProjectInput`); seeded from the discover mock;
     `createDraft` supplies defaults.

5. **Routing + lifecycle reconciliation**
   - **Files:** `src/components/layout/RoleNav.tsx`, `src/routes/student/projects/index.tsx`,
     `src/routes/student/projects/$projectId/index.tsx`
   - **Purpose:** `/student/projects` redirects to `/student/home`; the design's single-button
     card means submit/resubmit/**withdraw/delete** moved onto the project **detail** page.
     `MyProjectsTable` removed (superseded). (The top nav was rebuilt to the design-template
     header in [04-app-header-and-discover-gallery](./04-app-header-and-discover-gallery.md).)

## Decisions & Trade-offs

- **Dashboard lives at `/student/home`** — the template treats the student's home *as* the
  my-projects dashboard; one screen, not a separate feed + table.
- **Single action per card (per design)** — destructive lifecycle actions relocated to the
  detail page so nothing was lost while matching the mockup exactly.
- **Reuse `styles.css` tokens; arbitrary values only for off-token shades** (`#cbd5ef`,
  `#dfe6fa`, `#eef1fa`, `#eef3ff`) — keeps the design system as the single source of truth.
- **Placeholder profile detail** (school/skills) — profile API is deferred (STU-01/02); name
  is real (session).
- **Omit P4/P5 chrome** — the design's "Request a grant" / "Pitch vaults" buttons and Grant
  payouts section belong to later phases; kept out for phase discipline.

## Verification

- `pnpm exec tsc --noEmit` → 0 errors; `pnpm build` (client + SSR) passes; `pnpm exec biome
  check` clean apart from the pre-existing Hero `<section>` a11y warning (unrelated).
- SSR of `/student/home` returns 200 and renders the profile card + stat tiles; the project
  list shows "Loading…" server-side and hydrates to cards on the client (server == first
  client render → no hydration mismatch).
- Hydration audit: no `Date`/`Math.random`/`crypto` in render; the one `toLocaleString` is
  pinned to `"en-US"`; `useReducedMotion()` is read only in event handlers.

## Open Items

- **Profile backfill** (school, skills, since, published-work) — STU-01/02, when the profile
  API lands; replace the placeholder.
- **Grant payouts / pitch vaults / request-a-grant** — P4/P5.
- **Route guards** are now live (client/effect-based) — see [`phases/P0-foundation.md`](./phases/P0-foundation.md) → Realized Build — Client.
- Minor pixel deltas vs the mockup: card radius 16px (shared `.card-surface`) vs 15px;
  app-wide `.container-page` width.
