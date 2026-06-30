# Phase P3 — Discovery & Contact (Browse · Search · Filters · Card · Interest · Notifications · Upvotes)

**Status:** 📋 Planned
**Target:** after P2
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
- **Open:** whether `project/$projectId` is a separate detail page or the card expanded (see decisions).

## Verification Plan

- Gallery shows only published; visitors still capped at top-3 (SPN-03 vs PLT-06).
- Search hits title/description/tech and combines with filters + sorts; empty state on no match (SPN-04).
- Interest requires org + ≥1 link; reveals sponsor to student via notification; idempotent; rate-limited (SPN-07).
- Student sees all interested sponsors per project, each linking to profile (STU-13).
- Upvote is one-per-user, toggleable, count updates immediately; Trending=30d, Top=all-time (PLT-08).
- Notifications target the right user, track read/unread, link to entity (PLT-07).
- `pnpm check` clean.
