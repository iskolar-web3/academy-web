# Phase 11 — Academy social preview

**Status:** ✅ Done
**Date:** 2026-10-06
**Repo(s):** academy-client
**Traces to:** Owner-requested social preview refresh
**Commit/PR:** —

## Goal

Give shared Academy links a clean, recognizable branded preview.

## What Was Built

- `public/og-academy.png`: 1733 × 907 PNG with Academy branding, navy and blue typography, and a paper plane rising above an open book. All text is typeset with the actual Bree Serif Regular font, with no synthetic bold. The "by iSkolar" byline is removed.
- `documentation/assets/social-preview/`: text-free generated background, official Google Fonts Bree Serif font and OFL license, and a Windows `render.ps1` script for repeatable typography updates. Run `pwsh -File documentation/assets/social-preview/render.ps1` from the web folder to regenerate the public PNG.
- `src/routes/__root.tsx`: default Open Graph and Twitter large-image metadata, including title, description, image dimensions, and alternative text.

## Decisions & Trade-offs

- A static public asset keeps previews available without authentication or image-generation services.
- The absolute image URL uses the production domain `https://academy.iskolar.io`. Preview deployments also reference that domain.
- Existing landing-page title and description remain intact; social metadata uses the new artwork's headline.

## Verification

- Visually reviewed the final Bree Serif artwork and checked PNG dimensions and size (1,615,405 bytes); image metadata matches the dimensions. The render script verifies the loaded font family and checks every text line fits its column.
- TypeScript, the root route's Biome check, and the production Vite build passed.
- Invoked the built SSR handler for `/`: HTTP 200 with all 14 Open Graph/Twitter tags in the initial HTML.
- Confirmed the image is copied into `dist/client` by the build.

## Open Items

- Deploy the frontend to publish the asset and metadata. Previously shared links may need their social-platform preview cache refreshed.
