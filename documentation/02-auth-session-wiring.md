# Phase 02 — Auth: server↔client session wiring

**Status:** ✅ Done (client side; server `GET /auth/session` live)
**Date:** 2026-07-02
**Repo(s):** academy-client (this doc) · academy-server (`account/`, `auth.ts`)
**Traces to:** PRD — FR-A1 (SSO), FR-A2 (provisioning) · Plan — §3 (token contract) · Stories — PLT-01, PLT-02, PLT-03
**Commit/PR:** —

## Goal

Connect the client to academy-server's now-live `GET /auth/session` so the app reads a
real signed-in session (verify iSkolar cookie → JIT-provision → `academy_user`), and route
the landing sign-in buttons into the auth flow. Replaces the previous `AuthProvider` stub.

## What Was Built

1. **Env contract**
   - **File:** `.env`, `.env.example`
   - **Purpose:** `VITE_BACKEND_URL=http://localhost:5000` (matches the server `PORT`) and a
     `VITE_ISKOLAR_SSO_URL` placeholder. `.env` is gitignored; `.env.example` is the committed
     contract.

2. **Live session query + real wire shape**
   - **File:** `src/lib/auth/api.ts`, `src/lib/auth/model.ts`
   - **Functions:** `validateSessionQuery()` (now calls `apiFetch("/auth/session")`, parses
     `data` with `academyUserSchema`, returns `null` on 401/unreachable), `ssoLoginUrl()`
     (targets the real iSkolar-main SSO; empty until configured). `academyUserSchema` /
     `AcademyUser` mirror the server's `academy_user` record exactly.
   - **Purpose:** The client consumes the record the server actually returns today, not the
     aspirational `SessionUser` (email / cached profile / sponsorKind) — that adaptation is
     the server's step-9 work.

3. **AuthProvider reads the live session (SSR-safe)**
   - **File:** `src/auth.tsx`, `src/hooks/auth/useSession.ts`
   - **Components:** `AuthProvider`, `useAuth()`, `useSession()`
   - **Purpose:** Exposes `{ user, role, isLoading, isSignedIn, refresh, logout }`. The
     `useQuery` is **mount-gated** (`enabled: mounted`) so the server render and the first
     client render both show a visitor — identical markup, no hydration mismatch — then the
     real fetch runs on the client where the `auth_token` cookie exists. `role` is
     `academyRole` only once `roleConfirmed`, else `null` (→ onboarding).

4. **Sign-in routing**
   - **Files:** `src/routes/_public/login.tsx`,
     `src/components/landing/{Hero,LandingHeader,LandingCta}.tsx`
   - **Purpose:** Landing "Sign in" CTAs route to `/login`; `/login` re-checks the session
     (dev token flow) since academy-server hosts no login page.
   - **Note:** a throwaway `_app/discover.tsx` route with a "session validated" debug panel
     was used to first prove the wire, then **removed**. `/discover` was later rebuilt as the
     real showcase gallery — see
     [04-app-header-and-discover-gallery](./04-app-header-and-discover-gallery.md).

## Decisions & Trade-offs

- **Consume raw `academy_user`, not `SessionUser`** — the server hasn't finalized the richer
  session shape (step 9); building against the real wire shape now avoids a parse failure and
  is a one-line swap later.
- **Return `null` on any session error** — "can't validate → treat as visitor" is the correct
  UX for a silent session check; avoids blocking the UI on a 401 or a down server.
- **Mount-gate the query** — the cleanest fix for SSR/client parity without a loader; the
  cookie isn't available to the SSR fetch anyway.
- **No hosted login on academy-server** — it only verifies the cookie. Real login is
  iSkolar-main SSO; local dev mints a token (`academy-server/src/dev/mint-token.ts`).

## Verification

```
GET /api/health                 → 200
GET /auth/session  (no cookie)  → 401         (client → visitor/null)
GET /auth/session  (dev cookie) → 200 { data: academy_user{…} }   ✓ parses academyUserSchema
```
`pnpm build` (client + SSR) and `pnpm exec tsc --noEmit` pass clean.

## Open Items

- **SessionUser adaptation** (email, `role`-null-until-confirmed, `sponsorKind` join) — server
  step 9; swap `academyUserSchema` → `sessionUserSchema` when it lands.
- **Route guards** still commented in the role/onboarding layouts; wire `beforeLoad` +
  router context once the flow is confirmed end-to-end.
- **`ssoLoginUrl()`** returns "" until `VITE_ISKOLAR_SSO_URL` is known; `lib/account/api.ts`
  is still stubbed.
