# academy-client — Website Structure

**Status:** 🔨 Living reference · **Date:** 2026-07-01 · **Repo:** academy-client
**Traces to:** Plan §3 (architecture), [`../05-foundation.md`](../05-foundation.md)

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
| **auth** | `_onboarding/role-select`, `_onboarding/basic-info` — no standalone `/login` route | `lib/auth/{api,model}.ts` | `hooks/auth/{useSession,useConfirmRole,useCompleteOnboarding,useRouteGuard,useSignInAction}.ts` | `components/layout/RouteFallback.tsx` (guard fallback), `components/landing/SignInPopover.tsx`, `components/ui/{popover,calendar}.tsx` |
| **account** | `student/profile`, `sponsor/profile`, `_app/u/$userId`, `_app/settings` | `lib/account/{api,model}.ts` | `hooks/account/{useProfile,useUpdateProfile,useProfilePanel}.ts` | `components/account/{ProfileView,ProfileEditForm,StudentProfileCard}.tsx` |
| **project** | `student/home` (dashboard), `student/projects/*` | `lib/project/{api,model,helper}.ts` | `hooks/project/{useMyProjects,useProject,useProjectMutations}.ts` | `components/project/{ProjectPipeline,MyProjectCard,ProjectStatusBadge,UpvoteButton,SubmitProjectModal,ProjectDetailView,IncomingInvites}.tsx` |
| **discover** | `_app/discover` (gallery), `_app/projects.$projectId` (public detail) | `lib/discover/{api,model}.ts` (live; mock **deleted** in P3) | `hooks/discover/useProjectGallery.ts` | `components/discover/{DiscoverCard,SponsorRail}.tsx`, `components/project/ProjectCard.tsx` (landing teaser) |
| **grant** | `_app/grants` (gallery), `_app/grants.$grantId` (detail + fund), `student/grants/new` (create) | `lib/grant/{api,model,helper}.ts` | `hooks/grant/{useGrants,useMyGrants,useGrantMutations}.ts` | `components/grant/{GrantCard,GrantDetailView,GrantFundPanel,GrantForm}.tsx` |
| **interest** | (surfaces on detail + cards) | `lib/interest/api.ts` | `hooks/interest/useInterest.ts` | `components/interest/InterestButton.tsx` |
| **upvote** | (control on cards + detail) | `lib/upvote/api.ts` | `hooks/upvote/useToggleUpvote.ts` | `components/project/UpvoteButton.tsx` (controlled, sm/lg) |
| **notification** | `_app/notifications` | `lib/notification/{api,model}.ts` | `hooks/notification/{useNotifications,useNotificationMutations}.ts` | `components/notification/NotificationItem.tsx`, bell in `RoleNav`, `components/project/IncomingInvites.tsx` (invites feed) |
| **review** | `admin/dashboard` (console) | `lib/review/{api,model}.ts`, `lib/metrics/api.ts` | `hooks/review/{useReviewQueue,useReviewDecision}.ts`, `hooks/metrics/usePlatformMetrics.ts` | `components/admin/{ReviewQueuePanel,ReviewDecisionModal,ModerationPanel,MetricsPanel,BadgeGrantForm}.tsx` |
| **subscription** | `sponsor/subscription` | `lib/subscription/{api,model,helper}.ts` | `hooks/subscription/{useMySubscription,useEntitlement,useSubscriptionMutations}.ts` | `components/subscription/{PlanTable,TierConfirmModal,SeatManager}.tsx` |
| **saved-search** (watchlist only — no saved-query entity, see the P5 phase doc) | (rail toggle + card control) | `lib/saved-search/api.ts` | `hooks/saved-search/useWatchlist.ts` | Toggle lives on `components/discover/DealFlowCard.tsx` + `SponsorRail` |
| **vault** | `student/vaults` (owner), sponsor rail button on `_app/projects.$projectId` | `lib/vault/api.ts` | `hooks/vault/{useVault,useVaultAccess}.ts` | `components/vault/{VaultManager,VaultAccessRequests,VaultAccessButton}.tsx` |
| **badge** | `admin/dashboard` (Badges tab) | `lib/badge/api.ts` | `hooks/badge/useGrantBadge.ts` | `components/admin/BadgeGrantForm.tsx`; renders on `DiscoverCard`/`ProjectDetailView` via `Project.verified` |
| **landing** | `_public/` (index) | — | — | `components/landing/*` |

> The **component folder shares the domain name** (`components/account`, not
> `components/profile`) so a slice never splits across two names.

> **Shared 3-column page shell — cross-cutting, `components/layout/`.**
> `AppPageLayout.tsx` (left / middle / right grid) + `AdsPanel.tsx` (hardcoded placeholder
> ad slots) wrap `/discover`, `/grants`, `/grants/$grantId`, `/sponsor/home`, and
> `/student/home` — never `/settings`, `/student/profile` / `/sponsor/profile`, or
> `/notifications`. Left column is role-conditional: `SponsorRail` for sponsors,
> `StudentProfileCard` (via `hooks/account/useProfilePanel`) for student/admin — both moved
> from their old per-page placement into this one shared shell.

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
| `/` | `routes/_public/index.tsx` | pathless | none | Visitor landing (PLT-06). Sign-in lives here — every "Sign in" affordance (header, hero CTA, bottom CTA) opens `SignInPopover`, anchored below the trigger, over `useSignInAction`. **No standalone `/login` route** — deleted; guards/logout/settings sign-out redirect to `/` instead. |
| `/role-select` | `routes/_onboarding/role-select.tsx` | pathless | signed-in, no role | Role confirm (PLT-04) — one click per role, then always continues to `/basic-info` next (a sponsor's subscription-tier pick moved to *after* basic-info). |
| `/basic-info` | `routes/_onboarding/basic-info.tsx` | pathless | signed in, role confirmed, onboarding not complete | **Basic-info onboarding step**, one form per role, matching iSkolar-main's actual onboarding UI: student gets a real date-of-birth picker (`components/ui/calendar.tsx` on `react-day-picker`, Popover-anchored, "Set birth date" placeholder, future dates disabled) and placeholder-first `<select>`s for gender ("Select your gender") and education level ("Select your education level" — options read "Secondary Education (High School)"/"Tertiary Education (Higher Education)", matching iSkolar-main's exact option copy). Every field is genuinely required — `mode: "onBlur"` + the Continue button disabled until `formState.isValid`, so no field silently defaults to a chosen value the user never picked. Submits to `POST /accounts/me/onboarding`, which flips `onboardingCompleted`; a sponsor continues to `/sponsor/subscription`, others land in their role home. |
| `/u/$userId` | `routes/_app/u.$userId.tsx` | pathless | any signed-in | Public profile (STU-02/SPN-02) |
| `/discover` | `routes/_app/discover.tsx` | pathless | any signed-in | Showcase gallery (SPN-03/04/05) — toolbar + card grid over the **live** published projection; search/category/sort live in the **URL search params** and run server-side; wrapped in `AppPageLayout` — left column `SponsorRail` (sponsor) or `StudentProfileCard` (student/admin), right column `AdsPanel`. |
| `/grants` | `routes/_app/grants.index.tsx` | pathless | any signed-in | **Grants gallery** (SPN-09, P4) — every grant regardless of status. Design-template GRANTS GALLERY, wrapped in the same `AppPageLayout` left/right treatment as `/discover`. File is `grants.index.tsx`, not `grants.tsx` — see the note below the URL map for why. |
| `/grants/$grantId` | `routes/_app/grants.$grantId.tsx` | pathless | any signed-in | **Grant detail + fund flow** (SPN-10, P4) — design-template GRANT DETAIL + FUND FLOW; sponsor gets the inline simulated-checkout rail (`GrantFundPanel`), everyone else a read-only note. Same `AppPageLayout` left/right treatment. |
| `/projects/$projectId` | `routes/_app/projects.$projectId.tsx` | pathless | any signed-in | Public/sponsor **project detail** — design-template PROJECT DETAIL over `GET /discover/projects/:id`; interact rail = large upvote (PLT-08) + sponsor "I'm interested" (SPN-07, idempotent) + sponsor **"Request vault access"** (SPN-16, P5, `VaultAccessButton`, Alpha+ entitlement-gated — matches the template's `vaultLabel`/`onVault` on the same detail view-model as the interest button) + privacy note. |
| `/notifications` | `routes/_app/notifications.tsx` | pathless | any signed-in | **Notifications page** (PLT-07) — design-template NOTIFICATIONS PAGE: unread count, Mark all read, per-type rows linking to entities (a `sponsor_interest` row links to the sponsor's profile — the STU-13 reveal). Reached from the header bell. |
| `/settings` | `routes/_app/settings.tsx` | pathless | any signed-in | Settings (design-template SETTINGS PAGE) — alerts toggle · digest/language · account/privacy · Log out. Opened from the header account dropdown. |
| `/student/home` | `routes/student/home.tsx` | visible | role = student | **Student dashboard** (STU-09): `AppPageLayout` left = `StudentProfileCard` (now sourced from the real profile via `useProfilePanel`, not a hardcoded placeholder) + stat tiles + project pipeline cards + **Grant payouts** section (P4, STU-15), right = `AdsPanel`. 1:1 with design-template STUDENT DASHBOARD otherwise. |
| `/student/projects` | `routes/student/projects/index.tsx` | visible | role = student | Redirects → `/student/home` (the dashboard is the student's home) |
| `/student/projects/new` | `routes/student/projects/new.tsx` | visible | role = student | **Redirects → `/student/home`.** Submitting is the design-template SUBMIT WIZARD **modal** (`components/project/SubmitProjectModal`, 5 steps) opened from the dashboard "+ Submit a project" action, not a standalone page (STU-03…07). |
| `/student/grants/new` | `routes/student/grants/new.tsx` | visible | role = student | **Request a grant** (STU-14, P4) — a real standalone page (unlike project submission), matching the design-template CREATE GRANT REQUEST's single "Publish grant request" button; no draft state. Opened from the dashboard "+ Request a grant" action. |
| `/student/projects/$projectId` | `routes/student/projects/$projectId/index.tsx` | visible | role = student | Owner project view — design-template **PROJECT DETAIL** (`ProjectDetailView`, `viewer="owner"`): cover banner + two-column body + side rail; the manage card holds status · returned note · lifecycle actions (STU-09/10/11). |
| `/student/projects/$projectId/edit` | `routes/student/projects/$projectId/edit.tsx` | visible | role = student | Opens the **SUBMIT WIZARD modal prefilled** (`SubmitProjectModal project={…}`) with the re-review notice (STU-11); closing returns to the detail. |
| `/student/profile` | `routes/student/profile.tsx` | visible | role = student | Edit profile (STU-01) |
| `/student/vaults` | `routes/student/vaults.tsx` | visible | role = student | **Pitch vaults** (STU-17/18, P5) — design-template STUDENT VAULTS: "Your vaults" (upload docs, implicit per project) + "Access requests" (Approve 14d / Deny / Revoke). Reached from the account dropdown's "My pitch vaults" and `vault_request` notifications. |
| `/sponsor/home` | `routes/sponsor/home.tsx` | visible | role = sponsor | **Deal-flow board** (SPN-13, P5) — a real feed over P3's trending published projects (design-template SPONSOR DEAL-FLOW's card shape, honest captions — see the P5 phase doc for why the template's own "followed builder" framing was dropped). `AppPageLayout` left = `SponsorRail` (moved from its old right-side placement), right = `AdsPanel`. |
| `/sponsor/profile` | `routes/sponsor/profile.tsx` | visible | role = sponsor | Edit profile (SPN-01) |
| `/sponsor/subscription` | `routes/sponsor/subscription.tsx` | visible | role = sponsor | **Subscription & billing** (SPN-12, P5) — real tier picker (Scout/Alpha/Venture Partner) against a real `subscription` row; paid tiers open `TierConfirmModal`'s simulated checkout (Authorize → redirect pause → success). Invoices stay empty (no real billing cycle yet). **Sponsor onboarding lands here** after role-confirm. |
| `/admin/dashboard` | `routes/admin/dashboard.tsx` | visible | role = admin | **Admin console** (P2, +P4 moderation, +P5 badges) — design-template ADMIN: sticky 220px tab-rail (Review queue · Moderation · Metrics · **Badges**, P5, `BadgeGrantForm` — no template screen for this tab, composed since the admin-grant *source* was already settled, see the P5 phase doc) + the review-decision **modal** (approve/return/reject). One page with tabs, not separate routes (ADM-01/02/03/04/05/06/07). |

Layout files: `_public.tsx`, `_onboarding.tsx`, `_app.tsx` (pathless shells) and
`student.tsx`, `sponsor.tsx`, `admin.tsx` (role shells). All signed-in shells render
`components/layout/RoleNav` — the design-template HEADER (logo · role-aware center nav ·
notification bell · user pill). Nav per role (from the template): **student** Discover ·
Grants · My Projects · **sponsor** Discover · Deal-flow · Grants · **admin** Review Queue ·
Discover. `_app` derives the role from the live session; role shells pass their own role.

### A list + detail pair sharing a path prefix must use `.index.tsx`

**Real bug, found 2026-07-20**: `grants.$grantId.tsx` used to sit alongside a bare
`grants.tsx` (the gallery). TanStack Router's flat-file convention treats a dot-segment
file as a **child** of the file one segment shorter if that file exists — so
`grants.$grantId.tsx` was silently nested *under* `grants.tsx`, needing an `<Outlet/>` in
`grants.tsx` to ever render. It had none. Clicking "View grant →" (or a direct link)
changed the URL and fetched the right grant correctly (confirmed via the server request
log) — the click "did" something — but nothing was ever mounted to show it, so the
gallery just stayed on screen. No console error, no failed request — the router matched
successfully, it just had nowhere to render the child into.

**Fix:** renamed `grants.tsx` → `grants.index.tsx` (exact-match index route, matches
`/grants` only). `grants.$grantId.tsx`'s parent in `routeTree.gen.ts` is now `_app`
directly, a true sibling of the index route, not a child of it — confirmed by reading the
generated `getParentRoute` wiring, and by re-driving the click in a real (Playwright)
browser against the live server before/after. `discover.tsx` never had this problem only
because its detail route lives under a different prefix (`projects.$projectId.tsx`), not
because the pattern is inherently safe — **any future list+detail pair sharing a literal
prefix needs the list route named `<prefix>.index.tsx`, not bare `<prefix>.tsx`**, same as
the already-established `student/projects/index.tsx` + `student/projects/$projectId/`
pattern elsewhere in this route tree.

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

**Guards are live (as of `../05-foundation.md`)** and **client/effect-based**, not
`beforeLoad`. `src/hooks/auth/useRouteGuard.ts` reads the mount-gated session; each guarded
layout calls it and renders `components/layout/RouteFallback` until the session resolves —
so SSR and the first client render are identical (no mismatch) — then admits the route or
`navigate`s to a redirect. Not signed in at all → `/` (the landing page, whose header/hero/
bottom CTA all open `SignInPopover`) — there's no `/login` route to redirect to. Modes:

- **`signed-in`** — `_app.tsx` (any confirmed role; unconfirmed → `/role-select`; role
  confirmed but `onboardingCompleted: false` → `/basic-info`).
- **`role`** — `student.tsx` / `sponsor.tsx` / `admin.tsx` (same onboarding checks as above;
  wrong role → own area).
- **`onboarding`** — `_onboarding.tsx` (signed in + **not fully onboarded** — role
  unconfirmed **or** `onboardingCompleted: false`; fully onboarded → own area). Each of
  `role-select.tsx`/`basic-info.tsx` also forwards itself once its own step is already done
  (e.g. landing back on `/role-select` after confirming redirects straight to
  `/basic-info`), so the two steps stay in order even with browser back/forward.

> **Why not `beforeLoad`:** it runs on the SSR server where the dev `auth_token` cookie
> isn't present, so it would render `/login` server-side while the client renders the app →
> hydration mismatch + redirect flash. The effect-based guard avoids both. Guards are UX /
> defense-in-depth only — real enforcement is the server's `requireRole()`.

---

## 4. Blocked-on-server files (drop-in skeletons)

The client calls are **live** against the P0 endpoint contract; the server delivers the
matching handlers (`academy-server/documentation/03-foundation-server.md`):

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
  `../03-shadcn-library-adoption.md`): interactive primitives come from `components/ui/*`
  (Radix behavior, restyled 1:1 to the design-template — Dialog, DropdownMenu, Switch,
  Tabs, Checkbox, Button, sonner Toaster). Buttons: `<Button variant size>` (cva) is the
  single source going forward; `.btn-*` classes retire as surfaces migrate. Static
  surfaces (cards/chips/pills) stay hand-rolled token classes. Native `<select>` stays
  native. **Rule:** a package enters `package.json` only with a consumer in the same change.
- **After route changes:** `pnpm generate-routes` → `pnpm exec biome check --write` →
  `pnpm build`.
