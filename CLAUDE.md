# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** pnpm

```bash
pnpm dev               # Start dev server on port 3000
pnpm generate-routes   # Regenerate routeTree.gen.ts (tsr generate)
pnpm build             # Production build (vite build)
pnpm preview           # Preview production build
pnpm test              # Run unit tests (Vitest)
pnpm lint              # Lint with Biome
pnpm format            # Format with Biome
pnpm check             # Lint + format check
```

Run a single test file: `pnpm test src/path/to/file.test.ts`

## Architecture

**iSkolar Academy** is the frontend SPA. Stack: React 19 + Vite 8 + TanStack Start (SSR-capable, file-based router) + TanStack Query + Tailwind CSS 4 + Shadcn/ui. The product is a **student-project showcase, discovery & funding platform** (a subsidiary of iSkolar) — see `documents/iskolar-academy-plan.md`, `-prd.md`, and `-design-brief.md`. It reuses the iSkolar reference design system + engineering patterns. Files split across **AWS S3** (general media) and the **Lumen document vault** (provenance/sensitive docs); payments via **PayMongo**.

> **Structure reference:** [`documentation/phases/website-structure.md`](documentation/phases/website-structure.md) — the hybrid Vertical Slice layout (domains across `routes`/`lib`/`hooks`/`components`), the route groups + URL map, auth/guards state, and conventions. Keep it in sync when a route group or domain is added.

### Provider Stack (router.tsx)
```
getRouter() → createTanStackRouter({ routeTree, context }) → setupRouterSsrQueryIntegration
```
`getContext()` (`src/integrations/tanstack-query/root-provider.tsx`) creates the `QueryClient` (staleTime 60s, gcTime 300s) and is passed as router context. `TanstackQueryProvider` wraps the app with `QueryClientProvider`.

### Routing
TanStack Start with file-based routes under `src/routes/`. `__root.tsx` is the root layout; `index.tsx` is the home route.

`routeTree.gen.ts` is auto-generated — do not edit manually. Run `pnpm generate-routes` after adding/renaming routes.

> Route groups follow the iSkolar reference convention (`D:/GithubRepo/iskolar-main/web/`). The **live** route groups, guards, and URL map are not tracked here — see `documentation/phases/website-structure.md`.

### Data Flow
- **API calls** live in `src/lib/<domain>/` (`api.ts` + `model.ts`), exporting `queryOptions()` builders and mutation functions; everything goes through `apiFetch` in `src/lib/api.ts` (sends `credentials: "include"`, parses the server's `{ message, data }` envelope, throws `body.message` on non-ok)
- **Wire shapes are re-parsed with Zod** (`<domain>/model.ts`) at the API boundary — the client never trusts raw JSON
- **Hooks** in `src/hooks/<domain>/` expose React Query queries/mutations to components; components never call `apiFetch` directly
- No `src/services/` layer — hooks call lib functions directly via React Query
- `src/lib/utils.ts` holds `cn()` (clsx + tailwind-merge) for Shadcn

### Current State & Pending Work
Not tracked here — CLAUDE.md holds durable rules only. What's built, pending, or stubbed lives in the `documentation/README.md` progress table and each phase's `Open Items` section.

## Environment Variables

```
VITE_BACKEND_URL=http://localhost:5000
```

> Only the backend URL is needed so far. Add feature flags (`VITE_ENABLE_*`) and integration keys as features land, mirroring the iSkolar reference.

## Code Style

- **Linter/Formatter:** Biome (tabs, double quotes) — run `pnpm check` before committing
- **Path alias:** `#/*` maps to `./src/*` (defined in `package.json` `imports`)
- **UI primitives — "Shadcn for behavior, template classes for visuals"**: interactive primitives live in `src/components/ui/` (Shadcn new-york/zinc, generated via `pnpm dlx shadcn@latest add <component>` then **restyled 1:1 to the design-template**). In use: Dialog, DropdownMenu, Switch, Tabs, Checkbox, Button (cva variants — the single button source; `.btn-*` CSS classes retire as surfaces migrate), sonner Toaster. Static surfaces (cards/chips/pills) stay hand-rolled token classes; native `<select>` stays native.
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`; single entry `src/styles.css` (design tokens + the Shadcn variable bridge `--primary → --color-action` etc.)

## Library & Dependency Discipline

**Analyze before writing — in this order:**

1. **Before writing any UI**, check what already exists and use it instead of hand-rolling:
   `src/components/ui/` (Radix primitives restyled to the template — Dialog, DropdownMenu,
   Switch, Tabs, Checkbox, Button, Toaster), the fixed-component classes in `styles.css`
   (`.card-surface`, `.chip`, `.status-pill`, …), and `cn()` from `#/lib/utils` for conditional
   classes. New *interactive* primitive needed → `pnpm dlx shadcn@latest add <component>`, then
   restyle it to the design-template before first use. New *static* markup → token classes, no
   component library involved.
2. **Before adding a package**, verify nothing installed already covers it:
   read `package.json`, then check real usage with `grep -r "<pkg>" src --include="*.ts*" -l`.
   An installed-but-unimported package is a bug to fix (wire it or remove it), not a shortcut.
3. **When adding a package**, the same change must include its first consumer — a dependency
   never lands "for later". If the consumer gets deleted, the dependency goes with it.
4. **When mirroring iskolar-main**, mirror *patterns*, not package lists. Each package the
   reference uses is adopted only when this repo has the feature that needs it.
5. **After removing code**, re-run the usage check for the packages it imported — last-consumer
   removals must drop the dependency too.

## SSR & Hydration

This app runs **TanStack Start with SSR**, so every route component renders on the server first, then hydrates on the client. Watch the browser console for:

> ⚠️ *A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up.* (`https://react.dev/link/hydration-mismatch`)

**Before treating it as a bug, rule out a browser extension.** Extensions mutate the DOM before React hydrates and produce *false* mismatches. The tell is an unfamiliar attribute on `<html>`/`<body>` in the printed diff, e.g.:
- `cz-shortcut-listen="true"` → **ColorZilla**
- `data-gr-*` / `data-new-gr-c-s-*` → **Grammarly**
- `data-lt-*` → **LanguageTool**, `bis_*` → **Bitdefender**

Reproduce in an **incognito window with extensions disabled** — if the warning disappears, it's the extension, not our code. Do not "fix" these.

**Real mismatches in our code** come from server-render output differing from the first client render. Check for these in any component that renders during SSR:
- A `typeof window !== "undefined"` (or `typeof document`) branch that changes markup → gate browser-only logic in `useEffect` instead, or render a stable placeholder.
- Non-deterministic values in render: `Date.now()`, `Math.random()`, `new Date()`, `crypto.randomUUID()` → compute once on the server and pass down, or move into `useEffect`.
- **Locale/timezone-dependent formatting** (`toLocaleString`, `Intl.*`) that differs server vs client → format with a fixed locale/timezone, or do it client-side after mount.
- **External/changing data** read at render without a server snapshot → fetch via TanStack Query (SSR-dehydrated) so server and client start from the same data.
- **Invalid HTML nesting** (`<div>` inside `<p>`, `<p>` inside `<p>`, block elements inside `<button>`/`<a>`, stray whitespace in `<table>`) → the browser auto-corrects the DOM, so the client tree no longer matches the server string.

When debugging, read the diff React prints (`-` server vs `+` client) to find the offending element, then trace it to one of the causes above.

## Documentation

Development is documented phase-by-phase in `documentation/` — a file-by-file narrative of **how each part of the frontend was built** (format adapted from the SecureFlow walkthrough; the original reference set lives in the monorepo-root `walkthrough/` folder, template only).

**Rules:**
- **One doc per phase/feature**, named `NN-<kebab-title>.md` (`NN` = zero-padded build order). Copy `documentation/_TEMPLATE.md` to start.
- **Write/update the doc in the same change that ships the feature** — not after the fact.
- Every doc carries a header with **Status** (📋 Planned · 🔨 In progress · ✅ Done), **Date**, **Repo(s)**, a **Traces to** line (PRD FR-IDs · plan § · story IDs), and **Commit/PR**.
- Body sections: **Goal → What Was Built** (File / Functions·Components / Purpose) **→ Decisions & Trade-offs → Verification → Open Items**.
- Keep the **progress table** in `documentation/README.md` in sync with every add or status change.
- **CLAUDE.md stays durable** — rules and conventions only. Implementation *status* (what's built, pending, or deferred) belongs in the progress table and phase docs; shipping a phase must never require a CLAUDE.md edit. Touch CLAUDE.md only when a rule/convention itself changes.

## Rules

@.claude/rules/architecture.md
@.claude/rules/api-design.md
@.claude/rules/security.md
@.claude/rules/code-quality.md
@.claude/rules/frontend.md
@.claude/rules/documentation.md
