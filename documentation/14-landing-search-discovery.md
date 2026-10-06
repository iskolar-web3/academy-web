# Phase 14 — Landing FAQ and search discovery

**Status:** ✅ Implemented
**Date:** 2026-10-06
**Repo(s):** academy-client
**Traces to:** Owner-requested landing FAQ and AEO/SEO improvements
**Commit/PR:** —

## Goal

Help visitors and search engines understand what Academy offers through useful public answers, consistent metadata, and crawlable content.

## What Was Built

- `src/components/landing/LandingFaq.tsx`: eight questions as the final main-content section, after the CTA and before the footer. Native HTML disclosures support keyboard/touch interaction without JavaScript. Answers cover Academy's purpose, audience, submissions, review, thesis proposals, funding expectations, sponsor interest, and Philippine TBI discovery.
- `src/lib/landing/content.ts`: one source for the visible answers, Academy summary, and page metadata. Answers reflect the current submission/review/interest/grant implementation; no guaranteed funding or incubation admission is promised.
- `src/lib/landing/seo.ts`: homepage canonical, descriptive title and description, matching social tags, and a JSON-LD graph linking Organization, WebSite, WebPage, and FAQPage. Structured answers match the visible paragraphs. JSON serialization escapes `<` to prevent embedded HTML from closing the script element.
- `src/routes/_public/index.tsx`: serves metadata and structured data through the route head and renders the FAQ in the initial HTML.
- `src/routes/__root.tsx`: defaults to `noindex, follow`. The homepage explicitly overrides this with `index, follow, max-image-preview:large`. This avoids indexing signed-in app shells and onboarding screens. Future public content routes must explicitly opt in and supply their own canonical and metadata.
- Hero copy now gives a direct description of Academy by iSkolar. Section labels without separate titles are semantic H2 headings. The footer links to projects, the TBI map, and FAQ; the FAQ links to the map. The FAQ introduction contains only its label and heading, with the descriptive paragraph and publication-steps link removed at the owner's request.
- `public/sitemap.xml` lists the currently public homepage; `public/robots.txt` advertises it. Authenticated project, profile, grant, and dashboard URLs are omitted. Robots crawling stays enabled so crawlers can read the noindex directives.

## Decisions & Trade-offs

- Kept the existing visual language, Bree Serif typography, and mobile stacking. The FAQ has no added dependency, animation gate, API request, or client-only rendering requirement.
- Homepage metadata is route-specific: its canonical and JSON-LD must not leak onto application pages.
- Structured data describes visible facts; no fabricated reviews, organization credentials, social accounts, or search actions were added.
- FAQ markup is a semantic description, not a promise of Google FAQ rich results or AI citations. Google's current [AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasizes useful content, crawlability, and foundational SEO, and does not require special AI markup or `llms.txt` files.
- Signed-in content remains private. Broadening discovery to individual projects requires a separate product decision about which project details may be public, followed by server-rendered public detail pages and a dynamic sitemap.

## Verification

- TypeScript, production Vite build, changed-source Biome checks, and two focused Vitest checks passed. The tests verify that every structured answer appears in static FAQ HTML and that JSON-LD serialization cannot break out of its script element.
- Requests to the built SSR handler verified HTTP 200, a single canonical, one description, one robots directive, one H1, one JSON-LD graph, all eight answers, and valid section-link targets on `/`. The FAQ is the final section within `main`.
- Verified `noindex, follow` and absence of homepage canonical/JSON-LD on Discover, student/sponsor/admin dashboards, onboarding, and a 404 URL. Verified the sitemap and robots file are copied into the production assets.
- Inspected desktop (1440px) and mobile (390px) browser screenshots; neither layout has horizontal overflow. Checked keyboard disclosure interaction on desktop and touch interaction on mobile.
- The sandbox's temporary-directory restrictions initially prevented Vitest's cache rename. Running the tests with a workspace-local temporary directory passed. Browser verification used an isolated local headless Chrome profile.

## Open Items

- Deploy the frontend. Verify the production HTML, canonical, robots.txt, and sitemap on `https://academy.iskolar.io/` after deployment.
- Submit `https://academy.iskolar.io/sitemap.xml` in Google Search Console and Bing Webmaster Tools. Inspect the homepage URL and request indexing after the release; account access was not available in this task.
- Monitor indexing and relevant search queries. Rankings, indexing, and AI citations are controlled by the search platforms and are not guaranteed by these changes.
- Update the shared FAQ source as product capabilities change. Expand the sitemap only when additional pages become genuinely public and useful.
