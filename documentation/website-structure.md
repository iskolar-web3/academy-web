# academy-client — Website Structure

**Status:** 🔨 Living reference · **Date:** 2026-07-01 · **Repo:** academy-client
**Traces to:** Plan §3 (architecture), phases [`phases/P0-foundation.md`](./phases/P0-foundation.md)

A map of how the frontend is organized — the folder architecture, the route groups, and
the URL layout. Keep this in sync when route groups or domains are added.

---

## 1. Architecture: hybrid Vertical Slice

A **feature is one domain reconstructed across four folders that share the domain name**.
Anything shared by many domains is *cross-cutting* and lives at the `src/` root instead of
being copied into a slice.

```
src/
├── routes/<group>/…        ← pages (TanStack file-based router; location is forced)
├── lib/<domain>/…          ← api.ts (queryOptions + calls), model.ts (types + Zod)
├── hooks/<domain>/…        ← React Query hooks that wrap lib/<domain>
├── components/<domain>/…   ← UI for that domain
│
├── auth.tsx                ← cross-cutting: AuthProvider (session context)
├── lib/api.ts              ← cross-cutting: fetch wrapper + getDefaultPathOfRole
├── components/layout/…     ← cross-cutting: shared shell chrome (RoleNav)
├── components/ui/…         ← Shadcn primitives only
├── integrations/…          ← TanStack Query provider / SSR wiring
└── styles.css              ← design tokens + fixed-component classes
```

**Rule of thumb:** if two domains both need it, it is cross-cutting (root), not a slice.
`RoleNav` is shared chrome → `components/layout/`, **not** a fake `components/app/` domain.

### Current domains

| Domain | routes | lib | hooks | components |
|---|---|---|---|---|
| **auth** | `_public/login`, `_onboarding/role-select` | `lib/auth/{api,model}.ts` | `hooks/auth/{useSession,useConfirmRole,useRouteGuard}.ts` | `components/layout/RouteFallback.tsx` (guard fallback) |
| **account** | `student/profile`, `sponsor/profile`, `_app/u/$userId`, `_app/settings` | `lib/account/{api,model}.ts` | `hooks/account/{useProfile,useUpdateProfile}.ts` | `components/account/{ProfileView,ProfileEditForm,StudentProfileCard}.tsx` |
| **project** | `student/home` (dashboard), `student/projects/*` | `lib/project/{api,model,helper}.ts` | `hooks/project/{useMyProjects,useProject,useProjectMutations}.ts` | `components/project/{ProjectPipeline,MyProjectCard,ProjectStatusBadge,UpvoteButton,SubmitProjectModal,ProjectDetailView,IncomingInvites}.tsx` |
| **discover** | `_app/discover` (gallery), `_app/projects.$projectId` (public detail) | `lib/discover/{api,model}.ts` (live; mock **deleted** in P3) | `hooks/discover/useProjectGallery.ts` | `components/discover/{DiscoverCard,SponsorRail}.tsx`, `components/project/ProjectCard.tsx` (landing teaser) |
| **grant** | `_app/grants` (gallery), `_app/grants.$grantId` (detail + fund), `student/grants/new` (create) | `lib/grant/{api,model,helper}.ts` | `hooks/grant/{useGrants,useMyGrants,useGrantMutations}.ts` | `components/grant/{GrantCard,GrantDetailView,GrantFundPanel,GrantForm}.tsx` |
| **interest** | (surfaces on detail + cards) | `lib/interest/api.ts` | `hooks/interest/useInterest.ts` | `components/interest/InterestButton.tsx` |
| **upvote** | (control on cards + detail) | `lib/upvote/api.ts` | `hooks/upvote/useToggleUpvote.ts` | `components/project/UpvoteButton.tsx` (controlled, sm/lg) |
| **notification** | `_app/notifications` | `lib/notification/{api,model}.ts` | `hooks/notification/{useNotifications,useNotificationMutations}.ts` | `components/notification/NotificationItem.tsx`, bell in `RoleNav`, `components/project/IncomingInvites.tsx` (invites feed) |
| **review** | `admin/dashboard` (console) | `lib/review/{api,model}.ts`, `lib/metrics/api.ts` | `hooks/review/{useReviewQueue,useReviewDecision}.ts`, `hooks/metrics/usePlatformMetrics.ts` | `components/admin/{ReviewQueuePanel,ReviewDecisionModal,ModerationPanel,MetricsPanel}.tsx` |
| **landing** | `_public/` (index) | — | — | `components/landing/*` |

> The **component folder shares the domain name** (`components/account`, not
> `components/profile`) so a slice never splits across two names.

---

## 2. Route groups & URL map

TanStack Start file-based routes under `src/routes/`. `routeTree.gen.ts` is generated —
run `pnpm generate-routes` after adding/renaming routes; never edit it by hand.

Two kinds of group:

- **Pathless `_group`** — the group name is a layout wrapper and does **not** appear in the
  URL. Used for cross-cutting shells whose children want clean top-level URLs.
- **Visible `group`** — the group name **is** a URL segment. Used for the role areas so
  parallel pages can't collide (see the collision note below).

| URL | File | Group kind | Guard (P0) | Notes |
|---|---|---|---|---|
| `/` | `routes/_public/index.tsx` | pathless | none | Visitor landing (PLT-06) |
| `/login` | `routes/_public/login.tsx` | pathless | none | SSO entry + dev role preview |
| `/role-select` | `routes/_onboarding/role-select.tsx` | pathless | signed-in, no role | Role confirm (PLT-04) — one click per role. A **sponsor** no longer picks a sub-kind; it routes to `/sponsor/subscription` to choose a tier. |
| `/u/$userId` | `routes/_app/u.$userId.tsx` | pathless | any signed-in | Public profile (STU-02/SPN-02) |
| `/discover` | `routes/_app/discover.tsx` | pathless | any signed-in | Showcase gallery (SPN-03/04/05) — toolbar + card grid over the **live** published projection; search/category/sort live in the **URL search params** and run server-side; **sponsors** also get the 320px `SponsorRail` sidebar. |
| `/grants` | `routes/_app/grants.tsx` | pathless | any signed-in | **Grants gallery** (SPN-09, P4) — every grant regardless of status; SponsorRail for sponsors. Design-template GRANTS GALLERY. |
| `/grants/$grantId` | `routes/_app/grants.$grantId.tsx` | pathless | any signed-in | **Grant detail + fund flow** (SPN-10, P4) — design-template GRANT DETAIL + FUND FLOW; sponsor gets the inline simulated-checkout rail (`GrantFundPanel`), everyone else a read-only note. |
| `/projects/$projectId` | `routes/_app/projects.$projectId.tsx` | pathless | any signed-in | Public/sponsor **project detail** — design-template PROJECT DETAIL over `GET /discover/projects/:id`; interact rail = large upvote (PLT-08) + sponsor "I'm interested" (SPN-07, idempotent) + privacy note. |
| `/notifications` | `routes/_app/notifications.tsx` | pathless | any signed-in | **Notifications page** (PLT-07) — design-template NOTIFICATIONS PAGE: unread count, Mark all read, per-type rows linking to entities (a `sponsor_interest` row links to the sponsor's profile — the STU-13 reveal). Reached from the header bell. |
| `/settings` | `routes/_app/settings.tsx` | pathless | any signed-in | Settings (design-template SETTINGS PAGE) — alerts toggle · digest/language · account/privacy · Log out. Opened from the header account dropdown. |
| `/student/home` | `routes/student/home.tsx` | visible | role = student | **Student dashboard** (STU-09): profile sidebar + stat tiles + project pipeline cards + **Grant payouts** section (P4, STU-15). 1:1 with design-template STUDENT DASHBOARD. |
| `/student/projects` | `routes/student/projects/index.tsx` | visible | role = student | Redirects → `/student/home` (the dashboard is the student's home) |
| `/student/projects/new` | `routes/student/projects/new.tsx` | visible | role = student | **Redirects → `/student/home`.** Submitting is the design-template SUBMIT WIZARD **modal** (`components/project/SubmitProjectModal`, 5 steps) opened from the dashboard "+ Submit a project" action, not a standalone page (STU-03…07). |
| `/student/grants/new` | `routes/student/grants/new.tsx` | visible | role = student | **Request a grant** (STU-14, P4) — a real standalone page (unlike project submission), matching the design-template CREATE GRANT REQUEST's single "Publish grant request" button; no draft state. Opened from the dashboard "+ Request a grant" action. |
| `/student/projects/$projectId` | `routes/student/projects/$projectId/index.tsx` | visible | role = student | Owner project view — design-template **PROJECT DETAIL** (`ProjectDetailView`, `viewer="owner"`): cover banner + two-column body + side rail; the manage card holds status · returned note · lifecycle actions (STU-09/10/11). |
| `/student/projects/$projectId/edit` | `routes/student/projects/$projectId/edit.tsx` | visible | role = student | Opens the **SUBMIT WIZARD modal prefilled** (`SubmitProjectModal project={…}`) with the re-review notice (STU-11); closing returns to the detail. |
| `/student/profile` | `routes/student/profile.tsx` | visible | role = student | Edit profile (STU-01) |
| `/sponsor/home` | `routes/sponsor/home.tsx` | visible | role = sponsor | Placeholder |
| `/sponsor/profile` | `routes/sponsor/profile.tsx` | visible | role = sponsor | Edit profile (SPN-01) |
| `/sponsor/subscription` | `routes/sponsor/subscription.tsx` | visible | role = sponsor | Subscription & billing (design-template) — tier picker (Scout/Alpha/Venture) + PayMongo payment (stubbed → P5) + seats/invoices. **Sponsor onboarding lands here** after role-confirm. |
| `/admin/dashboard` | `routes/admin/dashboard.tsx` | visible | role = admin | **Admin console** (P2) — design-template ADMIN: sticky 220px tab-rail (Review queue · Moderation · Metrics) + the review-decision **modal** (approve/return/reject). One page with tabs, not separate routes (ADM-01/03/04/05/06). Grant-request moderation → P4, metric charts → P4/P5. |

Layout files: `_public.tsx`, `_onboarding.tsx`, `_app.tsx` (pathless shells) and
`student.tsx`, `sponsor.tsx`, `admin.tsx` (role shells). All signed-in shells render
`components/layout/RoleNav` — the design-template HEADER (logo · role-aware center nav ·
notification bell · user pill). Nav per role (from the template): **student** Discover ·
Grants · My Projects · **sponsor** Discover · Deal-flow · Grants · **admin** Review Queue ·
Discover. `_app` derives the role from the live session; role shells pass their own role.

### Why role areas use a visible segment

With **pathless** groups, a child maps to a bare URL — so `_student/profile` and
`_sponsor/profile` would **both** resolve to `/profile` and collide at codegen. iskolar-main
avoids this by nesting a role sub-segment (`/profile/student/$id`). Academy instead makes the
role a real segment (`/student/*`, `/sponsor/*`, `/admin/*`): collision-free, the role is
visible in the URL, and every role area is trivially reachable for review. Cross-cutting
shells that should own top-level URLs (`/`, `/login`, `/u/$userId`) stay pathless.

---

## 3. Auth & guards (current state)

`src/auth.tsx` provides `AuthProvider` (wraps the app in `__root.tsx`) exposing
`{ user, role, isLoading, isSignedIn, refresh, logout }`. It reads the **live**
`GET /auth/session` endpoint (academy-server) via `lib/auth/api.ts → validateSessionQuery`,
mount-gated so SSR and the first client render both show a visitor (no hydration mismatch).
Set a dev `auth_token` cookie (academy-server `src/dev/mint-token.ts`) to sign in.

**Guards are live (as of `phases/P0-foundation.md` → Realized Build — Client)** and **client/effect-based**, not
`beforeLoad`. `src/hooks/auth/useRouteGuard.ts` reads the mount-gated session; each guarded
layout calls it and renders `components/layout/RouteFallback` until the session resolves —
so SSR and the first client render are identical (no mismatch) — then admits the route or
`navigate`s to a redirect. Modes:

- **`signed-in`** — `_app.tsx` (any confirmed role; unconfirmed → `/role-select`).
- **`role`** — `student.tsx` / `sponsor.tsx` / `admin.tsx` (wrong role → own area).
- **`onboarding`** — `_onboarding.tsx` (signed in + **un**confirmed; confirmed → own area).

> **Why not `beforeLoad`:** it runs on the SSR server where the dev `auth_token` cookie
> isn't present, so it would render `/login` server-side while the client renders the app →
> hydration mismatch + redirect flash. The effect-based guard avoids both. Guards are UX /
> defense-in-depth only — real enforcement is the server's `requireRole()`.

---

## 4. Blocked-on-server files (drop-in skeletons)

The client calls are **live** against the P0 endpoint contract; the server delivers the
matching handlers (`academy-server/documentation/phases/P0-foundation-server.md`):

- `lib/auth/api.ts` — `validateSessionQuery` (`GET /auth/session`), `ssoLoginUrl`.
- `lib/account/api.ts` — `myProfileQuery` (`GET /accounts/me/profile`), `profileQuery`
  (`GET /accounts/:id/profile`), `updateMyProfile` (`PATCH /accounts/me/profile`),
  `confirmRole` (`POST /accounts/me/role`), `logoutRequest` (`POST /auth/logout`).
- `lib/auth/model.ts`, `lib/account/model.ts` — **real** types/enums/Zod. `AccountProfile`
  view model, `profileEditSchema` (the template's four fields), `roleConfirmSchema`.
- `hooks/auth`, `hooks/account` — real React Query wrappers (`useMyProfile`, `useProfile`,
  `useUpdateProfile`, `useConfirmRole`, `useRouteGuard`).
- `ProfileEditForm` / `ProfileView` — rebuilt 1:1 to the template; **real** submit + query.

Until the server `account` slice ships, profile/onboarding surfaces show their loading /
not-found / error states in dev — sign in by minting a dev token.

---

## 5. Conventions

- **Package manager:** pnpm. **Path alias:** `#/*` → `src/*`.
- **Styling:** Tailwind v4 + tokens in `styles.css` (named by usage). Prefer the role
  utilities (`text-content-soft`, `bg-surface-tint`, `text-action`) and fixed-component
  classes (`.card-surface`, `.chip`, `.status-pill`, `.eyebrow`, `.container-page`).
- **UI primitives — Shadcn for behavior, template classes for visuals** (see
  `05-shadcn-library-adoption.md`): interactive primitives come from `components/ui/*`
  (Radix behavior, restyled 1:1 to the design-template — Dialog, DropdownMenu, Switch,
  Tabs, Checkbox, Button, sonner Toaster). Buttons: `<Button variant size>` (cva) is the
  single source going forward; `.btn-*` classes retire as surfaces migrate. Static
  surfaces (cards/chips/pills) stay hand-rolled token classes. Native `<select>` stays
  native. **Rule:** a package enters `package.json` only with a consumer in the same change.
- **After route changes:** `pnpm generate-routes` → `pnpm exec biome check --write` →
  `pnpm build`.
