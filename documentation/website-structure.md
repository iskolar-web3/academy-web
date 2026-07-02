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
| **auth** | `_public/login`, `_onboarding/role-select` | `lib/auth/{api,model}.ts` | `hooks/auth/useSession.ts` | — |
| **account** | `student/profile`, `sponsor/profile`, `_app/u/$userId` | `lib/account/{api,model}.ts` | `hooks/account/{useProfile,useUpdateProfile}.ts` | `components/account/{ProfileView,ProfileEditForm,StudentProfileCard}.tsx` |
| **project** | `student/home` (dashboard), `student/projects/*` | `lib/project/{api,model,helper,mock}.ts` | `hooks/project/{useMyProjects,useProject,useProjectMutations}.ts` | `components/project/{ProjectStatusBadge,ProjectPipeline,MyProjectCard,ProjectForm/*}.tsx` |
| **discover** | `_app/discover` (gallery), `_app/grants` (P4 stub) | `lib/discover/mock.ts` | (P3) | `components/discover/DiscoverCard.tsx`, `components/project/ProjectCard.tsx` (landing teaser) |
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
| `/role-select` | `routes/_onboarding/role-select.tsx` | pathless | signed-in, no role | Role confirm (PLT-04) |
| `/u/$userId` | `routes/_app/u.$userId.tsx` | pathless | any signed-in | Public profile (STU-02/SPN-02) |
| `/discover` | `routes/_app/discover.tsx` | pathless | any signed-in | Showcase gallery (SPN-03) — toolbar + card grid; search filters mock client-side, server search/filters/sort → P3 |
| `/grants` | `routes/_app/grants.tsx` | pathless | any signed-in | Grants placeholder (P4) |
| `/student/home` | `routes/student/home.tsx` | visible | role = student | **Student dashboard** (STU-09): profile sidebar + stat tiles + project pipeline cards. 1:1 with design-template STUDENT DASHBOARD. |
| `/student/projects` | `routes/student/projects/index.tsx` | visible | role = student | Redirects → `/student/home` (the dashboard is the student's home) |
| `/student/projects/new` | `routes/student/projects/new.tsx` | visible | role = student | Submission wizard (STU-03…07) |
| `/student/projects/$projectId` | `routes/student/projects/$projectId/index.tsx` | visible | role = student | Owner project view |
| `/student/projects/$projectId/edit` | `routes/student/projects/$projectId/edit.tsx` | visible | role = student | Edit + re-review (STU-11) |
| `/student/profile` | `routes/student/profile.tsx` | visible | role = student | Edit profile (STU-01) |
| `/sponsor/home` | `routes/sponsor/home.tsx` | visible | role = sponsor | Placeholder |
| `/sponsor/profile` | `routes/sponsor/profile.tsx` | visible | role = sponsor | Edit profile (SPN-01) |
| `/admin/dashboard` | `routes/admin/dashboard.tsx` | visible | role = admin | Placeholder (queue → P2) |

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
`{ user, role, isLoading, isSignedIn, refresh, logout }`. It now reads the **live**
`GET /auth/session` endpoint (academy-server) via `lib/auth/api.ts → validateSessionQuery`,
mount-gated so SSR and the first client render both show a visitor (no hydration mismatch).
Set a dev `auth_token` cookie (academy-server `src/dev/mint-token.ts`) to sign in. Route
**guards are still commented**, so screens remain reachable without a session for review.

Each role/onboarding layout carries its **real guard as commented code** modeled on
iskolar-main (`beforeLoad` → `context.auth.getSession()` → `redirect`). Wiring auth (P0)
is three steps:

1. `src/auth.tsx` — replace the stub with silent SSO validation
   (`lib/auth/api.ts → validateSessionQuery`) + provisioning.
2. `src/router.tsx` — pass `auth` into the router context so `beforeLoad` can read it.
3. Uncomment the `beforeLoad` blocks in `_onboarding.tsx`, `_app.tsx`, `student.tsx`,
   `sponsor.tsx`, `admin.tsx`.

> Guards are UX / defense-in-depth only. Real enforcement is the server's `requireRole()`.

---

## 4. Blocked-on-server files (drop-in skeletons)

These exist with **final signatures** so server code drops straight in — no restructuring:

- `lib/auth/api.ts` — `validateSessionQuery` is **live** (`GET /auth/session`). `lib/account/api.ts`
  still throws `"… not wired yet"`; query keys / signatures are final so hooks/UI build against them.
- `lib/auth/model.ts`, `lib/account/model.ts` — **real** (types/enums/Zod are known from the
  PRD, not blocked). `AcademyRole`, `SponsorKind`, profile shapes + edit schemas.
- `hooks/auth`, `hooks/account` — real React Query wrappers over the stubbed lib calls.
- `ProfileEditForm` — real validation; submit is a **mock** (`console.log` + local note)
  until the mutation is wired.

The `Dev preview` block on `/login` and the mock data in `_app/u/$userId` and the role home
pages are **temporary** — remove/replace when auth + real queries land.

---

## 5. Conventions

- **Package manager:** pnpm. **Path alias:** `#/*` → `src/*`.
- **Styling:** Tailwind v4 + tokens in `styles.css` (named by usage). Prefer the role
  utilities (`text-content-soft`, `bg-surface-tint`, `text-action`) and fixed-component
  classes (`.btn`, `.card-surface`, `.chip`, `.status-pill`, `.eyebrow`, `.container-page`).
- **After route changes:** `pnpm generate-routes` → `pnpm exec biome check --write` →
  `pnpm build`.
