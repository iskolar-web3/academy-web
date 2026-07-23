# academy-client — Development Documentation

A phase-by-phase, **file-by-file narrative of how `academy-client` was built** — a developer's guided tour of the frontend. The format is adapted from the **SecureFlow** walkthrough (the original reference set lives in the monorepo-root `walkthrough/` folder — template only, not Academy content), with added progress and traceability signals.

## How to use

- **One markdown per phase/feature**, named `NN-<kebab-title>.md` where `NN` is the zero-padded build order (`00`, `01`, …). The number prefix makes build order visible from the folder listing alone.
- Copy **`_TEMPLATE.md`** to start a new entry.
- **Write/update the doc in the same change that ships the feature** — not after the fact.
- Update the **progress table** below on every add or status change.
- Keep the **Traces to** loop closed: each entry links back to `documents/iskolar-academy-{plan,prd,design-brief}.md` and the user stories, so the documentation, the plan, and the stories never drift apart.

## Forward-looking phase plans

Before a phase ships, its **planned** scope (FE slices, files to create/affect, implementation process) lives in [`phases/`](./phases/README.md), written in planned/before-progress tense. As a phase actually ships, migrate its content into a numbered `NN-*.md` build-order doc below and flip the phase status.

## Reference docs

- [`phases/website-structure.md`](./phases/website-structure.md) — living map of the folder architecture (hybrid VSA), route groups, and the URL layout. Update it whenever a route group or domain is added.
- [`phases/next-steps-lumen-p4-p5.md`](./phases/next-steps-lumen-p4-p5.md) — the standing roadmap guide for the Lumen pass and the real-PayMongo pass.
- [`phases/manual-testing-guide.md`](./phases/manual-testing-guide.md) — a single-file, step-by-step click-through test script for the whole system, auth through every feature phase.

## Status legend

📋 Planned · 🔨 In progress · ✅ Done

## Each entry contains

**Goal → What Was Built** (File / Functions·Components / Purpose) **→ Decisions & Trade-offs → Verification → Open Items**, under a header carrying **Status · Date · Repo(s) · Traces to · Commit/PR**.

## Progress

| Phase | Doc | Status | Date | Traces to |
|---|---|---|---|---|
| 01 | `01-pnpm-migration.md` | ✅ Done | 2026-06-30 | `documents/iskolar-academy-runtime-migration-plan.md` §3 |
| 03 | `03-shadcn-library-adoption.md` | ✅ Done | 2026-07-06 | Plan §3 · CLAUDE.md code style · iSkolar blueprint §6 |
| 04 | `04-onboarding-layout-and-startup-type.md` | ✅ Client done · ✅ server live | 2026-07-19 | Owner-directed addition — see doc for plan-note |
| 05 | `05-foundation.md` | ✅ Client done · ✅ server live | 2026-07-03 | Plan §3/§6/§7 · PLT-01…06 · STU-01/02 · SPN-01/02 |
| 06 | `06-submission.md` | ✅ Client done · ✅ server live | 2026-07-13 | Plan §6–7 · STU-03…STU-11 |
| 07 | `07-review.md` | ✅ Client done · ✅ server live | 2026-07-06 | Plan §6–7 · ADM-01/03/04/05/06 |
| 08 | `08-discovery-contact.md` | ✅ Client done · ✅ server live · 🔨 linked-member picker open | 2026-07-06 | Plan §6–7 · SPN-03…08 · STU-12/13 · PLT-07/08 |
| 09 | `09-grants-funding.md` | ✅ Client done · ✅ server live | 2026-07-20 | Plan §4/§6–7 · STU-14/15/16 · SPN-09/10/11 · ADM-02 |
| 10 | `10-monetization-deal-flow.md` | ✅ Client done · ✅ server live | 2026-07-15 | Plan §4/§6–7 · STU-17/18 · SPN-12…16 · ADM-07 |

> **Numbering note (2026-07-24 documentation pass):** phase numbers `05`–`10` follow product-phase
> order (Foundation → Submission → Review → Discovery & Contact → Grants & Funding →
> Monetization), not strict day-by-day chronology — some UI fragments (the dashboard, the header,
> the Discover gallery shell) were originally built early and are now folded into the phase doc
> that actually owns that surface, rather than kept as separate fragment docs. `02` is a
> permanently retired gap (an early standalone auth-wiring doc was folded into `05-foundation.md`
> before this pass) — not reused.

> **Package-manager migration (Bun → pnpm)** — done 2026-06-30 (`01-pnpm-migration.md`). The client keeps its Node/Vite runtime; only the package manager changed (lockfile + docs, no source change). The server's runtime migration (Bun → Node 24) is the next phase.
>
> **Shadcn/Radix adoption + library audit** — done 2026-07-06 (`03-shadcn-library-adoption.md`).
> An audit found several packages installed by mirroring the iskolar-main reference but never
> exercised (empty Shadcn scaffold, unused `cn()`/cva/lenis/tw-animate). Fixed by adopting
> **Shadcn for behavior, template classes for visuals**: restyled `ui/` primitives (Dialog,
> DropdownMenu, Switch, Tabs, Checkbox, Button+cva, sonner Toaster) now back the modals, header
> menus, settings toggle, admin tab-rail, and the design-template TOAST — zero visual drift.
> Standing rule: a package enters `package.json` only with a consumer in the same change.
>
> **Foundation** — done 2026-07-03 (`05-foundation.md`). Client route guards (SSR-safe,
> effect-based), real `account` endpoint calls replacing stubs, onboarding role-confirm, profile
> edit/view, the shared signed-in header, and the visitor landing — all rebuilt 1:1 to the
> design-template. Server half: `academy-server/documentation/03-foundation-server.md`.
