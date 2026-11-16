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
5. **File:** `src/components/landing/PartnerWall.tsx` + `LAUNCH_PARTNERS` in `src/lib/landing/content.ts` - one unified wall with all 15 current assets in `public/partnerships/`, replacing the original three partner groups (updated 2026-11-13).
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

## Launch partner section update - 2026-11-13

- Renamed the heading to "Our Launch Partners" and removed the Student Communities and University TBIs and Incubators headings. All 15 current PNG files appear once; the removed QBO asset is no longer referenced.
- Kept the navy ground, Bree Serif heading, and existing heading rule. The open logo grid has five columns on desktop/tablet, three below 768px, and two below 480px. The heading stacks above the grid at 1100px and below; the final phone logo is centered.
- Logos remain monochrome at rest. Original per-logo hover behavior is preserved: color-capable artwork reveals its original colors, while BYC, Jia, and CTIED brighten and lift 3px while retaining their readable monochrome treatment. The same behavior applies to keyboard focus for links and touch press. No rectangular background is added on interaction; the original round-seal discs remain. Reduced motion disables the lift and transitions.
- Existing partner links are preserved. All partner assets have descriptive alternative text and use the confirmed destination URLs. Original PNG files are unchanged.
- Verification: TypeScript, Biome checks on the changed TS/TSX files, all 31 existing tests, and a production client/server build passed (`DISABLE_NETLIFY_PLUGIN=true`). A source inventory confirmed all 15 assets appear exactly once. Browser checks at 1440, 768, 390, and 375px confirmed all logos load without horizontal overflow; desktop hover and keyboard focus restore original colors.
- Full-repository `pnpm check` reports 172 existing formatting/lint diagnostics outside these changed TS/TSX files, including CRLF formatting. The whole-page taste inspector also flags pre-existing visual patterns outside this section; these were kept outside this update's scope.
- Partner destinations: all seven new partner URLs were supplied and added on 2026-11-14; all 15 logos now link to their partner pages.

### Hover and sizing refinement - 2026-11-14

- Removed the added light hover panels and restored the original per-logo color/brighten-and-lift distinction, using the existing 240ms hover and easing tokens.
- Sized wordmarks by their actual aspect ratios and equal visual area; capped emblems independently so wide and compact artwork has balanced visual weight. Every original logo is shown in full, including its built-in margins; only proportional scaling and spacing are used. Logos must never be cropped.
- Verified all 15 logos at desktop, tablet, and phone widths, including the 600px three-column layout. Jia keeps a transparent background and lifts 3px on focus; Tutorials Dojo reveals its original color on hover. TypeScript and targeted Biome checks pass.

- Logo preservation correction (2026-11-14): removed all crop metadata, positional offsets, and clipping rules. All partner images use `object-fit: contain` and preserve the complete source artwork.

### Consistent partner interaction - 2026-11-14

- Reduced each displayed logo width by 0.6px while preserving its proportions and complete source artwork; round frames are now 83.4px wide.
- Every logo now shares the same 3px lift, full-opacity brightening, and existing 240ms transition timing. Hover, focus, and press use the same motion. Color-capable artwork retains its color reveal; dark wordmarks retain their readable monochrome treatment. No interaction backgrounds are added.
- Reduced motion removes the lift and transitions for every logo. No clipping or cropping is used.

### New partner links and final size adjustment - 2026-11-14

- Added the supplied Facebook pages for AWS SBG Tempest, AWS SBG UPM, AWSUGPH ENOV, Seekers Guild, Startup Machine, and WorkFlow PH, plus the Stellar PH website. All 15 logos use the existing external-link behavior: a new tab with `noopener noreferrer`.
- Reduced each logo width by an additional 0.3px (0.9px total reduction; round frames are 83.1px). Full artwork, original proportions, and the shared hover motion are preserved.
