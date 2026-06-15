# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Package manager:** Bun

```bash
bun dev               # Start dev server on port 3000
bun run generate-routes  # Regenerate routeTree.gen.ts (tsr generate)
bun build             # Production build (vite build)
bun preview           # Preview production build
bun test              # Run unit tests (Vitest)
bun lint              # Lint with Biome
bun format            # Format with Biome
bun check             # Lint + format check
```

Run a single test file: `bun test src/path/to/file.test.ts`

## Architecture

**iSkolar Academy** is the frontend SPA. Stack: React 19 + Vite 8 + TanStack Start (SSR-capable, file-based router) + TanStack Query + Tailwind CSS 4 + Shadcn/ui. The product concept is being defined and is intended to differ from the iSkolar reference platform.

### Provider Stack (router.tsx)
```
getRouter() → createTanStackRouter({ routeTree, context }) → setupRouterSsrQueryIntegration
```
`getContext()` (`src/integrations/tanstack-query/root-provider.tsx`) creates the `QueryClient` (staleTime 60s, gcTime 300s) and is passed as router context. `TanstackQueryProvider` wraps the app with `QueryClientProvider`.

### Routing
TanStack Start with file-based routes under `src/routes/`. `__root.tsx` is the root layout; `index.tsx` is the home route.

`routeTree.gen.ts` is auto-generated — do not edit manually. Run `bun run generate-routes` after adding/renaming routes.

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

- **Linter/Formatter:** Biome (tabs, double quotes) — run `bun check` before committing
- **Path alias:** `#/*` maps to `./src/*` (defined in `package.json` `imports`)
- **UI components:** Shadcn/ui (style: new-york, base color: zinc) — add via `bunx shadcn@latest add <component>`
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`; single entry `src/styles.css` (Shadcn oklch tokens only)
- Packages installed and ready: `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`, `lenis`
