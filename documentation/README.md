# academy-client — Development Documentation

A phase-by-phase, **file-by-file narrative of how `academy-client` was built** — a developer's guided tour of the frontend. The format is adapted from the **SecureFlow** walkthrough (the original reference set lives in the monorepo-root `walkthrough/` folder — template only, not Academy content), with added progress and traceability signals.

## How to use

- **One markdown per phase/feature**, named `NN-<kebab-title>.md` where `NN` is the zero-padded build order (`00`, `01`, …). The number prefix makes build order visible from the folder listing alone.
- Copy **`_TEMPLATE.md`** to start a new entry.
- **Write/update the doc in the same change that ships the feature** — not after the fact.
- Update the **progress table** below on every add or status change.
- Keep the **Traces to** loop closed: each entry links back to `documents/iskolar-academy-{plan,prd,design-brief}.md` and the user stories, so the documentation, the plan, and the stories never drift apart.

## Forward-looking phase plans

Before a phase ships, its **planned** scope (FE slices, files to create/affect, implementation process) lives in [`phases/`](./phases/README.md) — one `P0…P5` doc per product phase, written in planned/before-progress tense. As a phase actually ships, migrate its content into a numbered `NN-*.md` build-order doc below and flip the phase status.

## Status legend

📋 Planned · 🔨 In progress · ✅ Done

## Each entry contains

**Goal → What Was Built** (File / Functions·Components / Purpose) **→ Decisions & Trade-offs → Verification → Open Items**, under a header carrying **Status · Date · Repo(s) · Traces to · Commit/PR**.

## Progress

| Phase | Doc | Status | Date | Traces to |
|---|---|---|---|---|
| 00 | `00-project-scaffold.md` | 📋 Planned | — | Plan §1 (scaffold) |
| 01 | `01-pnpm-migration.md` | ✅ Done | 2026-06-30 | `documents/iskolar-academy-runtime-migration-plan.md` §3 |

> **Package-manager migration (Bun → pnpm)** — done 2026-06-30 (`01-pnpm-migration.md`). The client keeps its Node/Vite runtime; only the package manager changed (lockfile + docs, no source change). The server's runtime migration (Bun → Node 24) is the next phase.
