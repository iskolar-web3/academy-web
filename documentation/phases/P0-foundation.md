# Phase P0 — Foundation (SSO · Provisioning · Roles · Security · Profiles · Landing)

**Status:** 🔨 In progress — **client done** (2026-07-03, see "Realized Build — Client" below); server assigned (`academy-server/documentation/phases/P0-foundation-server.md`)
**Target:** before any other phase (gating)
**Repo(s):** academy-client (this doc) · academy-server (`auth.ts`, `account/`)
**Traces to:** PRD — FR-A1…A7, FR-P1…P5, FR-S1…S10, FR-N3 · Plan — §3, §6, §7 (Phase 0) · Stories — PLT-01, PLT-02, PLT-03, PLT-04, PLT-05, PLT-06, STU-01, STU-02, SPN-01, SPN-02
**Commit/PR:** —

> **Progress (2026-07-03):** The **client half is shipped** — silent SSO validation
> (PLT-01/03), landing + top-3 (PLT-06), route guards (PLT-05, client/effect-based),
> onboarding role-confirm (PLT-04), and profile edit + public view (STU-01/02, SPN-01/02)
> are all wired to the endpoint contract and rebuilt 1:1 to the design-template. See
> the "Realized Build — Client" section below. What remains is the **server** `account` slice + SSO
> login/logout — assigned in `academy-server/documentation/phases/P0-foundation-server.md`.
> The "Planned Build" tables below are the original before-progress plan (kept for trace).

## Realized Build — Client (2026-07-03)

The P0 client work shipped across two increments, both consolidated here — **this doc is the
canonical P0 record** (the standalone `02`/`05` build-order docs were folded in). Note the
sibling `03-student-dashboard.md` is **P1** (STU-09/10/11) and `04-app-header-and-discover-gallery.md`
is **split** — its HEADER/RoleNav is the P0 shared shell (below), its Discover gallery is **P3**
(SPN-03).

### Increment A — Auth: server↔client session wiring (2026-07-02, PLT-01/02/03)

1. **Env contract** — `.env` / `.env.example`: `VITE_BACKEND_URL=http://localhost:5000`
   (matches server `PORT`) + `VITE_ISKOLAR_SSO_URL` placeholder (`.env` gitignored).
2. **Live session query + real wire shape** — `src/lib/auth/api.ts`, `model.ts`:
   `validateSessionQuery()` calls `apiFetch("/auth/session")`, parses `data` with
   `academyUserSchema`, returns `null` on 401/unreachable; `ssoLoginUrl()` targets iSkolar-main
   SSO (empty until configured). The client consumes the raw `academy_user` today, not the
   aspirational `SessionUser` (server step-9 work).
3. **AuthProvider reads the live session (SSR-safe)** — `src/auth.tsx`, `hooks/auth/useSession.ts`:
   `{ user, role, isLoading, isSignedIn, refresh, logout }`. The `useQuery` is **mount-gated**
   (`enabled: mounted`) so SSR + first client render both show a visitor (identical markup, no
   hydration mismatch); the real fetch runs client-side where the `auth_token` cookie exists.
   `role` is `academyRole` only once `roleConfirmed`, else `null` (→ onboarding).
4. **Sign-in routing** — landing "Sign in" CTAs route to `/login`; `/login` re-checks the
   session (dev-token flow) since academy-server hosts no login page. (A throwaway
   `_app/discover` debug panel proved the wire, then was removed and rebuilt as the real
   gallery in the `04` increment.)

Key decisions: consume raw `academy_user` (one-line swap to `SessionUser` later); return
`null` on any session error (silent check → treat as visitor); mount-gate for SSR/client
parity; no hosted login on academy-server (real login is iSkolar-main SSO; dev mints a token).

### Increment B — Guards · account API · onboarding · profiles (2026-07-03)

1. **Client route guards (PLT-05, defense-in-depth).** `src/hooks/auth/useRouteGuard.ts` +
   `src/components/layout/RouteFallback.tsx`, applied in `_app.tsx`, `student.tsx`, `sponsor.tsx`,
   `admin.tsx`, `_onboarding.tsx`. Modes `signed-in` / `role` / `onboarding`. Reads the
   mount-gated session so SSR + first client render show the deterministic `RouteFallback`
   (no hydration mismatch); then admits the route or `navigate`s a redirect. The old commented
   `beforeLoad` blocks are gone. Real enforcement stays server-side (`requireRole()`).
2. **Account API — real endpoints.** `src/lib/account/api.ts` + `model.ts`: `myProfileQuery`,
   `profileQuery(userId)`, `updateMyProfile`, `confirmRole`, `logoutRequest`; `AccountProfile`
   view model + `profileEditSchema` (the template's four fields) + `roleConfirmSchema` +
   `roleLabel()`. Endpoints: `GET /accounts/me/profile`, `GET /accounts/:id/profile`,
   `PATCH /accounts/me/profile`, `POST /accounts/me/role`, `POST /auth/logout`.
3. **Hooks.** `hooks/account/{useProfile(+useMyProfile),useUpdateProfile}`,
   `hooks/auth/useConfirmRole`. `useUpdateProfile` seeds the fresh record + invalidates
   profile/session; `useConfirmRole` writes the updated `academy_user` into the session cache
   so the onboarding guard re-evaluates.
4. **Onboarding** (`routes/_onboarding/role-select.tsx`) — rebuilt 1:1 to the template
   ONBOARDING screen (eyebrow + side-ticks, vertical role cards, sponsor sub-kind picker),
   wired to `useConfirmRole` → routes by role (PLT-04).
5. **Profile edit** (`components/account/ProfileEditForm.tsx`, `routes/{student,sponsor}/profile.tsx`)
   — rebuilt to the template EDIT PROFILE PAGE (gradient band, avatar tile, four fields,
   Cancel/Save); prefills via `useMyProfile`, saves via `useUpdateProfile` (STU-01/SPN-01).
6. **Public profile** (`components/account/ProfileView.tsx`, `routes/_app/u.$userId.tsx`) —
   rebuilt to the template PROFILE VIEW PAGE (banner + Back, 128px avatar, name/headline/org,
   About + work + stats/skills aside); reads real `useProfile(userId)` with loading/not-found
   states; `canEdit` only on own profile (STU-02/SPN-02).
7. **Login / logout / header.** `/login` drops the guard-bypassing dev jumps and routes by
   role; `auth.tsx → logout` calls `logoutRequest()` then clears local session; RoleNav's
   Profile link is role-aware.

### Decisions (Increment B)

- **Client-effect guards over `beforeLoad`** — `beforeLoad` runs on the SSR server (no dev
  cookie) → would render `/login` server-side while the client renders the app → hydration
  mismatch + redirect flash. The effect-based guard renders a stable fallback until the
  mount-gated session resolves, keeping SSR and first render identical.
- **Unified 4-field edit form** — the template's edit page is identical for every role
  (Display name / Headline / School-or-org / Bio); followed verbatim. Richer `student_profile`
  columns (specialty/skills/links) are displayed/seeded, not edited in P0.
- **Real queries replace mocks now** — profile surfaces hit live endpoints (with loading/
  error/not-found states) so the client is genuinely finished and the server has a concrete
  contract; until the server `account` slice ships they show those states in dev.

### Verification (client)

- Session wire (Increment A): `GET /auth/session` → 401 without cookie (client → visitor),
  200 `{ data: academy_user }` with a dev cookie (parses `academyUserSchema`).
- `pnpm exec biome check --write src` — clean (only the pre-existing Hero
  `noStaticElementInteractions` warning remains).
- `pnpm exec tsc --noEmit` — **exit 0**. `pnpm build` — **client + SSR built** (`✓`).
- Hydration: guards render deterministic `RouteFallback` during SSR/first render; no
  non-deterministic render values. `<html>`/`<body>` carry `suppressHydrationWarning` to absorb
  browser-extension attribute injection (ColorZilla `cz-shortcut-listen`, Grammarly `data-gr-*`).

### Server hand-off

The remaining P0 work is the server `account` slice + SSO login/logout, assigned in
`academy-server/documentation/phases/P0-foundation-server.md` (the endpoint contract above is
the fixed interface).

## Goal

Stand up the identity + security spine and the first viewable surfaces: silently validate the iSkolar SSO cookie, provision an `academy_user` on first token, run role onboarding, enforce role/route guards, let users edit + view profiles, and render the unauthenticated landing with the top-3 most-recent published cards. Nothing else can be built until a request can be authenticated and routed by role.

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| PLT-01 | SSO auto sign-in | silent cookie validation on load |
| PLT-02 | Registration delegation | `_public/login` → redirect to iSkolar |
| PLT-03 | Account provisioning | post-token provisioning handshake |
| PLT-04 | Role onboarding | `_onboarding/` role + sponsor sub-kind |
| PLT-05 | Access control & security | route guards + (server) middleware envelope |
| PLT-06 | Visitor landing & preview | `_public/` landing + top-3 cards |
| STU-01 | Edit my (student) profile | `_student/profile` |
| STU-02 | Public profile | `_app/u/$userId` |
| SPN-01 | Edit my (sponsor) profile | `_sponsor/profile` |
| SPN-02 | Sponsor public profile | `_app/u/$userId` (sponsor variant) |

## Planned Build (by FE slice)

### Cross-cutting / root
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/auth.tsx` | root context | **Create** | `AuthProvider` — holds `{ user, profile, isLoading }`; on mount calls session validation; exposes `getSession()`, `logout()`. Hydrated from server, mirrors iSkolar `auth.tsx`. |
| `src/lib/api.ts` | shared | **Create** | Base `fetch` wrapper (`credentials:"include"` → `VITE_BACKEND_URL`), error normalization, `getDefaultPathOfRole(role)` for post-login redirect. |
| `src/router.tsx` | root | **Affect** | Pass `auth` into router context so `beforeLoad` guards can call `getSession()`. |
| `src/routes/__root.tsx` | route | **Affect** | Wrap app in `AuthProvider`; mount notification shell placeholder (filled P3). |

### `auth` / `account` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/auth/api.ts` | lib | **Create** | `validateSessionQuery()`, `provisionUser()`, SSO redirect URL builder. |
| `src/lib/auth/model.ts` | lib | **Create** | `AcademyRole` (student \| sponsor \| admin), `SponsorKind` (investor \| recruiter \| employer), session Zod schemas. |
| `src/lib/account/api.ts` | lib | **Create** | `getProfileQuery(userId)`, `updateStudentProfile()`, `updateSponsorProfile()`, `confirmRole()`. |
| `src/lib/account/model.ts` | lib | **Create** | `StudentProfile`, `SponsorProfile` types + edit Zod schemas (lengths, URL format). |
| `src/hooks/auth/useSession.ts` | hook | **Create** | Reads AuthProvider; exposes `user`, `isLoading`. |
| `src/hooks/account/useProfile.ts` | hook | **Create** | Query a profile by id. |
| `src/hooks/account/useUpdateProfile.ts` | hook | **Create** | Mutation + `invalidateQueries` on success. |

### Routes (groups + guards)
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_public/route.tsx` | route | **Create** | Public layout; no guard. |
| `src/routes/_public/index.tsx` | route | **Create** | Landing (marketing) + top-3 preview (PLT-06). |
| `src/routes/_public/login.tsx` | route | **Create** | "Sign in" → redirect to iSkolar hosted login; "Register" → iSkolar register (PLT-02). No credential form. |
| `src/routes/_onboarding/route.tsx` | route | **Create** | Guard: signed-in but unconfirmed role → here; else bounce. |
| `src/routes/_onboarding/role-select.tsx` | route | **Create** | Confirm seeded role; sponsor picks sub-kind (PLT-04). |
| `src/routes/_app/route.tsx` | route | **Create** | Guard: any signed-in role; shared signed-in shell. |
| `src/routes/_app/u/$userId.tsx` | route | **Create** | Public profile page, student + sponsor variants (STU-02, SPN-02). |
| `src/routes/_student/route.tsx` | route | **Create** | `beforeLoad` role guard = student (PLT-05). |
| `src/routes/_student/profile.tsx` | route | **Create** | Edit own student profile (STU-01). |
| `src/routes/_sponsor/route.tsx` | route | **Create** | `beforeLoad` role guard = sponsor. |
| `src/routes/_sponsor/profile.tsx` | route | **Create** | Edit own sponsor profile (SPN-01). |
| `src/routes/_admin/route.tsx` | route | **Create** | `beforeLoad` role guard = admin (used from P2). |
| `src/routeTree.gen.ts` | generated | **Affect** | Regenerate via `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/landing/Hero.tsx` | component | **Create** | Landing hero / value prop. |
| `src/components/landing/RecentProjectsPreview.tsx` | component | **Create** | Renders top-3 published cards (card only, no detail). |
| `src/components/account/ProfileView.tsx` | component | **Create** | Public profile renderer (specialty/skills subheader; published-work list slot — populated P1+). |
| `src/components/account/ProfileEditForm.tsx` | component | **Create** | react-hook-form + Zod edit form (student & sponsor variants). |
| `src/components/layout/RoleNav.tsx` | component | **Create** | Shared signed-in shell chrome (cross-cutting, not a domain slice). |
| `src/components/ui/*` | component | **Affect** | Add needed Shadcn primitives via `pnpm dlx shadcn@latest add …`. |

> **Component domain naming:** profile UI lives in `components/account/` (not `components/profile/`) so it shares the `account` domain name with `lib/account` + `hooks/account` — one domain, four folders. See [`../website-structure.md`](../website-structure.md) for the realized route-group convention (role areas use a **visible** `/student|/sponsor|/admin` segment; cross-cutting shells stay pathless).

### Server (academy-server — for cross-reference)
`auth.ts` (validate iSkolar JWT, `requireRole()`), `account/` slice (provisioning + profile CRUD), `db.ts` + Goose migrations for `academy_user`, `student_profile`, `sponsor_profile`. Middleware chain: requestId → logging → CSRF → CORS → secureHeaders → auth → requireRole → Zod validator.

## Implementation Process (ordered)

1. **Settle §3 token contract first** (HS256 vs RS256/JWKS, cookie domain, login method b). Blocking — do not start FE auth until pinned.
2. Build `lib/api.ts` wrapper + `auth.tsx` provider; wire into `router.tsx` context and `__root.tsx`.
3. Implement silent session validation on load (PLT-01) → route to role area or `_public/login`.
4. Implement provisioning handshake (PLT-03) + role onboarding screens (PLT-04).
5. Add the four route-group guards (`_app`, `_student`, `_sponsor`, `_admin`) with `beforeLoad`.
6. Build profile edit + public view (STU-01/02, SPN-01/02) on `lib/account` + `hooks/account`.
7. Build the public landing + top-3 preview (PLT-06) — SSR/SSG path for the budget in FR-S10.
8. `pnpm generate-routes`, then `pnpm check`.

## Decisions & Trade-offs

- **Redirect-to-iSkolar login (plan §3 option b)** over a local credential form — Academy never touches credentials; standard SSO, less attack surface. Trade-off: a redirect hop instead of an in-app form.
- **Cached base-profile snapshot** (`display_name`, `avatar_url`) refreshed on login over live `GET /users/:id` — no per-view runtime dependency on iSkolar-main (PRD §6 open item 6 recommendation).
- **Single `AuthProvider` context + TanStack Query**, no Redux/Zustand — all meaningful state is server-derived (mirrors iSkolar §5.3).
- **Route guards are UX/defense-in-depth only** — real enforcement is server `requireRole()` (PLT-05 AC#2); never trust the client guard.

## Dependencies & Open Items

- **Gating:** plan §9.1 / PRD §12.1 token contract + cookie/domain — *must resolve before coding*.
- **Open:** §9.4 login method (recommend b), §9.6 base-profile sync (recommend snapshot).
- Public-profile "published projects worked on" list is a **stub** until P1/P3 land the project data.

## Verification Plan

- Valid iSkolar cookie → signed in + routed by role; no/expired cookie → `_public/login` (PLT-01/02).
- First sign-in creates exactly one `academy_user`; returning users matched, not re-provisioned (PLT-03).
- Wrong-role navigation is redirected by `beforeLoad`; protected server routes reject missing/expired JWT (PLT-05).
- Visitor sees landing + exactly 3 most-recent **published** cards, no detail/profile/search; gated clicks route to sign-in (PLT-06).
- Profile edits validate and reflect immediately on the public profile (STU-01/SPN-01).
- `pnpm check` clean; `pnpm generate-routes` produces no diff after commit.
