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

## Reference docs

- [`website-structure.md`](./website-structure.md) — living map of the folder architecture (hybrid VSA), route groups, and the URL layout. Update it whenever a route group or domain is added.

## Status legend

📋 Planned · 🔨 In progress · ✅ Done

## Each entry contains

**Goal → What Was Built** (File / Functions·Components / Purpose) **→ Decisions & Trade-offs → Verification → Open Items**, under a header carrying **Status · Date · Repo(s) · Traces to · Commit/PR**.

## Progress

| Phase | Doc | Status | Date | Traces to |
|---|---|---|---|---|
| 00 | `00-project-scaffold.md` | 📋 Planned | — | Plan §1 (scaffold) |
| 01 | `01-pnpm-migration.md` | ✅ Done | 2026-06-30 | `documents/iskolar-academy-runtime-migration-plan.md` §3 |
| **P0** | [`phases/P0-foundation.md`](./phases/P0-foundation.md) → Realized Build | 🔨 client done | 2026-07-03 | Plan §3/§6/§7 · PLT-01…06 · STU-01/02 · SPN-01/02 |
| **P1** | [`phases/P1-submission.md`](./phases/P1-submission.md) | ✅ Core done · ✅ invites+STU-02 closed by P3 · 🔨 thesis deferred | 2026-07-03 | Plan §6–7 · STU-03…STU-11 |
| **P2** | [`phases/P2-review.md`](./phases/P2-review.md) | ✅ Client done · ✅ server live | 2026-07-06 | Plan §6–7 · ADM-01/03/04/05/06 |
| **P3** | [`phases/P3-discovery-contact.md`](./phases/P3-discovery-contact.md) | ✅ Client done · ✅ server live · 🔨 linked-member picker open | 2026-07-06 | Plan §6–7 · SPN-03…08 · STU-12/13 · PLT-07/08 |
| 03 | `03-student-dashboard.md` | ✅ Done | 2026-07-02 | Plan §6–7 (**P1**) · STU-09/10/11 |
| 04 | `04-app-header-and-discover-gallery.md` | ✅ Done | 2026-07-02 | Plan §6 · SPN-03 (**P3** gallery; P0 header) |
| 05 | `05-shadcn-library-adoption.md` | ✅ Done | 2026-07-06 | Plan §3 · CLAUDE.md code style · iSkolar blueprint §6 |

> **P0 lives in one place.** The former standalone build docs `02-auth-session-wiring.md`
> (PLT-01/02/03) and `05-p0-foundation-client.md` (PLT-04/05, profiles) were **folded into**
> [`phases/P0-foundation.md`](./phases/P0-foundation.md) → "Realized Build — Client" so P0 has a
> single canonical record instead of scattered `NN` entries. `03` (student dashboard) is **P1**
> and `04`'s Discover gallery is **P3** — only its HEADER/RoleNav belongs to P0 — so those stay
> as their own docs, cross-linked from P0.

> **Package-manager migration (Bun → pnpm)** — done 2026-06-30 (`01-pnpm-migration.md`). The client keeps its Node/Vite runtime; only the package manager changed (lockfile + docs, no source change). The server's runtime migration (Bun → Node 24) is the next phase.
>
> **Student dashboard** — done 2026-07-02 (`03-student-dashboard.md`). `/student/home` rebuilt as a 1:1 port of the design-template STUDENT DASHBOARD (profile sidebar + stat tiles + pipeline-tracker project cards). `/student/projects` redirects to it; destructive lifecycle actions moved to the detail page.
>
> **App header + Discover gallery** — done 2026-07-02 (`04-app-header-and-discover-gallery.md`). The signed-in top nav was rebuilt to the design-template HEADER (role-aware Discover · Grants · My Projects + bell + user pill); `/discover` now renders the showcase gallery and `/grants` is a P4 placeholder.
>
> **Shadcn/Radix adoption + library audit** — done 2026-07-06 (`05-shadcn-library-adoption.md`).
> An audit found several packages installed by mirroring the iskolar-main reference but never
> exercised (empty Shadcn scaffold, unused `cn()`/cva/lenis/tw-animate). Fixed by adopting
> **Shadcn for behavior, template classes for visuals**: restyled `ui/` primitives (Dialog,
> DropdownMenu, Switch, Tabs, Checkbox, Button+cva, sonner Toaster) now back the modals, header
> menus, settings toggle, admin tab-rail, and the design-template TOAST — zero visual drift.
> Standing rule: a package enters `package.json` only with a consumer in the same change.
>
> **P0 foundation (client)** — done 2026-07-03, documented in `phases/P0-foundation.md` →
> "Realized Build — Client". Turned on client route guards (SSR-safe, effect-based), replaced
> the `lib/account` stubs with real endpoint calls, and wired onboarding role-confirm + profile
> edit. Rebuilt onboarding, profile-view (`/u/$userId`), and profile-edit surfaces 1:1 to the
> design-template. The server half of P0 is handed off in
> `academy-server/documentation/phases/P0-foundation-server.md`.
