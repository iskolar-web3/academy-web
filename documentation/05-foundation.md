# Phase 05 — Foundation (SSO · Provisioning · Roles · Security · Profiles · Landing)

**Status:** ✅ Client done · ✅ server live
**Date:** 2026-07-03
**Repo(s):** academy-client (this doc) · academy-server (`auth.ts`, `account/` — see `academy-server/documentation/03-foundation-server.md`)
**Traces to:** PRD — FR-A1…A7, FR-P1…P5, FR-S1…S10, FR-N3 · Plan — §3, §6, §7 (Phase 0) · Stories — PLT-01, PLT-02, PLT-03, PLT-04, PLT-05, PLT-06, STU-01, STU-02, SPN-01, SPN-02
**Commit/PR:** —

## Goal

Stand up the identity + security spine and the first viewable surfaces: silently validate the iSkolar SSO cookie, provision an `academy_user` on first token, run role onboarding, enforce role/route guards, let users edit + view profiles, and render the unauthenticated landing with the top-3 most-recent published cards. Nothing else could be built until a request could be authenticated and routed by role.

## What Was Built

1. **Auth: server↔client session wiring**
   - **File:** `.env`/`.env.example`, `src/lib/auth/api.ts`, `src/lib/auth/model.ts`, `src/auth.tsx`, `src/hooks/auth/useSession.ts`
   - **Functions/Components:** `validateSessionQuery()`, `ssoLoginUrl()`, `AuthProvider` (`{ user, role, isLoading, isSignedIn, refresh, logout }`)
   - **Purpose:** `VITE_BACKEND_URL` env contract; `validateSessionQuery()` calls `apiFetch("/auth/session")`, parses the raw `academy_user` with `academyUserSchema`, returns `null` on 401/unreachable (silent check → treat as visitor). `AuthProvider`'s `useQuery` is mount-gated (`enabled: mounted`) so SSR and the first client render both show a visitor with identical markup — no hydration mismatch — and the real fetch only runs client-side, where the `auth_token` cookie exists. `role` reads as `academyRole` only once `roleConfirmed`, else `null` (→ onboarding). Landing "Sign in" CTAs route to `/login`, which re-checks the session since academy-server hosts no login page of its own (real login is iSkolar-main SSO; dev mints a token).
2. **Client route guards**
   - **File:** `src/hooks/auth/useRouteGuard.ts`, `src/components/layout/RouteFallback.tsx`, `src/routes/_app.tsx`, `src/routes/student.tsx`, `src/routes/sponsor.tsx`, `src/routes/admin.tsx`, `src/routes/_onboarding.tsx`
   - **Functions/Components:** `useRouteGuard()` (modes `signed-in` / `role` / `onboarding`), `<RouteFallback>`
   - **Purpose:** Defense-in-depth only — real enforcement is server-side `requireRole()`. Reads the same mount-gated session so SSR and the first client render show the deterministic `RouteFallback`, then admits the route or redirects. Chosen over TanStack Router's `beforeLoad` because `beforeLoad` runs on the SSR server (no dev cookie), which would render `/login` server-side while the client renders the app — a hydration mismatch plus a visible redirect flash.
3. **Account API + hooks**
   - **File:** `src/lib/account/api.ts`, `src/lib/account/model.ts`, `src/hooks/account/useProfile.ts`, `src/hooks/account/useUpdateProfile.ts`, `src/hooks/auth/useConfirmRole.ts`
   - **Functions/Components:** `myProfileQuery`, `profileQuery(userId)`, `updateMyProfile`, `confirmRole`, `logoutRequest`, `AccountProfile`, `profileEditSchema`, `roleConfirmSchema`, `roleLabel()`
   - **Purpose:** Real endpoints (`GET /accounts/me/profile`, `GET /accounts/:id/profile`, `PATCH /accounts/me/profile`, `POST /accounts/me/role`, `POST /auth/logout`) replacing mocks. `useUpdateProfile` seeds the fresh record and invalidates profile/session; `useConfirmRole` writes the updated `academy_user` into the session cache so the onboarding guard re-evaluates immediately.
4. **Onboarding, profile edit, public profile**
   - **File:** `src/routes/_onboarding/role-select.tsx`, `src/components/account/ProfileEditForm.tsx`, `src/routes/student/profile.tsx`, `src/routes/sponsor/profile.tsx`, `src/components/account/ProfileView.tsx`, `src/routes/_app/u.$userId.tsx`
   - **Purpose:** All three rebuilt 1:1 to the design-template. Onboarding confirms the seeded role (sponsor also picks a sub-kind) and routes by role. Profile edit is one unified 4-field form (Display name / Headline / School-or-org / Bio) — identical across roles in the template, followed verbatim; richer `student_profile` columns (specialty/skills/links) are seeded/displayed but not yet editable. Public profile reads `useProfile(userId)` with loading/not-found states; `canEdit` is true only on the viewer's own profile.
5. **Login / logout**
   - **File:** `src/routes/_public/login.tsx`, `src/auth.tsx`
   - **Purpose:** `/login` drops the guard-bypassing dev jumps and routes by role; logout calls `logoutRequest()` then clears the local session.
6. **Shared signed-in header (RoleNav)**
   - **File:** `src/components/layout/RoleNav.tsx`, `src/routes/_app.tsx`
   - **Functions/Components:** `<RoleNav>`
   - **Purpose:** One role-aware header component instead of divergent per-role bars — `_app.tsx` reads the live session role, the role shells pass their own. Center nav is ported verbatim from the design-template per role (student: Discover · Grants · My Projects; sponsor: Discover · Deal-flow · Grants; admin: Review Queue · Discover). The user-pill dropdown (avatar, name, role · school, Profile/Settings/Notifications/log out) and the notification bell popover shipped visually complete but mock-backed at this stage — both wired to live data once the notification model landed in Phase 08. Both popovers dismiss on outside-click and Escape, and only one stays open at a time. Discover and Grants mount as pathless `_app` children (shared across roles, clean top-level URLs) — Grants was an honest placeholder stub here until Phase 09 built the real thing.

## Decisions & Trade-offs

- **Client-effect guards over `beforeLoad`** — keeps SSR and the first client render identical; real enforcement stays server-side (`requireRole()`), the client guard is UX/defense-in-depth only.
- **Redirect-to-iSkolar login** over a local credential form — Academy never touches credentials; standard SSO, less attack surface, at the cost of a redirect hop instead of an in-app form.
- **Single `AuthProvider` context + TanStack Query**, no Redux/Zustand — all meaningful state is server-derived.
- **Real queries replace mocks immediately** — profile surfaces hit live endpoints (with loading/error/not-found states) so the client is genuinely finished even while the server `account` slice was still shipping.

## Verification

- `GET /auth/session` → 401 without cookie (client shows visitor), 200 `{ data: academy_user }` with a dev cookie, parsed by `academyUserSchema`.
- `pnpm exec biome check --write src` — clean (only the pre-existing `Hero.tsx` `noStaticElementInteractions` finding, unrelated).
- `pnpm exec tsc --noEmit` — exit 0. `pnpm build` — client + SSR built.
- Hydration: guards render a deterministic `RouteFallback` during SSR/first render; no non-deterministic render values.

## Open Items

- Public-profile "published projects worked on" list was a stub until project data existed — backfilled in Phase 08 (Discovery & Contact).
- Richer `student_profile` fields (specialty/skills/links) are seeded/displayed, not yet editable.
