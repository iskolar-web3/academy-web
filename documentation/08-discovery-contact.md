# Phase 08 — Discovery & Contact (Browse · Search · Filters · Card · Interest · Notifications · Upvotes)

**Status:** ✅ Client done · ✅ server live · 🔨 linked-member picker still a placeholder (tracked in Phase 06)
**Date:** 2026-07-06
**Repo(s):** academy-client (this doc) · academy-server (`sponsor/`, `interest/`, `upvote/`, `notification/` — see `academy-server/documentation/06-discovery-contact-server.md`)
**Traces to:** PRD — FR-SP1…SP8, FR-N1, FR-N2, FR-N6 · Plan — §6, §7 (Phase 3) · Stories — SPN-03, SPN-04, SPN-05, SPN-06, SPN-07, SPN-08, PLT-07, PLT-08, STU-12, STU-13
**Commit/PR:** —

## Goal

Turn published projects into a discoverable, searchable, filterable gallery of all-in-one cards; let sponsors express one-tap interest that reveals them to the student (no contact-info request); deliver in-app notifications site-wide; and let any signed-in user upvote to power Trending/Top.

## What Was Built

1. **Notification slice**
   - **File:** `src/lib/notification/model.ts`, `src/lib/notification/api.ts`, `src/hooks/notification/useNotifications.ts`, `src/hooks/notification/useNotificationMutations.ts`, `src/components/notification/NotificationItem.tsx`, `src/routes/_app/notifications.tsx`, `src/components/layout/RoleNav.tsx`
   - **Purpose:** Landed first since it retroactively unblocks the Phase 06 invite loop. A type union (3 live + 3 forward types) with server-owned `tone`/`title`/`body`/`ageLabel` and entity refs; list/read/read-all/invite-accept/decline calls. `/notifications` is a 1:1 build of the design-template's page; RoleNav's bell badge, dropdown, and account-menu count are all live (the old mock array is gone).
2. **Discover gallery, swapped mock → real**
   - **File:** `src/lib/discover/model.ts`, `src/lib/discover/api.ts`, `src/hooks/discover/useProjectGallery.ts`, `src/routes/_app/discover.tsx`
   - **Functions/Components:** `ShowcaseProject` (= `projectSchema` + `trending`/`upvotedByMe`), `toProjectCardData`
   - **Purpose:** The gallery existed since Foundation as a template-accurate shell (search box, filter dropdown, card grid) running client-side search/sort/filter over seed data, so the nav had somewhere real to go before the server contract existed. This phase swapped that shell onto URL-driven search/category/sort (`validateSearch`, debounced input) against the live gallery/single/teaser queries, including the `owner` param that backfills STU-02's published-work list. `lib/discover/mock.ts` was deleted — no orphaned consumers.
3. **Project detail interact rail**
   - **File:** `src/routes/_app/projects.$projectId.tsx`, `src/components/project/ProjectDetailView.tsx`
   - **Purpose:** Live `GET /discover/projects/:id`; a new `interact` slot composes the non-owner rail (large upvote, sponsor `InterestButton`, privacy note) while the component itself stays presentational.
4. **Interest + upvote**
   - **File:** `src/lib/interest/api.ts`, `src/hooks/interest/useInterest.ts`, `src/components/interest/InterestButton.tsx`, `src/lib/upvote/api.ts`, `src/hooks/upvote/useToggleUpvote.ts`, `src/components/project/UpvoteButton.tsx`
   - **Purpose:** `GET /interests/me` drives sent-states; `POST /projects/:id/interest` is idempotent, with an org-gate prompt and success/error toasts. The template's own copy is "I'm interested" / "✓ Interest sent" (not "Express interest") and the privacy note shows for every non-owner viewer, matching the template exactly. Upvote is `POST /projects/:id/upvote`, optimistic across every discover cache with rollback on error; `UpvoteButton` gained both template sizes (34px card, 46px detail) and is fully controlled (was local-only client state before this phase) while keeping its existing spring animation, confetti burst, and count-tick from the original Design-System build.
5. **Notification-model retrofits**
   - **File:** `src/components/project/IncomingInvites.tsx`, `src/components/discover/DiscoverCard.tsx`, `src/components/landing/RecentProjectsPreview.tsx`, `src/routes/sponsor/home.tsx`, `src/components/account/ProfileView.tsx`, `src/routes/_app/u.$userId.tsx`
   - **Purpose:** `IncomingInvites` now renders live `member_invite` notifications with real accept/decline (closing the Phase 06 stub). `DiscoverCard`'s `trending` badge and the landing/sponsor-home teaser cards moved off mock data onto `GET /discover/teaser`. The public profile's published-work list backfilled via the new `?owner=` query (closing the Phase 05 stub).

Two scope corrections found by re-checking the template before building: **SPN-08 "My interests" has no dedicated page** — the sent-state on every card/detail is the answer, and the list surface is Phase 10's sponsor deal-flow screen, so no `/sponsor/interests` route was invented. **SPN-07's "org + ≥1 contact link" gate** can't be enforced as written since the profile model has no contact-link field — gated on `org` non-empty only, with the contact-link gap left open.

## Decisions & Trade-offs

- **URL-driven gallery state** (search/filters/sort/page in the query string) — shareable, back-button-correct, lets TanStack Query key off the params directly; no local filter store.
- **Idempotent interest** (unique sponsor×project) enforced server-side — re-tap never re-notifies.
- **Optimistic upvote toggle** — instant count feedback, reconciled on invalidate.
- **Trending stays bias-free** — organic upvote sorts only; any future paid placement renders in separate labeled slots, never mixed in.
- **`project/$projectId` is a real detail page**, not the card expanded in place — resolved during the build, not left open.

## Verification

- Gallery shows only published; visitors stay capped at top-3.
- Search hits title/description/tech and combines with filters + sorts; empty state on no match.
- Interest requires org; reveals sponsor to student via notification; idempotent.
- Upvote is one-per-user, toggleable, count updates immediately; Trending = 30d, Top = all-time.
- Notifications target the right user, track read/unread, link to the right entity.
- `pnpm generate-routes`, `pnpm exec biome check`, `pnpm exec tsc --noEmit`, `pnpm build` — all clean. Zero new packages, zero new env vars.

## Open Items

- **Linked-member picker** (carried from Phase 06) — still a checkbox, not a real identifier input; closing the loop needs a member-identifier field / user search in the submit modal.
- **SPN-07 "≥1 contact link"** — no contact-link field exists in the profile model or the template's edit-profile screen; needs a product decision before the gate can go further than `org` non-empty.
