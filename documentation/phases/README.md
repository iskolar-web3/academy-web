# academy-client — Build Phase Plans (P0 → P5)

**Forward-looking** companion to the build-order docs in `../`. Where `NN-*.md` documents *what was built* after the fact, this folder documents *what is planned to be built* — the implementation scope of each product phase **before** any code lands, expressed in the same file-by-file narrative style.

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

| Phase | Doc | Theme | Stories | Status | Depends on |
|---|---|---|---|:---:|---|
| P0 | `P0-foundation.md` | SSO, provisioning, role onboarding, security envelope, profiles, visitor landing | PLT-01…06, STU-01/02, SPN-01/02 | 📋 Planned | §3 token contract |
| P1 | `P1-submission.md` | Project draft → MVP gate → members/consent → ownership → dashboard/lifecycle | STU-03…11 | 📋 Planned | P0 |
| P2 | `P2-review.md` | Admin review queue, quality review, approve/return/reject, moderation, metrics | ADM-01/03/04/05/06 | 📋 Planned | P1 |
| P3 | `P3-discovery-contact.md` | Browse + search + filters, all-in-one card, express interest, notifications, upvotes | SPN-03…08, PLT-07/08, STU-12/13 | 📋 Planned | P2 |
| P4 | `P4-grants-funding.md` | Grants page, grant request, browse/fund (PayMongo), payouts/ledger, oversight | STU-14…16, SPN-09…11, ADM-02 | 📋 Planned | P0 + §9 money-model |
| P5 | `P5-monetization-deal-flow.md` | Subscriptions/entitlements, vault + consent, deal-flow/saved-search/watchlist, badges | STU-17/18, SPN-12…16, ADM-07 | 📋 Planned | P4 + §9 billing |

> **Traces-to discipline:** every phase links back to `documents/iskolar-academy-{prd,plan}.md` (FR-IDs · plan §) and the four `documents/user-stories/*.csv` modules. Keep the loop closed so plan, stories, and these scopes never drift. Open product decisions live in plan §9 / PRD §12 and `documents/iskolar-academy-tbd.md`.
