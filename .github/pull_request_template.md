## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] UI / design change
- [ ] Refactoring (no functional changes)
- [ ] Documentation update
- [ ] Tooling / CI
- [ ] Performance improvement

## Summary

<!-- What does this PR change, and why? -->

## Related Issues

<!-- Use "Closes #123" to auto-close the issue when this merges. -->

Closes #

**Traces to:** <!-- story / requirement IDs, e.g. STU-05, FR-G2 — or "Owner-requested" -->

**Paired server PR:** <!-- link to the academy-server PR if this needs server changes, otherwise "None" -->

## Changes

<!-- The important changes, one per line. -->

-

## Testing

<!-- How you checked it. Tick what you ran. -->

- [ ] `pnpm typecheck`
- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Tested in the browser as the affected role(s)
- [ ] Added or updated tests where needed

## Screenshots

<!-- For UI changes: before / after, desktop and mobile. -->

## Checklist

- [ ] I have personally reviewed and understood every change in this PR.
- [ ] Routes changed → ran `pnpm generate-routes` and committed `src/routeTree.gen.ts`.
- [ ] UI changed → checked desktop and mobile widths, no hydration warnings in the console, and it still works with reduced motion on.
- [ ] API calls go through `src/lib/<domain>` and hooks, and responses are parsed with Zod.
- [ ] New package or `VITE_*` variable → added together with the code that uses it, and `.env.example` updated.
- [ ] Docs updated if needed: `documentation/NN-*.md` + progress table in `documentation/README.md`, and `documentation/phases/website-structure.md` if a route or domain was added.
- [ ] `CHANGELOG.md` updated under `[Unreleased]` for notable changes.
- [ ] No unrelated changes included.
- [ ] No secrets or personal data included.
