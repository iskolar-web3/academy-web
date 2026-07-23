# Phase 09 — Grants & Funding (Request · Browse · Fund via Simulated PayMongo · Payout · Ledger · Oversight)

**Status:** ✅ Client done · ✅ server live
**Date:** 2026-07-13 (core) · 2026-07-20 (routing fix + mock-checkout rebuild)
**Repo(s):** academy-client (this doc) · academy-server (`grant/`, `src/payments.ts` in simulated mode — see `academy-server/documentation/07-grants-funding-server.md`)
**Traces to:** PRD — FR-G1…G9, FR-N1 (grant_funded/closed), FR-N4 (`grant-proposals/`) · Plan — §4 (grants layer), §6, §7 (Phase 4), §9 (money model) · Stories — STU-14, STU-15, STU-16, SPN-09, SPN-10, SPN-11, ADM-02
**Commit/PR:** —

## Goal

Stand up the separate Grants track for starting-stage theses: a student creates a grant request (project metadata + a required scanned title-proposal PDF, self-declared, no admin gate), sponsors browse open grants and fund them with money moving through the platform, funds pay out to the student, every movement hits an append-only ledger, and admins get after-the-fact oversight. A funded thesis can later graduate into the showcase.

The original plan gated this phase's fund flow on §9 money-model decisions and a Lumen-hosted proposal PDF. Neither held: the proposal PDF uses the interim `documents.ts` module (real Postgres storage, already built for Phase 06's thesis upload), and the fund flow shipped as a **simulated checkout** — real UI, real DB rows, no real charge yet, via a new server `src/payments.ts` module — so no §9 decision was needed to build this phase. §9.8–9.11 now only gate the eventual real-PayMongo pass.

## What Was Built

1. **Grant request + gallery**
   - **File:** `src/lib/grant/model.ts`, `src/lib/grant/api.ts`, `src/lib/grant/helper.ts`, `src/components/grant/GrantForm.tsx`, `src/components/grant/GrantCard.tsx`, `src/routes/student/grants/new.tsx`
   - **Functions/Components:** `GrantRequest`/`GrantStatus`, `createGrantRequest` (multipart), `formatPeso`, `fundingPct`, `grantStatusMeta`
   - **Purpose:** Grant creation is one page with one "Publish grant request" button, not a wizard — there's no draft state for grants, they go live the moment they're created. Create and proposal-upload are one multipart request (`data` + `file` in a single `POST /grants`), so the single-button UX is real, not a hidden second request. Category reuses `project/model.ts`'s fixed `CATEGORIES` list via a `<select>`, matching the Phase 06 precedent instead of the template's free-text mockup field. Grant status badges are chip-shaped (6px radius), visually distinct from `project`'s pill-shaped status — `grantStatusMeta()` mirrors `statusChipClass()`'s pattern.
2. **Grant detail + inline fund flow**
   - **File:** `src/components/grant/GrantDetailView.tsx`, `src/components/grant/GrantFundPanel.tsx`
   - **Purpose:** The fund flow is inline in the grant detail's sticky rail, not a separate modal — the template models three states directly on the page (form → submitted → success), so `GrantFundPanel` was built that way instead of as a `Dialog`. The form collects only Reason + Amount (the sponsor's identity is already known from session, same reasoning as the SPN-07 org gate — the template's "Your name"/"Company or fund" fields were dropped). "Individual or team" is a single free-text descriptor, not a members subform — the template's seed `members` array is never actually rendered anywhere.
3. **Simulated checkout — mock PayMongo gateway**
   - **File:** `src/components/grant/GrantFundPanel.tsx`, `src/components/grant/GrantDetailView.tsx`
   - **Purpose:** Flow is idle → **checkout** (a mock PayMongo gateway screen — its own header bar, order summary, a working GCash/Card toggle with read-only mock card fields, a "Pay ₱X" button) → **processing** (a staged sequence — "Verifying payment method…" → "Processing payment…" → "Finalizing your contribution…", ~900ms each, with a stage-dot indicator) → success, then a real `POST /grants/:id/fund` write. This replaced two earlier passes that didn't hold up: a plain confirm-review step was rejected on sight as still not reading as a "process." Building the mock checkout surfaced a real CSS Grid/flex blowout bug — the checkout box's grant-title line used `truncate` (forcing `white-space: nowrap`) with no `min-width: 0` anywhere up the ancestor chain, so the nowrap text pushed the box wider than its grid track and overlapped the separate ads column. Fixed by dropping `truncate` (titles just wrap, same as elsewhere in this component) and adding `min-w-0` to `GrantDetailView`'s `<aside>` as a durable guard.
4. **Student grant management + admin oversight**
   - **File:** `src/routes/student/home.tsx`, `src/components/admin/ModerationPanel.tsx`, `src/routes/admin/dashboard.tsx`
   - **Purpose:** No dedicated `/student/grants` route exists — student grant management is the existing dashboard's "Grant payouts" section (raised amount + status chip per row), matching the template exactly; a "+ Request a grant" button sits beside "+ Submit a project." The template's Paid/Pending payout badge is deferred — real disbursement doesn't exist until the real-PayMongo pass, so only the grant's own status shows. Admin's cancel action collects a reason via `window.prompt()` (the template's own button has no such prompt, but every moderation action is logged, so a reason is necessary) and the moderation panel now lists real open grants instead of a dashed stub.
5. **Routing fix — gallery/detail parent-child collision**
   - **File:** `src/routes/_app/grants.index.tsx` (renamed from `grants.tsx`)
   - **Purpose:** "View grant" silently did nothing on click. Root cause: `grants.tsx` (gallery) and `grants.$grantId.tsx` (detail) shared the `grants` file prefix, which TanStack Router's flat-file convention treats as parent/child — the detail route needed an `<Outlet/>` in the gallery route to render into, and there was none. The URL changed and the correct grant fetched successfully on every click (confirmed via the server request log); there was just nowhere for the result to display. Fixed by renaming the gallery route to the exact-match `grants.index.tsx`. Documented as a durable convention in `phases/website-structure.md`: a list + detail pair sharing a path prefix must use `.index.tsx`.

## Decisions & Trade-offs

- **Grants are a fully separate track** (own route group, own entities) — completed work never appears here; no `project_id` link on the grant, keeping grants and the showcase genuinely separate.
- **No admin gate on grant publish** — goes live on submit; admin oversight is after-the-fact, trading pre-moderation for speed, mitigated by cancel.
- **Money never touches Lumen** — only the proposal PDF goes to the vault; all money flows through the simulated `payments.ts` module + the DB ledger.
- **Simulated checkout, not a placeholder or a real charge** — the first real usage of the server's `src/payments.ts` module, the same module Phase 10's tier-subscribe flow reuses.

## Verification

- Grant request requires the proposal PDF + target/currency; goes live (`open`) on submit with no admin gate.
- Open-grants gallery shows only `open`, with metadata + raised/target + proposal link; visitors blocked.
- Fund flow updates the running total and tracks status through the simulated checkout; raw card data never stored (there is none — the fields are read-only mocks).
- `grant_funded`/`grant_closed` notifications fire; every movement appears in the ledger; sponsor funded list accurate.
- Admin can cancel abusive requests with a reason; actions logged + admin-only.
- Live end-to-end verification (Playwright, real dev servers): form → GCash checkout → Card checkout → both processing stages → success, against a real grant; test contributions cleaned up and the grant's raised/backers cache recomputed back to its real state afterward.
- `pnpm exec tsc --noEmit`, `pnpm exec biome check`, `pnpm build` — clean. Zero new client packages.

## Open Items

- **STU-16 graduation** — reuses the Phase 06 submit flow unchanged; not separately tested yet (needs a published grant to exist first).
- **"🔒 Pitch vaults" dashboard button** — Phase 10 scope, not added yet.
- **Real-PayMongo pass** (deferred) will need to add a pending/async state to `GrantFundPanel`'s success flow once real capture is webhook-driven instead of immediate.
- **Didit KYC UI** — no dedicated story exists for the verification screen; needed once real payouts land.
