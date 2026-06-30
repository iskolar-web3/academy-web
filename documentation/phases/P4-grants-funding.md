# Phase P4 — Grants & Funding (Request · Browse · Fund via PayMongo · Payout · Ledger · Oversight)

**Status:** 📋 Planned
**Target:** after P0 (auth) + §9 money-model decisions; sequenced after P3
**Repo(s):** academy-client (this doc) · academy-server (`grant/`, `payments.ts`)
**Traces to:** PRD — FR-G1…G9, FR-N1 (grant_funded/closed), FR-N4 (`grant-proposals/`) · Plan — §4 (grants layer), §6, §7 (Phase 4), §9 (money model) · Stories — STU-14, STU-15, STU-16, SPN-09, SPN-10, SPN-11, ADM-02
**Commit/PR:** —

> ⚠️ **Gated.** Plan §9.8 (funds model), §9.9 (KYC timing), §9.10 (platform fee), §9.11 (currency/limits/refunds) are **OPEN — do not assume**. Build the request/browse surfaces freely; the fund→payout flow is blocked on these.

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
