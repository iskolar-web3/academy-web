# Phase P3 — Discovery & Contact (Browse · Search · Filters · Card · Interest · Notifications · Upvotes)

**Status:** ✅ **Client done** 2026-07-06 · ✅ **server live** 2026-07-06 (`academy-server/.../phases/P3-discovery-contact-server.md` — DB v6, 66/66 in-process) · 🔨 linked-member picker is a placeholder (see below)
**Target:** after P2

### What's done vs still in progress

| | Scope | State |
|---|---|---|
| ✅ Done (client) | Notification slice (bell → live, `/notifications` page 1:1 to template §, `NotificationItem` per-type renderer), discover swapped mock → server contract (URL-driven search/category/sort), public project detail on the live published projection, one-tap interest ("I'm interested" → "✓ Interest sent", org gate, idempotent state), optimistic upvote toggle (sm card + lg detail variants), `IncomingInvites` → real `member_invite` + accept/decline, landing teaser + sponsor home → public teaser query, STU-02 published-work backfill on `/u/$userId`. `lib/discover/mock.ts` **deleted**. | Shipped, green |
| ✅ Server live (2026-07-06) | All four slices shipped (DB v6) — gallery/search/sorts, public teaser, interest + reveal notification, upvote toggle, live notification feed, and the STU-08 invite loop are end-to-end. | Realized in `P3-discovery-contact-server.md` |
| 🔨 Client follow-up | **The linked-member "picker" is a checkbox**: `formToProjectInput` sends `linkedUserId: "linked-N"` placeholders and echoes synthetic member ids, so a real invite can never reach a real user through the UI. The server defines `linkedUserId` = the invitee's **iSkolar user id** and handles the placeholder drift defensively — the modal needs an identifier input / user search to close the loop. | Open — needs a member-identifier field |

### Realized scope corrections (template-driven — checked before building)

- **SPN-08 "My interests" has no page** — the template has no such surface; the sent-state on
  every card/detail (via `GET /interests/me`) is the P3 answer, and the *list* surface is the
  P5 SPONSOR DEAL-FLOW screen. No `/sponsor/interests` route was invented.
- **STU-13 works through notifications** — the template's `sponsor_interest` notification links
  to the **sponsor's profile** ("open their profile to follow up"); there is no per-project
  interested-sponsors list in the template. Implemented exactly that way.
- **Interest wording corrected** — the template says "I'm interested" / "✓ Interest sent"
  (§1844), not "Express interest"; the detail rail now matches, and the privacy note shows for
  **every** non-owner viewer (it sits outside the sponsor conditional in the template).
- **Detail rail upvote is the large variant** (`upStyleLg`, 46px full-width) — previously the
  34px card variant was reused; `UpvoteButton` now has both template sizes and is controlled
  (`upvoted`/`count` from the server, optimistic toggle).
- **No separate SearchBar/FilterPanel/SortControl/ProjectGrid components** — the GALLERY
  toolbar shipped in P2-era work as one route; P3 rebound it to URL params + the live query.
- **SPN-07 gate:** the story's "org + ≥1 contact link" can't be enforced as written — the
  profile model (and the template's EDIT PROFILE) has no contact-link field. Gated on
  `org` non-empty (client prompt + server re-check); the contact-link gap is an Open Item.
**Repo(s):** academy-client (this doc) · academy-server (`sponsor/`, `interest/`, `upvote/`, `notification/`)
**Traces to:** PRD — FR-SP1…SP8, FR-N1, FR-N2, FR-N6 · Plan — §6, §7 (Phase 3) · Stories — SPN-03, SPN-04, SPN-05, SPN-06, SPN-07, SPN-08, PLT-07, PLT-08, STU-12, STU-13
**Commit/PR:** —

## Goal

Turn published projects into a discoverable, searchable, filterable gallery of all-in-one cards; let sponsors express one-tap interest that reveals them to the student (no contact-info request); deliver in-app notifications site-wide; and let any signed-in user upvote to power Trending/Top.

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| SPN-03 | Browse published | `_app/discover` |
| SPN-04 | Full-text search | discover search |
| SPN-05 | Filters & sorts | discover filters |
| SPN-06 | All-in-one card | `components/project` card |
| SPN-07 | Express interest | card action |
| SPN-08 | My interests | `_sponsor/interests` |
| STU-12 | Sponsor-interest notification | student notification |
| STU-13 | View interested sponsors | `_student/projects/$id` |
| PLT-07 | In-app notifications | global notification center |
| PLT-08 | Upvotes | card control + sorts |

## Planned Build (by FE slice)

### `discover` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/discover/api.ts` | lib | **Create** | `getPublishedProjectsQuery({ search, filters, sort, page })` — tsvector search, category/sector·type·tech·skills·school·region filters, Newest/Trending/Top sorts. |
| `src/lib/discover/model.ts` | lib | **Create** | Filter/sort/query param types + Zod. |
| `src/hooks/discover/useProjectGallery.ts` | hook | **Create** | Paginated gallery query bound to URL search params. |

### `interest` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/interest/api.ts` | lib | **Create** | `expressInterest(projectId)` (idempotent), `getMyInterestsQuery()`, `getProjectInterestsQuery(projectId)`. |
| `src/lib/interest/model.ts` | lib | **Create** | Interest type + schema. |
| `src/hooks/interest/useExpressInterest.ts` | hook | **Create** | Mutation; gates on minimally-complete sponsor profile; idempotent. |
| `src/hooks/interest/useMyInterests.ts` | hook | **Create** | Sponsor's interest list (SPN-08). |
| `src/hooks/interest/useProjectInterests.ts` | hook | **Create** | Owner's interested-sponsors list (STU-13). |

### `upvote` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/upvote/api.ts` | lib | **Create** | `toggleUpvote(projectId)`; count comes embedded on the project. |
| `src/hooks/upvote/useToggleUpvote.ts` | hook | **Create** | Optimistic toggle + invalidate (PLT-08). |

### `notification` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/notification/api.ts` | lib | **Create** | `getNotificationsQuery()`, `markRead()`; types: sponsor_interest, review_decision, member_invite, grant_*, vault_*, saved_search_alert. |
| `src/lib/notification/model.ts` | lib | **Create** | Notification type + payload union + Zod. |
| `src/hooks/notification/useNotifications.ts` | hook | **Create** | List + unread count (PLT-07). |
| `src/hooks/notification/useMarkRead.ts` | hook | **Create** | Read-state mutation. |

### Routes
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_app/discover/index.tsx` | route | **Create** | Gallery: search + filters + sorts (SPN-03/04/05). |
| `src/routes/_app/project/$projectId.tsx` | route | **Create** | Card-as-detail (SPN-06) — confirm vs all-in-one card decision. |
| `src/routes/_sponsor/interests.tsx` | route | **Create** | My interests (SPN-08). |
| `src/routes/_student/projects/$projectId/index.tsx` | route | **Affect** | Add interested-sponsors list (STU-13). |
| `src/routes/_public/index.tsx` | route | **Affect** | Top-3 preview now reuses the real card component. |
| `src/routeTree.gen.ts` | generated | **Affect** | `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/project/ProjectCard.tsx` | component | **Create** | All-in-one card: pitch, category/school/region, tech stack, MVP links, upvote count + control, team + per-member skills, badge slot (SPN-06). |
| `src/components/discover/SearchBar.tsx` | component | **Create** | Full-text search input (SPN-04). |
| `src/components/discover/FilterPanel.tsx` | component | **Create** | Category/type/tech/skills/school/region filters (SPN-05). |
| `src/components/discover/SortControl.tsx` | component | **Create** | Newest/Trending/Top. |
| `src/components/discover/ProjectGrid.tsx` | component | **Create** | Card grid + empty state. |
| `src/components/interest/InterestButton.tsx` | component | **Create** | One-tap interest; profile-completeness gate prompt (SPN-07). |
| `src/components/notification/NotificationCenter.tsx` | component | **Create** | Bell + unread count + list, linking to entities (PLT-07). |
| `src/components/notification/NotificationItem.tsx` | component | **Create** | Per-type renderer + read state. |
| `src/routes/__root.tsx` | route | **Affect** | Mount `NotificationCenter` in the signed-in shell. |

### Server (academy-server — cross-reference)
`sponsor/` (browse + tsvector search + filters), `interest/` (idempotent unique, emits `sponsor_interest`), `upvote/` (toggle + counts), `notification/` (list/read). Trending = upvotes last 30 days; Top = all-time.

## Realized Build (2026-07-06)

| File | Change | Notes |
|---|---|---|
| `lib/notification/{model,api}.ts` | **Created** | Type union (3 live + 3 forward types), server-owned `tone`/`title`/`body`/`ageLabel`, entity refs (`projectId`/`actorUserId`/`actorName`/`memberId`); list + read + read-all + invite accept/decline calls. |
| `hooks/notification/{useNotifications,useNotificationMutations}.ts` | **Created** | List + unread count; read/read-all/accept/decline (invites also invalidate `project`). |
| `components/notification/NotificationItem.tsx` | **Created** | Template row (42px tile · title + dot · body · when) + compact dropdown variant; per-type glyph/tone/link map (template `go` map). |
| `routes/_app/notifications.tsx` | **Created** | NOTIFICATIONS PAGE 1:1 — 860px column, unread count, Mark-all-read, unread-tinted rows. |
| `components/layout/RoleNav.tsx` | **Affected** | Mock array deleted; bell badge + dropdown + account-menu count now live; "See all" → `/notifications`. |
| `components/project/IncomingInvites.tsx` | **Rewritten** | Seed → unread `member_invite` notifications; Accept/Decline post to the member sub-paths with toasts. |
| `lib/discover/{model,api}.ts` | **Created** | `ShowcaseProject` (= `projectSchema` + `trending`/`upvotedByMe`), gallery/single/teaser queries (+ `owner` param for STU-02), `toProjectCardData` mapper. |
| `hooks/discover/useProjectGallery.ts` | **Created** | Gallery query keyed off URL params. |
| `routes/_app/discover.tsx` | **Rewritten** | `validateSearch` → URL-driven q/category/sort (debounced search input), live query, loading/empty/error states; toolbar + SponsorRail unchanged. |
| `routes/_app/projects.$projectId.tsx` | **Rewritten** | Live `GET /discover/projects/:id`; composes the interact rail (lg upvote · sponsor `InterestButton` · privacy note). |
| `components/project/ProjectDetailView.tsx` | **Affected** | New `interact` slot (routes compose the non-owner rail card; component stays presentational). |
| `lib/interest/api.ts` + `hooks/interest/useInterest.ts` | **Created** | `GET /interests/me` (ids drive sent-states, SPN-08) + idempotent `POST /projects/:id/interest`. |
| `components/interest/InterestButton.tsx` | **Created** | Template treatment exactly; org-gate prompt (SPN-07 AC#2) + success/error toasts. |
| `lib/upvote/api.ts` + `hooks/upvote/useToggleUpvote.ts` | **Created** | `POST /projects/:id/upvote`; optimistic flip across all discover caches (lists + single), rollback on error (PLT-08 AC#4). |
| `components/project/UpvoteButton.tsx` | **Rewritten** | Controlled (`count`/`upvoted`/`onToggle`) + both template sizes (34px `upStyle`, 46px `upStyleLg`); spring/confetti kept. |
| `components/discover/DiscoverCard.tsx` | **Affected** | `MockProject` → `ShowcaseProject`; wired heart; `trending` badge server-owned. |
| `components/landing/RecentProjectsPreview.tsx` · `routes/sponsor/home.tsx` | **Affected** | Mock cards → public `GET /discover/teaser` (PLT-06 stays card-only for visitors). |
| `components/account/ProfileView.tsx` + `routes/_app/u.$userId.tsx` | **Affected** | STU-02 backfill: template two-column published-work rows from `?owner=` query (students only). |
| `lib/discover/mock.ts` | **Deleted** | All consumers now live; `mockToProject`/`toProjectCard`/seeds gone (no orphans). |

**Verification (client):** `pnpm generate-routes` ✓ · Biome clean (pre-existing `Hero.tsx` finding only) · `tsc --noEmit` **0** · `pnpm build` (client + SSR) ✓. Zero new packages, zero new env vars.

## Implementation Process (ordered)

1. Land `notification` slice first (unblocks STU-08 from P1, STU-12, and the bell).
2. `discover` api + gallery bound to URL search params (SPN-03).
3. `ProjectCard` all-in-one (SPN-06) — becomes the shared card for gallery, top-3 preview, profiles.
4. Search + filters + sorts (SPN-04/05).
5. `interest` slice + `InterestButton` with profile-completeness gate + idempotency (SPN-07); my-interests (SPN-08); interested-sponsors on owner view (STU-13); `sponsor_interest` notification (STU-12).
6. `upvote` toggle + wire Trending/Top sorts (PLT-08).
7. `pnpm generate-routes`, `pnpm check`.

## Decisions & Trade-offs

- **URL-driven gallery state** (search/filters/sort/page in the query string) — shareable, back-button-correct, and lets TanStack Query key off the params; no local filter store.
- **Idempotent interest** (unique sponsor×project) enforced server-side; client shows already-interested state — re-tap never re-notifies (SPN-07 AC#5).
- **Optimistic upvote toggle** — instant count feedback; reconcile on invalidate (PLT-08 AC#4).
- **Trending bias-free** — organic upvote sorts only; any future paid placement (P5) renders in separate labeled slots, never mixed.
- **Confirm "card = detail"** — SPN-06 makes the card all-in-one; the `project/$id` route may just be the expanded card rather than a distinct template (open question to confirm).

## Dependencies & Open Items

- **Depends on:** P2 (published projects exist), P0 (sponsor profile completeness for SPN-07 gate).
- **Cross-phase:** notification slice retroactively completes STU-08 (P1).
- **Open — linked-member picker (STU-07/08):** the submit modal's "linked" toggle is a checkbox;
  `formToProjectInput` sends placeholder `linkedUserId: "linked-N"` ids, so a real invite never
  reaches a real user through the UI. The server contract fixes `linkedUserId` = the invitee's
  **iSkolar user id** and tolerates the placeholders (consent survives re-saves) — closing the
  loop needs a member-identifier input / user search in the modal.
- **Open — SPN-07 "≥1 contact link":** no contact-link field exists in the profile model or the
  template's EDIT PROFILE; the gate is `org` non-empty on both sides. Needs a product/template
  decision to go further.
- ~~**Open:** whether `project/$projectId` is a separate detail page or the card expanded.~~
  **RESOLVED (Realized Build):** it's a detail page — `routes/_app/projects.$projectId.tsx` on
  the live published projection, composing the interact rail.

## Verification Plan

- Gallery shows only published; visitors still capped at top-3 (SPN-03 vs PLT-06).
- Search hits title/description/tech and combines with filters + sorts; empty state on no match (SPN-04).
- Interest requires org + ≥1 link; reveals sponsor to student via notification; idempotent; rate-limited (SPN-07).
- Student sees all interested sponsors per project, each linking to profile (STU-13).
- Upvote is one-per-user, toggleable, count updates immediately; Trending=30d, Top=all-time (PLT-08).
- Notifications target the right user, track read/unread, link to entity (PLT-07).
- `pnpm check` clean.
