# Phase 13 — Landing TBI explorer

**Status:** ✅ Implemented
**Date:** 2026-10-06
**Repo(s):** academy-client
**Traces to:** Owner-requested Technology Business Incubator map section
**Commit/PR:** —

## Goal

Help visitors discover Philippine TBIs and find the closest listed incubator. Place the section immediately after “How projects get published,” following the owner's updated placement request.

## What Was Built

| File | Functions / Components | Purpose |
|---|---|---|
| `src/components/landing/TbiMapSection.tsx` | `TbiMapSection` | Responsive controls, explicit location permission request, place search, offline city selection, nearest result, searchable directory, selected details. |
| `src/components/landing/TbiMapCanvas.tsx` | `TbiMapCanvas` | Client-only Leaflet map, full-country bounds including Batanes, clustered markers, safe DOM popups, origin/accuracy marker, nearest halo, focus/reset, resize and teardown. |
| `src/lib/tbi/directory.ts` | `TBIS`, `distanceKm`, `rankTbis` | Sourced directory and Haversine ranking of every record, independent of the list filter. |
| `src/lib/tbi/places.ts` | `searchPlaces`, `DIRECTORY_PLACES` | Philippine-only Nominatim search with validated responses and offline choices. |
| `src/routes/_public/index.tsx` | Landing | Adds the section directly after HowItWorks. |
| `src/styles.css` | TBI styles | Brand typography, blue map tiles, pins, clusters, origin, popups, and form controls. |
| `vitest.config.ts`, feature tests | Vitest | Distance/directory checks and location/manual-search interactions. |

## Decisions & Trade-offs

- **Presentation update:** Removed the eyebrow, starting-point introduction, permission explanatory copy, and map toolbar heading. The country reset action sits over the map; directory notes sit in a separate footer inside the map card, using sentences instead of em dashes. A CSS filter applies the blue tint only to map tiles, preserving marker, popup, and control colors.
- **Directory scope:** 64 records from [DOST-PCIEERD's program page](https://pcieerd.dost.gov.ph/work-with-us/technology-business-incubation-program/), [2021 project report](https://pcieerd.dost.gov.ph/wp-content/uploads/2025/11/2021_Programs_Projects_Beneficiaries_Implementation_Status.pdf), [2022 project report](https://pcieerd.dost.gov.ph/wp-content/uploads/2025/11/BAR1_4thqtr_2022.pdf), [TBI 4.0 network](https://region7.dost.gov.ph/dost-and-technology-business-incubators-in-the-ph-inks-agreement-for-tbi-4-0-program/), and [PCAARRD's agri-aqua TBI directory](https://atbi.pcaarrd.dost.gov.ph/incubators). Separate agricultural programs can share a host with a PCIEERD program. This is a maintained publication-based directory, not an authoritative live list of every operational Philippine incubator.
- **Location precision:** Coordinates are approximate host-campus reference positions, not verified entrance coordinates. The UI labels pins and distances accordingly. Offline city choices use a representative host position in that city. Province and municipality searches use the geocoder's representative point. Straight-line distances do not imply travel times or road routes.
- **Consent:** Geolocation runs only after the visitor chooses the location action. Device coordinates remain in component memory. Selecting a place supersedes pending device-location responses. Requests are aborted on unmount; stale responses are ignored.
- **Mapping:** Leaflet and its clustering plugin load inside a client effect to keep SSR safe. OpenStreetMap tiles include visible attribution. Wheel zoom is disabled to preserve landing scroll; zoom controls and touch gestures remain available. Lenis does not intercept map/list interactions.
- **Search:** Search is explicit-submit only, limited to Philippine results, rate limited to at most one request per 1.1 seconds per component, and timed out after 10 seconds. The visitor selects an actual result. Offline directory cities work if the geocoder fails.
- **Optional providers:** `VITE_TBI_GEOCODER_URL` can replace the default Nominatim search endpoint with a compatible service; `VITE_TBI_TILE_URL` can replace the OSM raster URL. Update attribution when changing providers. Consider a hosted provider or proxy/cache if traffic grows beyond public-service usage policies.

## Verification

- Vitest: **8 tests passed** across the two feature test files, covering distance, unique/sourced records, geolocation consent/success/denial, late callback cancellation, manual search, and unavailable-search behavior.
- Production client/server build and `tsc --noEmit`: **passed**. Windows package import encountered a directory-rename error; the missing existing parser package was restored from its exact locked tarball after SHA-512 integrity verification. The final frozen-lockfile install completed successfully. Existing framework versions are preserved.
- Chrome browser checks: **passed** at desktop 1440px, tablet 768px, and mobile 390px. Initial map represented all 64 records (3 individual markers + 61 in clusters); the full count remained visible after resizing. Tiles loaded, cluster/marker clicks and popup details worked, country reset worked, device origin and nearest focus worked, municipality search selection worked with a controlled geocoder response, and denied-permission fallback worked. No page or hydration errors; no horizontal overflow. Actual external-geocoder service availability is not guaranteed by the controlled-response check.
- Biome checks for all changed feature TypeScript files and the landing route: **passed**. Repository-wide `biome check` reports **119 pre-existing formatting/lint diagnostics**, including widespread CRLF formatting differences; unrelated files were not reformatted.
- Developer commands: `pnpm test`, `pnpm build`, `pnpm exec tsc --noEmit`. Some Windows sandbox temporary-file rename operations require running verification outside that sandbox.

## Open Items

- Obtain a current authoritative nationwide registry or owner-maintained feed to guarantee all available TBIs are listed. Publication-based coverage is explicitly described in the UI.
- Verify exact incubator entrances and current operating status with host institutions before replacing approximate campus coordinates. Records deliberately do not claim current opening hours or admissions status.
