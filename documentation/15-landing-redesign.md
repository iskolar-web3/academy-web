# Phase 15 — Landing redesign (A · Ledger)

**Status:** ✅ Done
**Date:** 2026-10-29
**Repo(s):** both — academy-client (this doc) · academy-server (`documentation/handoff/landing-redesign-server.md`)
**Traces to:** PRD FR-N3 · PLT-02 · PLT-06 · approved template `design-maxxing/output/iskolar-academy/a-ledger.html` + `DESIGN.md`
**Commit/PR:** —

## Goal

Replace the stacked-card landing with the approved "A · Ledger" editorial design: alternating canvas / navy / white bands, a full-viewport hero with a live project carousel, static grouped partner rows, scroll-lit publishing steps, a six-up Recently published shelf with Submit Project, and an iskolar.io footer replica.

## What Was Built

1. **File:** `src/styles.css` — **`.lp` landing block** — template CSS ported 1:1 and scoped under the `.lp` page root (tokens on `.lp`, hairline scrollbar via `html:has(.lp)`). The old `.partner-carousel-*` rules are gone.
2. **File:** `src/routes/_public/index.tsx` — **`Landing`** — section order, skip link, reveal hook, DEV-only lazy tweak panel (`?dev`). Lenis smooth scroll retained: `new Lenis({ autoRaf: true, anchors: true })` in an effect, skipped under `prefers-reduced-motion`, destroyed on leave. Anchor offset comes from the html `scroll-padding-top: 88px` (Lenis reads it — an extra `offset: -88` double-counted and landed targets 176px down). `data-lenis-prevent` on the Leaflet map (`TbiMapCanvas.tsx`); `html.lenis.lenis-smooth { scroll-behavior: auto !important }` in `styles.css` so native smooth scroll doesn't fight it.
3. **File:** `src/hooks/landing/useLandingReveal.ts` — two-way, direction-aware 32px slide reveals (IntersectionObserver + MutationObserver for late cards); reduced motion shows everything.
4. **File:** `src/components/landing/Hero.tsx`, `HeroDrift.tsx` — 3-line headline with the "seen." pill; A-mark centring + carousel start computed per viewport (150px card area each side at 1440, 225px at 1920, interpolated); carousel uses the teaser, skeleton cards when loading / failed / empty; paused off-screen.
5. **File:** `src/components/landing/PartnerWall.tsx` + `PARTNER_GROUPS` in `src/lib/landing/content.ts` — three static groups, equal-visual-area sizing, round seals on discs, per-logo `hoverColour`. Trimmed logos in `public/partnerships/`.
6. **File:** `ValueProps.tsx`, `HowItWorks.tsx`, `TbiMapSection.tsx`, `LandingCta.tsx`, `LandingFaq.tsx`, `LandingFooter.tsx`, `LandingHeader.tsx` — restyled to the template; How it works is now sticky + IntersectionObserver (no framer-motion); TBI keeps the live Leaflet map.
7. **File:** `src/components/landing/RecentProjectsPreview.tsx`, `src/hooks/discover/usePublicTeaser.ts`, `TEASER_DISPLAY_LIMIT` in `src/lib/discover/api.ts` — up to six cards, renders exactly what the server returns; Submit Project button.
8. **File:** `src/lib/auth/redirect.ts`, `src/lib/auth/api.ts` (`googleLoginUrl(redirectTo)`), `src/hooks/auth/useSignInAction.ts`, `src/hooks/auth/useRouteGuard.ts`, `SignInPopover.tsx` (`redirectTo` prop) — signed-out Submit Project signs in, then lands on `/student/projects/new` on all sign-in paths. `isSafeRedirectPath` mirrors the server's `safeRedirectPath` (no `//`, `\`, control chars; decoded form checked too).
9. **File:** `src/components/landing/LandingTweakPanel.tsx` — dev-only tweak panel writing the landing CSS variables.

## Decisions & Trade-offs

- Template CSS kept as plain scoped CSS rather than Tailwind utilities: it is a 1:1 port of an approved file, and the dev panel drives its variables directly.
- academy-server's Google callback now carries `?redirect=` (httpOnly cookie) and honours it only for a fully onboarded user; a first-time user lands on onboarding. The sessionStorage fallback is therefore kept: after onboarding the route guard sends the user on to the remembered target. It also covers the dev cookie-check path. Removing it would drop the target for every new user.
- Hero paragraph uses the template copy (with the iSkolar link); `ACADEMY_SUMMARY` stays for SEO and the FAQ.
- Template left-background variants (doodles, thesis) were not ported; the chosen dotted grid is the only one.

## Verification

- `pnpm typecheck` — passes.
- `pnpm test` — 11 passed (4 files). `TbiMapSection.test.tsx` was rewritten for the current section (partner card + external UMak link, map marker selection, partnering mailto CTA); the old suite tested geolocation/place-search UI the section no longer has. `src/lib/auth/redirect.test.ts` (incl. encoded/control-char cases) passes.
- `pnpm exec biome check` on the changed files — clean.
- Playwright (Edge) at 1440 and 390 against the template: matching layout; teaser mocked with 3 and 6 projects.
- Playwright (Edge) at 1440 and 390 against **real data** (academy-server + compose Postgres, no mocks): `GET /discover/teaser` 200 with the 1 published project in the local DB (cap 6); hero carousel renders real cards (60 `.drift-title`, 0 skeletons); Recently published renders 1 real card; signed-out Submit Project opens the sign-in popover; `html.lenis` present and a wheel notch eases over ~600ms (scrollY 57 → 198 → 331 → … → 590); wheel over the map passes through as native scroll with no map zoom (`data-lenis-prevent`, `scrollWheelZoom: false`); `#recent-projects`, FAQ `#tbi-map`, and footer back-to-top `#main` land with the target 88px from the top, under the 72px sticky header. No page errors.
- PRD/plan/design-brief/user stories updated: visitor teaser "top 3" → "top 6" (FR-N3, FR-SP1, PLT-06, SPN browse story).

## Open Items

- ~~`TbiMapSection.test.tsx` rewrite and the stale `find-a-tbi` FAQ~~ RESOLVED (2026-10-29): test rewritten; the FAQ (visible + FAQPage structured data) now describes the partner map instead of "Find TBI Near Me"/place search.
- `src/lib/tbi/places.ts` (`searchPlaces`) has no consumer left now that the place-search UI and its test are gone — remove it, or wire it back if search returns.
- Hosted iSkolar SSO `?redirect=` handling is iskolar-main's; the sessionStorage fallback covers it meanwhile.
