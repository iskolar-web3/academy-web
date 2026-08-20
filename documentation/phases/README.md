# academy-client — Build Phase Plans

**Forward-looking** companion to the build-order docs in `../`. Where `../NN-*.md` documents *what was built* after the fact, this folder documents *what is planned to be built* — the implementation scope of a product phase **before** any code lands, expressed in the same file-by-file narrative style, step by step.

Also in this folder (not phase plans, kept here alongside them): [`website-structure.md`](./website-structure.md) (the living folder-architecture/route-group/URL-map reference), [`next-steps-lumen-p4-p5.md`](./next-steps-lumen-p4-p5.md) (the standing Lumen/real-PayMongo roadmap guide), and [`manual-testing-guide.md`](./manual-testing-guide.md) (a single-file, click-through test script covering the whole shipped system, auth through every feature phase).

Each phase doc is scoped by the **hybrid Vertical Slice Architecture** we locked for `academy-client`: a feature is reconstructed across four folders sharing one domain name —

```
routes/<group>/…        ← page (TanStack file-based; forced location)
lib/<domain>/…          ← api.ts (queryOptions builders), model.ts (types + Zod), helper.ts (pure)
hooks/<domain>/…        ← React Query query/mutation hooks wrapping lib
components/<domain>/…   ← domain UI ( + components/ui/ = Shadcn only )
```
Cross-cutting concerns (`auth.tsx`, `lib/api.ts`, `integrations/tanstack-query/`, `utils/`) stay at root, never duplicated into slices. The server counterpart (`academy-server`) is noted per phase but specced in that repo's own docs.

## Status legend

📋 Planned · 🔨 In progress · ✅ Done — flip a phase to 🔨/✅ and migrate its content into a numbered `../NN-*.md` build-order doc as it actually ships.

## Each phase doc contains

**Goal → Stories in Scope → Planned Build** (by FE slice: File / Layer / Create·Affect / Purpose) **→ Implementation Process** (ordered) **→ Decisions & Trade-offs → Dependencies & Open Items → Verification Plan**, under a header carrying **Status · Target · Repo(s) · Traces to**.

## Phase index

*No phase is currently in planning.* Phases 0–5 (Foundation → Monetization & Deal-Flow) all
shipped client + server and their content migrated to `../05-foundation.md` through
`../10-monetization-deal-flow.md` — see the progress table in `../README.md`. The next phase to
land here, when one is scoped, follows the same **Goal → Stories in Scope → Planned Build →
Implementation Process → Decisions & Trade-offs → Dependencies & Open Items → Verification Plan**
shape described above, named `PN-<kebab-title>.md`.

> **Traces-to discipline:** every phase links back to `documents/iskolar-academy-{prd,plan}.md` (FR-IDs · plan §) and the four `documents/user-stories/*.csv` modules. Keep the loop closed so plan, stories, and these scopes never drift. Open product decisions live in plan §9 / PRD §12 and `documents/iskolar-academy-tbd.md`.
