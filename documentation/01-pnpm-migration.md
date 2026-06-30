# Phase 01 — Package-Manager Migration (Bun → pnpm)

**Status:** ✅ Done
**Date:** 2026-06-30
**Repo(s):** academy-client
**Traces to:** Plan — `documents/iskolar-academy-runtime-migration-plan.md` §3; PRD —; Stories —
**Commit/PR:** —

## Goal

Move `academy-client` off **Bun** as its package manager onto **pnpm**, removing the project's dependency on the Bun toolchain ahead of the server's runtime migration. The client already runs on **Node via Vite** — Bun was only ever its package manager here — so this is a package-manager swap with **no runtime change and no source/config code change**.

## What Was Built

This phase changed tooling and metadata only; no application code was touched.

1. **Lockfile swap**
   - **File:** `bun.lock` (deleted) → `pnpm-lock.yaml` (generated)
   - **Functions/Components:** —
   - **Purpose:** `pnpm install` regenerated the dependency tree into `pnpm-lock.yaml` (117 KB) and a fresh `node_modules`. `package.json` already carried the `pnpm.onlyBuiltDependencies` key (`esbuild`, `lightningcss`), so it was already pnpm-aware — no edits to `package.json` were needed.

2. **Scaffold manifest**
   - **File:** `.cta.json`
   - **Functions/Components:** `"packageManager"`
   - **Purpose:** Updated the create-tanstack-app manifest `"packageManager": "bun"` → `"pnpm"` so the recorded scaffold metadata matches reality.

3. **Command documentation**
   - **File:** `CLAUDE.md`, `README.md`
   - **Functions/Components:** —
   - **Purpose:** Rewrote every command example from Bun to pnpm — `bun dev` → `pnpm dev`, `bun run generate-routes` → `pnpm generate-routes`, `bunx shadcn@latest add` → `pnpm dlx shadcn@latest add`, `bun check` → `pnpm check`, and the `bun --bun run *` forms in the README → plain `pnpm *`.

## Decisions & Trade-offs

- **pnpm, not npm or Yarn** — chosen for its content-addressed store (fast, disk-efficient installs) and because `package.json` was already pnpm-aware. Aligns with where iSkolar-main is heading.
- **No code/config changes** — `tsconfig.json` (Vite "bundler" moduleResolution), `vite.config.ts`, and all `src/` files are runtime-agnostic; the swap is purely the lockfile + docs. The lone `bun` substring in `tsconfig.json` is the word "Bundler", not a Bun reference, and was left alone.
- **Pre-existing Biome lint debt left untouched** — `pnpm check` reports formatting errors (tabs/semicolons) in scaffold files like `vite.config.ts`. These predate the migration (a lockfile change cannot alter source formatting) and are out of scope for a package-manager swap; they'll be cleaned up when lint/format is wired as its own task.

## Verification

- `pnpm install` — clean, completed in 8.3s (pnpm v10.32.1, Node v24.13.0). `bun.lock` removed, `pnpm-lock.yaml` present, `node_modules` rebuilt.
- `pnpm build` — passed: Vite 8 built both client and SSR bundles (`dist/client/*`, `dist/server/server.js`).
- `pnpm dev` — passed: dev server came up on `http://localhost:3000/` returning HTTP 200.
- `pnpm check` — runs (Biome executes), surfacing only pre-existing scaffold formatting debt unrelated to this change.

## Open Items

- **Server migration not done yet** — `academy-server` (package manager **and** Bun → Node 24 runtime) is the next phase, planned in `documents/iskolar-academy-runtime-migration-plan.md` §4, to be recorded as `academy-server/documentation/01-runtime-migration.md`.
- **Biome formatting debt** — scaffold files fail `pnpm check`; fix when lint/format is set up.
- **Ecosystem lockstep** — whether iSkolar-main migrates in lockstep remains an open decision (plan §8.3).
