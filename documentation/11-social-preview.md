# Phase 11 — Academy social preview

**Status:** ✅ Done
**Date:** 2026-10-06
**Repo(s):** academy-client
**Traces to:** Owner-requested social preview refresh
**Commit/PR:** —

## Goal

Give shared Academy links a clean, recognizable branded preview.

## What Was Built

- `public/og-academy.png`: 1733 × 907 PNG with the Academy combination mark, navy and blue typography, and the original Academy logo icon on the right. All headline text is typeset with the actual Bree Serif Regular font, with no synthetic bold. The "by iSkolar" byline is removed.
- `documentation/assets/social-preview/`: text-free generated background, rasterized copies of `public/combination-mark.svg` and `public/logo-academy.svg` (the latter trimmed as `academy-icon.png`), official Google Fonts Bree Serif font and OFL license, and a Windows `render.ps1` script for repeatable preview updates. Run `pwsh -File documentation/assets/social-preview/render.ps1` from the web folder to regenerate the public PNG.
- `src/routes/__root.tsx`: default Open Graph and Twitter large-image metadata, including title, description, image dimensions, and alternative text.

## Decisions & Trade-offs

- A static public asset keeps previews available without authentication or image-generation services.
- The absolute image URL uses the production domain `https://academy.iskolar.io`. Preview deployments also reference that domain.
- Existing landing-page title and description remain intact; social metadata uses the new artwork's headline.
- The right-side icon uses the original SVG artwork, rasterized with Sharp. The built-in image generation tool cleared the background using this prompt: "Use case: precise-object-edit. Edit target: supplied text-free Academy social preview background. Remove the entire right-side illustration: blue paper airplane, blue orbital ring, all floating pages, open book, and their shadows. Fill seamlessly with the same very pale icy blue-white softly textured background already visible on the left. Preserve the original wide aspect ratio and subtle background color and texture throughout. Output only an empty clean background, no objects, no text, no logos, no new design elements. This will be used as a background underneath existing exact brand assets and typeset text."

## Verification

- Visually reviewed the final artwork and checked PNG dimensions; image metadata matches the dimensions. The render script verifies the loaded font family and checks every text line fits its column.
- TypeScript, the root route's Biome check, and the production Vite build passed.
- Invoked the built SSR handler for `/`: HTTP 200 with all 14 Open Graph/Twitter tags in the initial HTML.
- Confirmed the image is copied into `dist/client` by the build.
- Icon replacement: regenerated and visually checked the 1733 × 907 image; the root route's Biome check and `git diff --check` passed. Updated both social image alt tags through their shared constant. The earlier full-build checks above were not rerun for this asset replacement.

## Open Items

- Deploy the frontend to publish the asset and metadata. Previously shared links may need their social-platform preview cache refreshed.
