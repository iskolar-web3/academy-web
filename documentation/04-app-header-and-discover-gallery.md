# Phase 04 — App header (design-template nav) + Discover gallery

**Status:** ✅ Done (client-only; mock showcase data)
**Date:** 2026-07-02
**Repo(s):** academy-client
**Traces to:** PRD — FR-SP3 (browse showcase) · Plan — §6 · Stories — SPN-03
**Design source:** `design-template/iskolar-academy/project/iSkolar Academy.dc.html` (HEADER + GALLERY sections)

## Goal

Fix the signed-in top navigation to **exactly match the design-template HEADER** (I had
wrongly shipped a "Dashboard · My profile" nav), and make its destinations real by building
the Discover showcase gallery and a Grants placeholder.

## What Was Built

1. **Design-template header**
   - **File:** `src/components/layout/RoleNav.tsx`
   - **Component:** `RoleNav`
   - **Purpose:** Logo · role-aware center nav · notification bell · user pill. Nav per role
     is ported verbatim from the template's `navDefs`: **student** Discover · Grants · My
     Projects · **sponsor** Discover · Deal-flow · Grants · **admin** Review Queue · Discover.
     Active item uses the template's `#e3ebfb`/action styling. Role comes from the `role` prop
     (role shells) or the live session (shared `_app`); name/initials come from the session.
   - **Header content is wrapped in `.container-page`** so its logo / nav / actions line up
     with the page body's margins (the bar background + border stay full-bleed).
   - **User-pill dropdown** (template account menu): avatar + name + role·school, then Profile
     (→ `/student/profile`), Settings, Notifications, My pitch vaults (student only), and Log
     out. Log out calls `logout()` → `/login`.
   - **Notification popover** (template notifications menu): a bell with an unread badge that
     opens a list of notifications (tone icon + text + time) with a "See all →" footer; the
     account menu's Notifications row opens it too. Mock data until the P3 notification model.
   - **Dismissal:** only one popover is open at a time; both close on outside-click (a fixed
     backdrop) and on **Escape** (a `keydown` listener active while a popover is open).
   - **Motion:** the bell and pill scale on press (`active:scale`) and border-highlight while
     open (bell icon tilts); popovers enter with a `dsPopIn` fade/slide/scale
     (`.animate-pop-in`, `origin-top-right`). All honors `prefers-reduced-motion`.

2. **Discover showcase gallery**
   - **Files:** `src/routes/_app/discover.tsx`, `src/components/discover/DiscoverCard.tsx`
   - **Purpose:** 1:1 port of the GALLERY screen — search + **working Filters dropdown**
     (Sort: Newest/Trending/Top all-time · Category chips, with an active-filter badge + clear
     chip; closes on outside-click/Escape, animates in), result count, and a
     `repeat(auto-fill,minmax(258px,1fr))` card grid. `DiscoverCard` matches the template card:
     striped hue cover + trending badge, title, category + type chips, school, 3-line pitch
     clamp, tech chips (+N more), overlapping member avatars, and the shared `UpvoteButton`.
     Search/sort/filter run over the mock client-side using the template's exact logic.

3b. **Upvote (Design-System spec)**
   - **File:** `src/components/project/UpvoteButton.tsx`
   - **Purpose:** The canonical upvote from the template DESIGN SYSTEM page — outlined
     "♥ Upvote! · N" that turns solid blue on activate with a heart spring, confetti burst,
     count tick, and the "Upvote!" label collapsing to just the count. Local-only until P3.

3. **Grants placeholder**
   - **File:** `src/routes/_app/grants.tsx`
   - **Purpose:** Honest P4 stub so the nav resolves (browse/request/fund land in P4).

4. **Shared shell wiring**
   - **File:** `src/routes/_app.tsx`
   - **Purpose:** `_app` now renders `RoleNav` (session-driven) so Discover/Grants/public
     profile all carry the same header. `/discover` and `/grants` are pathless `_app`
     children → clean top-level URLs, reachable by any signed-in role.

## Decisions & Trade-offs

- **Header driven by role, one component** — matches the template's single role-aware header
  instead of divergent per-role bars; `_app` reads the session role, role shells pass theirs.
- **`_app/discover` + `_app/grants` are shared (pathless)** — Discover/Grants aren't
  role-specific; pathless keeps the URLs clean and avoids per-role duplication.
- **Gallery search is client-side over the mock** — full tsvector search, filter panel, and
  sort tabs are P3 (`phases/P3-discovery-contact.md`); the toolbar shell + card grid match
  the design now.
- **`DiscoverCard` in `components/discover/`** — follows the hybrid VSA discover slice
  (distinct from the simpler landing-teaser `components/project/ProjectCard`).
- **Notification bell is visual only** — the popover + real counts are P3.

## Verification

- `pnpm exec tsc --noEmit` → 0; `pnpm build` (client + SSR) passes; `pnpm exec biome check`
  clean (bar the pre-existing Hero a11y warning).
- SSR of `/student/home`, `/discover`, `/grants` all return 200 with the correct nav labels;
  `/discover` renders the gallery cards (AralBot … CoralCount) + result count.

## Open Items

- **P3 discovery** — swap the client-side search/filter/sort + local `UpvoteButton` state for
  server-backed queries + persisted upvotes; real notification data.
- **P4 grants** — replace the placeholder.
- **Dropdown placeholders** — Settings, Notifications, and My pitch vaults are present (to
  match the template) but not yet wired to routes; they land in their respective phases. Log
  out currently clears the client session only (no server sign-out until iSkolar-main SSO
  logout exists). The template's "View as" role-switcher is a design-only demo affordance and
  is intentionally omitted.
