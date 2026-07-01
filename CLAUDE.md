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

### Provider Stack (router.tsx)
```
getRouter() → createTanStackRouter({ routeTree, context }) → setupRouterSsrQueryIntegration
```
`getContext()` (`src/integrations/tanstack-query/root-provider.tsx`) creates the `QueryClient` (staleTime 60s, gcTime 300s) and is passed as router context. `TanstackQueryProvider` wraps the app with `QueryClientProvider`.

### Routing
TanStack Start with file-based routes under `src/routes/`. `__root.tsx` is the root layout; `index.tsx` is the home route.

`routeTree.gen.ts` is auto-generated — do not edit manually. Run `pnpm generate-routes` after adding/renaming routes.

> Route groups (`_auth/`, `_onboarding/`, role-guarded groups, etc.) are **not yet created**. Follow the iSkolar reference convention (`D:/GithubRepo/iskolar-main/web/`) when adding them.

### Data Flow (target convention — not yet built)
- **API calls** live in `src/lib/` organized by domain, exporting `queryOptions()` builders
- **Hooks** in `src/hooks/` expose React Query queries/mutations to components
- Hooks call lib functions directly via React Query — no `src/services/` layer
- `src/lib/utils.ts` holds `cn()` (clsx + tailwind-merge) for Shadcn

### Not Yet Implemented
- Auth (`src/auth.tsx` AuthProvider, JWT cookie session) — deferred
- `src/hooks/`, `src/utils/` — deferred
- Feature routes/pages — concept TBD
- API layer (`src/lib/<domain>/`) — deferred

## Environment Variables

```
VITE_BACKEND_URL=http://localhost:5000
```

> Only the backend URL is needed so far. Add feature flags (`VITE_ENABLE_*`) and integration keys as features land, mirroring the iSkolar reference.

## Code Style

- **Linter/Formatter:** Biome (tabs, double quotes) — run `pnpm check` before committing
- **Path alias:** `#/*` maps to `./src/*` (defined in `package.json` `imports`)
- **UI components:** Shadcn/ui (style: new-york, base color: zinc) — add via `pnpm dlx shadcn@latest add <component>`
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`; single entry `src/styles.css` (Shadcn oklch tokens only)
- Packages installed and ready: `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`, `lenis`

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
