# Phase P4 — Grants & Funding (Request · Browse · Fund via PayMongo · Payout · Ledger · Oversight)

**Status:** ✅ Client done (2026-07-13) · ✅ server live (2026-07-13) — DB v8, 51/51 in-process
**Target:** after P0 (auth); **no longer gated on §9 or Lumen** — see the roadmap revision below
**Repo(s):** academy-client (this doc) · academy-server (`grant/`, `src/payments.ts` in simulated mode)
**Traces to:** PRD — FR-G1…G9, FR-N1 (grant_funded/closed), FR-N4 (`grant-proposals/`) · Plan — §4 (grants layer), §6, §7 (Phase 4), §9 (money model) · Stories — STU-14, STU-15, STU-16, SPN-09, SPN-10, SPN-11, ADM-02

> **Roadmap revision (2026-07-13):** this doc's original gate ("Fund flow design
> intentionally deferred until §9 decisions", Lumen for the proposal PDF) no longer applies.
> Per `academy-client/documentation/phases/next-steps-lumen-p4-p5.md`: (1) Lumen is built
> **last** — the proposal PDF uses the interim `documents.ts` module (real Postgres storage,
> already built during the P1 thesis-upload retrofit); (2) PayMongo is also built last, but
> the fund flow is not flatly blocked — it's a **simulated checkout** (real UI, real DB rows,
> no real charge yet) via a new `src/payments.ts` module, so **no §9 decision was needed to
> build this phase**. §9.8–9.11 now only gate the eventual PayMongo pass. See "Realized
> Build — Client" below for what actually shipped and where the template corrected this
> doc's original assumptions.

## Goal

Stand up the **separate** Grants track for starting-stage theses: a student creates a grant request (project metadata + required scanned title-proposal PDF, self-declared, no admin gate), sponsors browse open grants and fund them with money moving through the platform via PayMongo, funds pay out to the student, every movement hits an append-only ledger, and admins get after-the-fact oversight. A funded thesis can later graduate into the showcase.

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| STU-14 | Create grant request | `_grants/new` (student) |
| STU-15 | Receive grant funding | notifications + grant detail |
| STU-16 | Graduate thesis → showcase | reuse P1 submit |
| SPN-09 | Browse open grants | `_grants` gallery |
| SPN-10 | Fund a grant | fund flow (PayMongo) |
| SPN-11 | My funded grants | `_sponsor/funded-grants` |
| ADM-02 | Grant oversight | `_admin/grants` |

## Planned Build (by FE slice)

### `grant` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/grant/api.ts` | lib | **Create** | `getOpenGrantsQuery({filters})`, `getGrantQuery(id)`, `getMyGrantsQuery()` (student), `createGrantRequest()`, `updateGrantRequest()`, `cancelGrant()` (admin), `getMyFundedGrantsQuery()` (sponsor). |
| `src/lib/grant/model.ts` | lib | **Create** | `GrantRequest`, `GrantStatus` (draft\|open\|funded\|closed\|cancelled), grant Zod schema (same metadata as project + target/currency + proposal PDF required). |
| `src/lib/grant/helper.ts` | lib | **Create** | Pure: raised/target progress, currency/min/max formatting (per §9.11 once decided). |
| `src/lib/payments/api.ts` | lib | **Create** | `createContributionIntent(grantId, amount)`, `confirmContribution()` — PayMongo intent→capture handshake; never touches card data directly. |
| `src/hooks/grant/useOpenGrants.ts` | hook | **Create** | Grants gallery query (SPN-09). |
| `src/hooks/grant/useGrant.ts` | hook | **Create** | Single grant. |
| `src/hooks/grant/useMyGrants.ts` | hook | **Create** | Student's own requests (fills the STU grant-management gap). |
| `src/hooks/grant/useGrantMutations.ts` | hook | **Create** | create/update/cancel + invalidation. |
| `src/hooks/grant/useFundGrant.ts` | hook | **Create** | Contribution intent + capture (SPN-10). |
| `src/hooks/grant/useMyFundedGrants.ts` | hook | **Create** | Sponsor funded list (SPN-11). |

### Routes
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_grants/route.tsx` | route | **Create** | Signed-in guard for the separate Grants track. |
| `src/routes/_grants/index.tsx` | route | **Create** | Browse open grants (SPN-09). |
| `src/routes/_grants/$grantId.tsx` | route | **Create** | Grant detail + fund action (SPN-10). |
| `src/routes/_student/grants/index.tsx` | route | **Create** | My grant requests dashboard (gap-filler for STU-14 mgmt). |
| `src/routes/_student/grants/new.tsx` | route | **Create** | Create grant request (STU-14). |
| `src/routes/_sponsor/funded-grants.tsx` | route | **Create** | My funded grants (SPN-11). |
| `src/routes/_admin/grants.tsx` | route | **Create** | Grant oversight + cancel (ADM-02). |
| `src/routeTree.gen.ts` | generated | **Affect** | `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/grant/GrantForm.tsx` | component | **Create** | Project-metadata fields + members + target/currency + proposal-PDF upload (STU-14). |
| `src/components/grant/GrantCard.tsx` | component | **Create** | Title/category/tech/school/members, target, raised, proposal link (SPN-09). |
| `src/components/grant/FundingProgressBar.tsx` | component | **Create** | raised/target visual. |
| `src/components/grant/FundDialog.tsx` | component | **Create** | Amount entry + PayMongo checkout handoff (SPN-10). |
| `src/components/grant/LedgerReceipt.tsx` | component | **Create** | Contribution/payout status read (sponsor + student). |
| `src/components/project/ProjectForm/*` | component | **Affect** | Reuse for thesis graduation (STU-16). |

### Server (academy-server — cross-reference)
`grant/` slice (request CRUD, browse, contribution, payout, ledger writes), `payments.ts` (PayMongo intent/capture/refund/payout + webhooks), Lumen `grant-proposals/` upload, Didit KYC hook before payout; migrations for `grant_request`, `grant_member`, `grant_contribution`, `payout`, `transaction_ledger`, `kyc_verification`.

## Implementation Process (ordered)

1. **Resolve §9.8/§9.10/§9.11 (funds model, fee, currency/limits/refunds) and §9.9 (KYC timing) before the fund flow.** Request + browse can proceed in parallel.
2. `lib/grant` model + api; grant create form + proposal-PDF upload to Lumen `grant-proposals/` (STU-14).
3. Student "my grants" dashboard (fills the management gap STU-14 implies).
4. Grants gallery + card + detail (SPN-09).
5. **Fund flow** (SPN-10): contribution intent → PayMongo capture → running total; status states; ledger receipt. *(Blocked on §9.)*
6. Grant notifications: `grant_funded`, `grant_closed` (STU-15); sponsor funded-grants list (SPN-11).
7. Payout surfacing for the student (status only; disbursement is server + KYC-gated).
8. Admin oversight + cancel-with-reason (ADM-02).
9. Thesis graduation reuses the P1 submit flow (STU-16).
10. `pnpm generate-routes`, `pnpm check`.

## Decisions & Trade-offs

- **Grants are a fully separate track** (own route group `_grants`, own entities) — completed work never appears here; no `project_id` link on the grant (FR-G8/STU-16 keep them separate).
- **No admin gate on grant publish** (FR-G3) — goes live on submit; admin oversight is after-the-fact (ADM-02), trading pre-moderation for speed, mitigated by cancel.
- **Money never via Lumen** — only the proposal PDF goes to the Lumen vault; all money flows through PayMongo + the DB ledger (FR-G6).
- **Proposal PDF required** (FR-G2) — the grant analog of the MVP gate; enforced in the grant submit schema.
- **Fund flow design intentionally deferred** until §9 decisions — escrow-vs-direct and payout timing materially change the UI (hold states, refund affordances).

## Dependencies & Open Items

- **Gating:** §9.8 funds model, §9.9 KYC timing, §9.10 platform fee, §9.11 currency/limits/refunds — *blocked, do not assume*.
- **Open:** §9.2 (video N/A here), Didit KYC UI — **no dedicated story exists** for the verification screen; will need one once §9.9 lands.
- **Gap surfaced:** stories cover grant create/receive/graduate but not edit/cancel-own/dashboard — this doc adds `_student/grants/` to cover it; confirm with product.

## Verification Plan

- Grant request requires the proposal PDF + target/currency; goes live (`open`) on submit with no admin gate (STU-14).
- Open-grants gallery shows only `open`, with metadata + raised/target + proposal link; visitors blocked (SPN-09).
- Fund charges via PayMongo (intent→capture), updates running total, tracks status; raw card data never stored (SPN-10).
- `grant_funded`/`grant_closed` notifications fire; every movement appears in the ledger (STU-15); sponsor funded list accurate (SPN-11).
- Admin can cancel abusive requests with a reason; actions logged + admin-only (ADM-02).
- Funded thesis can enter the normal P1 submit flow; grant + project stay unlinked (STU-16).
- `pnpm check` clean.

## Realized Build — Client (2026-07-13)

Built to the plan above, **with corrections found during the reference pass** (design-
template GRANTS GALLERY §~520, GRANT DETAIL + FUND FLOW §~553, CREATE GRANT REQUEST §~1348,
ADMIN › MODERATION §~947, VM grant seeds §~1851) — read before building, per standing
instruction, and every correction below changed the build to match what the template
actually shows rather than the doc's original assumptions:

- **The fund flow is inline in the grant detail's sticky rail, not a separate `FundDialog`
  modal.** The template models three states directly on the page (`grantReqOpen` → a form →
  `grantReqSubmitted` → a success state) — there's no dialog component anywhere in this
  flow. Built as `GrantFundPanel` (idle/redirecting/success), composed into
  `GrantDetailView`'s right rail, not a `Dialog`.
- **The template's form also asks for "Your name"/"Company / fund"** — dropped. The
  sponsor's identity is already known from their session (same reasoning as SPN-07's org
  gate); re-typing it would just duplicate data already on file. Only **Reason** + **Amount**
  are collected.
- **No structured team roster for grants.** The seed data's `members` array is never
  rendered anywhere in the template (checked via direct search) — "Individual or team" is a
  single free-text descriptor (`teamNote`), not a subform with consent/invites like
  `project`'s members.
- **No deadline field exists in the create form.** The template's "days left" is decorative
  seed data with no corresponding input anywhere in CREATE GRANT REQUEST. Substituted with
  `createdDays` ("posted N days ago"), mirroring `Project.updatedDays` — backed by real data
  instead of an undefined deadline concept.
- **Grant creation is one page, not a wizard** (`student/grants/new.tsx` + `GrantForm`) —
  matches the template's single "Publish grant request" button; no draft state exists for
  grants (FR-G3: goes live the moment it's created).
- **Create + proposal upload are one multipart request**, not a two-step create-then-upload
  — `createGrantRequest(input, file)` sends `data` (JSON) + `file` in one `POST /grants`, so
  the single-button UX is real, not simulated by hiding a second request. The document is
  attached to the grant record atomically, server-side.
- **Category is a fixed list, not free text** — the template's create form shows a plain
  text input ("CleanTech" placeholder), but per the plan's settled decision ("category is a
  fixed curated list"), reuses `project/model.ts`'s `CATEGORIES` via a `<select>`, matching
  the P1 precedent.
- **Student's grant management surface is the existing `/student/home` dashboard's new
  "Grant payouts" section** (raised amount + status per row, matching the template's
  STUDENT DASHBOARD `myGrants` list exactly) — **not** a new `student/grants/index.tsx`
  route as this doc originally planned; the template has no such page. A "+ Request a
  grant" button was added to the dashboard header next to "+ Submit a project", matching
  the template's action row (the template's third button, "🔒 Pitch vaults", is P5 — not
  added yet).
- **The template's Paid/Pending payout badge is deferred** — real disbursement (`payout`,
  `kyc_verification`) doesn't exist until the PayMongo pass, so "Grant payouts" shows raised
  amount + the grant's own status chip (open/funded/closed) only; inventing a fake
  paid/pending state would misrepresent what's actually happened.
- **Grant status badges are chip-shaped (6px radius), not pill-shaped** — the template's
  `border-radius:6px` status badge is visually distinct from `project`'s pill-shaped
  (`.status-pill`, 9999px) status; added `grantStatusMeta()` in `lib/grant/helper.ts`
  returning Tailwind utility strings (mirrors `statusChipClass()`'s pattern) rather than new
  global CSS.
- **ADM-02's cancel action needed a reason the static template doesn't collect** — the
  template's "Cancel request" button calls its handler directly with no prompt, but
  `ModerationPanel`'s own docstring says "cancel an abusive grant request... every action is
  logged," so a reason is necessary for the audit trail. Added a `window.prompt()` (the
  minimal justified deviation, same reasoning as `ReviewDecisionModal`'s return-note field —
  the one interaction the static template doesn't depict because it needs to be functional).
- **`grant_funded` notification** now links to `/student/home` (where "Grant payouts"
  lives) instead of the generic `/grants` gallery it pointed to as a P4 forward-stub.
- **Simulated checkout, not a placeholder or a real charge** — per
  `next-steps-lumen-p4-p5.md`'s payments decision: Authorize → a client-side ~1.8s
  "Redirecting to PayMongo…" pause → a real `POST /grants/:id/fund` write. This is the
  first real usage of the server's `src/payments.ts` module (simulated internals) — the
  same module P5's tier-subscribe flow will reuse.

### Files (by domain slice)

| File | Layer | Purpose |
|---|---|---|
| `src/lib/grant/model.ts` | lib | `GrantRequest`/`GrantInput`/`GrantStatus`, wire + form Zod schemas |
| `src/lib/grant/api.ts` | lib | `openGrantsQuery`/`grantQuery`/`myGrantsQuery`, `createGrantRequest` (multipart), `grantProposalUrl`, `fundGrant`, `cancelGrantRequest` |
| `src/lib/grant/helper.ts` | lib | `formatPeso`, `fundingPct`, `grantStatusMeta`, form mappers |
| `src/hooks/grant/{useGrants,useMyGrants,useGrantMutations}.ts` | hooks | Query + mutation wrappers |
| `src/components/grant/GrantCard.tsx` | component | Gallery card (GRANTS GALLERY) |
| `src/components/grant/GrantDetailView.tsx` | component | Two-column detail + fund rail (GRANT DETAIL + FUND FLOW) |
| `src/components/grant/GrantFundPanel.tsx` | component | Inline sponsor fund flow (idle/redirecting/success) |
| `src/components/grant/GrantForm.tsx` | component | Create-request form (CREATE GRANT REQUEST) |
| `src/routes/_app/grants.tsx` | route | Gallery (real; was the P4 nav placeholder) |
| `src/routes/_app/grants.$grantId.tsx` | route | Detail + fund |
| `src/routes/student/grants/new.tsx` | route | Create request |
| `src/routes/student/home.tsx` | route (affect) | "+ Request a grant" button, "Grant payouts" section |
| `src/components/admin/ModerationPanel.tsx` | component (affect) | Real open-grants list + Cancel-with-reason (was a dashed stub) |
| `src/routes/admin/dashboard.tsx` | route (affect) | Fetches + filters open grants for `ModerationPanel` |
| `src/components/notification/NotificationItem.tsx` | component (affect) | `grant_funded` link target fix |

### Verification

`pnpm generate-routes` ✓ · `pnpm exec biome check src` clean (only the pre-existing
`Hero.tsx` `noStaticElementInteractions`, unrelated) · `tsc --noEmit` 0 errors · `pnpm build`
✓. Zero new client packages.

## Open Items

- ~~**Server not yet built**~~ **RESOLVED (2026-07-13):** `grant/` slice + `src/payments.ts`
  shipped — `academy-server/documentation/phases/P4-grants-funding-server.md` (51/51
  in-process). Two things the server team caught and fixed before implementing, worth
  knowing about even though nothing on the client needed to change: (1) `GrantForm`'s own
  publish gate checks `!v.targetRaw` (a non-empty *string*), so typing non-numeric garbage
  in the target field silently maps to `target: 0` via `grantFormToInput` and would have
  passed the client's own gate — the server independently rejects `target <= 0`; (2) the
  create endpoint is strict end-to-end (blank title/category/purpose also 422 server-side,
  not just target), since a grant has no draft state to justify any laxity.
- **STU-16 graduation** — reuses the P1 submit flow unchanged; no new code needed, not
  separately tested yet (needs a published grant to exist first).
- **"🔒 Pitch vaults" dashboard button** — P5, not added; the template's third dashboard
  action button stays out of scope until then.
- **PayMongo pass** (deferred, see roadmap doc) will need to add a pending/async state to
  `GrantFundPanel`'s success flow once real capture is webhook-driven instead of immediate.
