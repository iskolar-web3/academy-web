# Phase P0 — Foundation (SSO · Provisioning · Roles · Security · Profiles · Landing)

**Status:** 📋 Planned
**Target:** before any other phase (gating)
**Repo(s):** academy-client (this doc) · academy-server (`auth.ts`, `account/`)
**Traces to:** PRD — FR-A1…A7, FR-P1…P5, FR-S1…S10, FR-N3 · Plan — §3, §6, §7 (Phase 0) · Stories — PLT-01, PLT-02, PLT-03, PLT-04, PLT-05, PLT-06, STU-01, STU-02, SPN-01, SPN-02
**Commit/PR:** —

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
| `src/components/profile/ProfileView.tsx` | component | **Create** | Public profile renderer (specialty/skills subheader; published-work list slot — populated P1+). |
| `src/components/profile/ProfileEditForm.tsx` | component | **Create** | react-hook-form + Zod edit form (student & sponsor variants). |
| `src/components/ui/*` | component | **Affect** | Add needed Shadcn primitives via `pnpm dlx shadcn@latest add …`. |

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
