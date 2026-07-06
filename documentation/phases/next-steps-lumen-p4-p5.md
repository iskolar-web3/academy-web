# Next Steps Guide — Lumen pass → P4 → P5

**What this is:** the standing reminder + step-by-step guide for the remaining roadmap.
When the owner says "start the Lumen pass" / "start P4" / "start P5", follow the matching
step below top-to-bottom. This file is a **guide, not a phase doc** — the phase docs
(`P4-grants-funding.md`, `P5-monetization-deal-flow.md`, and the `PL-lumen-pass` pair created
in Step 1) remain the canonical scope records; where this guide corrects them, the correction
wins and gets folded into the phase doc at build time.

**Written:** 2026-07-06, right after P3 client shipped (P3 server assigned via
`academy-server/documentation/phases/P3-discovery-contact-server.md`).
**Prerequisite for Step 1:** P3 server implemented — the Lumen pass touches
`project/server.ts`, the same file P3's guard refactor lands in. Do not run them in parallel.

---

## Rule 0 — the delivery pattern (identical for every step)

1. **Reference pass first** — read the named design-template sections, the iskolar-main
   pattern being mirrored, and the existing client primitives **before writing anything**.
   Design must be identical to the template; never invent a surface. A story with no
   template section either composes existing template patterns (documented as such in the
   phase doc) or is deferred to a product decision.
2. **Client built against a fixed `{ message, data }` contract** — endpoints defined up
   front, Zod-parsed at the boundary, hooks wrap lib, components never call `apiFetch`.
3. **Server handoff doc** written into `academy-server/documentation/phases/` in the same
   change that finishes the client — the owner implements the server from it.
4. **Verify + sync** — `pnpm generate-routes` (if routes changed) · `pnpm check` ·
   `tsc --noEmit` · `pnpm build`; update the phase doc + both README progress tables +
   `phases/README.md` indexes + `website-structure.md` in the same change.
5. **Dependency discipline** — a package lands only with its first consumer (see CLAUDE.md).
   Expected new packages across all three steps: **zero on the client** (Lumen is
   server-side `fetch`; PayMongo should be server-driven with the client only following a
   checkout/next-action URL — only add a client SDK if the P4 reference pass proves it
   unavoidable, and say so in the phase doc).
6. **§9 gates are hard stops** — see the decision checklist at the bottom. Ungated surfaces
   proceed; anything touching money movement waits for the owner's decisions.

---

## Step 1 — Lumen pass (closes P1's deferred STU-05; unblocks P4/P5 vault folders)

**Why first:** `src/lumen.ts` is shared server infrastructure — P4 needs `grant-proposals/`,
P5 needs `vault/` + `credentials/`. Skipping it would recreate the P1 "validated file picker
with no storage" stub in every later phase.

**Mirror this, not that:** iskolar-main has two Lumen integrations. Mirror the **server-side**
one — `iskolar-main/server/src/lumen.ts`: register the file (MD5-base64 checksum) at
`POST {BASE}/file/file/create/{path}` with `lumen-api-key`/`lumen-api-secret` headers →
Zod-parse `{ SASURL, WorkflowID, File.FileURL }` → `PUT` the blob to `SASURL`
(`x-ms-blob-type: BlockBlob` + content-type + content-md5) → store the returned URL/key.
Do **not** mirror `iskolar-main/web/src/lib/lumen/` — it puts the API secret in client env
(`VITE_TEST_LUMEN_*`). Secrets stay server-only in Academy.

### 1a. Client scope (small — wire the existing picker)

Verified seams as of 2026-07-06 (re-verify at build time):

- There is **no `lib/ownership/` slice** — the P1 plan's ownership slice was folded into
  `lib/project/` (`thesisPaperName` lives in `project/model.ts`; today it round-trips as a
  bare string, `SubmitProjectModal.tsx` only does `setValue("thesisPaperName", file.name)`).
- `apiFetch` (`src/lib/api.ts`) **hardcodes `Content-Type: application/json`** — multipart
  needs a sibling helper (e.g. `apiUpload(path, formData)`) that sends `FormData` with **no
  manual Content-Type** (the browser sets the boundary) and parses the same envelope.
- The submit flow already has an id at upload time: `onSubmitProject` runs
  `create.mutateAsync(input)` → `submit.mutateAsync(created.id)` (edit path: `update` →
  `submit`/`resubmit`). The upload slots **between** save and submit:
  save draft → `POST /projects/:id/thesis` → submit.

Build list:
| File | Change |
|---|---|
| `src/lib/api.ts` | Add the multipart helper (envelope-parsing, `credentials: "include"`, no JSON header). |
| `src/lib/project/api.ts` | `uploadThesisPaper(projectId, file)` → `POST /projects/:id/thesis` → `{ key }`. |
| `src/components/project/SubmitProjectModal.tsx` | Keep the picker + validation; in `onSubmitProject`, for `thesis_capstone` with a newly picked file: save → upload → then submit/resubmit. States: uploading spinner on the ownership row, uploaded ✓ + replace, error → `toast.error` (existing try/catch chain owns it). Check the template's ownership-step visual for the uploaded state before styling. |
| `src/components/project/ProjectDetailView.tsx` | Ownership line can now reflect "stored in the vault" when a key exists (template check first). |

**P1 backfill note:** thesis projects created before this pass have a `thesisPaperName`
string but no stored key. The server's new submit gate 422s them on their next
submit/resubmit until the real file is uploaded — that is intended (it IS the backfill
mechanism). Surface the server's 422 message as-is.

### 1b. Server scope (owner's, via handoff)

Written as **`academy-server/documentation/phases/PL-lumen-pass-server.md`** in the same
change as 1a, containing:

- `src/lumen.ts` — cross-cutting client, `uploadToLumen(req, buffer)` per the mirror above,
  with the vault folder as a parameter so P4/P5 reuse it (`thesis-papers/`,
  `grant-proposals/`, `vault/`, `credentials/`). Activity-logs read
  (`GET /directoryItems/logs`) is **deferred until a surface consumes it** (P5 vault) — no
  unconsumed functions.
- Env (validated in `env.ts`, fail-fast): `LUMEN_WALLET_BASE_URL`, `LUMEN_WALLET_API_KEY`,
  `LUMEN_WALLET_API_SECRET`. No new packages (`fetch` + `node:crypto`). **No migration** —
  `ownership_declaration` has held the thesis-paper key column since `00003` (verify the
  exact column name in the migration before coding). DB stays at v6.
- `POST /projects/:id/thesis` — multipart field `file`; guards: auth chain +
  `requireRole("student")` (route-level, post-P3 refactor) + **owner** check; project must be
  `draft` or `returned`; project type must be `thesis_capstone` (422 otherwise); PDF-only
  MIME allow-list + size cap per FR-S4 (suggest 10 MB constant, implementer's call —
  document it); upload to `thesis-papers/` → store key → `{ message, data: { key } }`.
- **Submit-gate hardening:** `submit`/`resubmit` of a `thesis_capstone` project with no
  stored key → 422 ("Upload the thesis paper before submitting." — client mirrors verbatim).
- Replacement policy: re-upload creates a **new** Lumen file (immutable store) and
  overwrites the key column; the old file stays in the vault as audit history.
- Verification plan: in-process — 401 no cookie / 403 sponsor / owner-only / idea-type 422 /
  bad MIME + oversize rejected / success stores key / submit-gate 422→OK / re-upload
  overwrites. Lumen itself can't run in the in-process suite — verify the live upload
  manually against staging credentials once, and unit-test `lumen.ts` around a mocked
  `fetch`.

### 1c. Decisions the owner supplies before starting

- Staging `LUMEN_WALLET_*` credentials (from the iskolar-main team).
- **OwnerAddress policy** — recommend the org wallet in v1 (iskolar-main web used one);
  per-student wallets would drag Lumen wallet-auth into Academy's login — out of scope.

### 1d. Docs produced in Step 1

`phases/PL-lumen-pass.md` (client, realized as it ships) + the server handoff above; index
row "PL" added between P3 and P4 in both `phases/README.md` files; P1's deferred tables
(both repos) flip when the server half lands.

---

## Step 2 — P4 Grants & Funding

**Scope source:** `P4-grants-funding.md` — still authoritative for stories/slices, **with
these corrections** (the doc predates the live route structure; fold these in at build time):

- **Routes:** live groups are `_app` / `student` / `sponsor` / `admin`, not the doc's
  `_grants` / `_student`. The existing `_app/grants.tsx` placeholder becomes the gallery;
  add `_app/grants.$grantId.tsx` (detail + fund) and `student/grants/new.tsx` (create).
- **ADM-02 is not a new route** — the admin console's grant-requests section already renders
  the template design as a P4 stub inside `ModerationPanel.tsx`; it goes live there.
- **No dedicated template section exists** for the sponsor funded-grants list (SPN-11 — the
  fund-flow copy just says "find the receipt in your funded grants") or a student
  "my grant requests" dashboard — compose from existing template list patterns and record
  that in the phase doc, or defer if the owner prefers.

**Template sections (reference pass targets):** GRANTS GALLERY §~520 · GRANT DETAIL + FUND
FLOW §~553 · CREATE GRANT REQUEST §~1348 · the ADMIN console's grant-requests block ·
VM grant seeds §~1851. (§ = line anchors in
`design-template/iskolar-academy/project/iSkolar Academy.dc.html` as of 2026-07-06 — re-grep
`===== ` markers, they drift.)

**Build order (gate-aware):**
1. Ungated: `lib/grant` model/api · create-request form with **required** proposal-PDF →
   Lumen `grant-proposals/` (the grant analog of the MVP gate) · gallery + detail +
   progress bar · student my-requests · admin oversight + cancel-with-reason.
2. **Gated on §9.8–9.11:** fund flow (contribution intent → PayMongo → running total →
   receipt) · `grant_funded`/`grant_closed` notifications (client union + ₱ renderer already
   shipped in P3) · payout status surfacing · real `FUNDING_BARS` in admin metrics.
3. STU-16 graduation reuses the P1 submit flow unchanged — grant and project stay unlinked.

**Server handoff produced:** `P4-grants-funding-server.md` — `grant/` slice +
`payments.ts` (PayMongo intent/capture/**webhook**/refund/payout) · migration `00007`
(`grant_request`, `grant_member`, `grant_contribution`, `payout`, `transaction_ledger`,
`kyc_verification`) → DB v7 · Lumen `grant-proposals/` reuse · emit map · Didit KYC hook per
§9.9. Landmines to call out up front: **webhook idempotency** (PayMongo retries — ledger
writes keyed on the processor reference), **append-only ledger** (no UPDATE/DELETE, ever),
**amounts as integer centavos** (never floats).

---

## Step 3 — P5 Monetization & Deal-flow

**Scope source:** `P5-monetization-deal-flow.md`, **with these corrections:**

- **Deal-flow = `sponsor/home.tsx` grown up** (it was scaffolded from SPONSOR DEAL-FLOW
  §~813: Open board, go-live alerts, watchlist count, subscriptions, suggested-to-follow
  rail) — not a new `deal-flow` route.
- **Billing = the existing `sponsor/subscription.tsx` made live** (§~1443: current plan,
  seats, manage seats, invoices; `tierInfo` seed §~1890, `planFeat` seed §~1984) — not a new
  `billing` route.
- **Student vaults is one page** (§~1386 "Your vaults" + access requests with Deny/Revoke)
  — likely `student/vaults.tsx`, not the per-project `projects/$id/vault` route the doc
  planned. Confirm against the template at reference-pass time.
- **No saved-searches management page in the template** — saved-search UX is the
  go-live-alerts toggle (rail + settings) over watched criteria; drop the planned
  `saved-searches.tsx` route or fold it into deal-flow. **No dedicated watchlist page**
  either (count + card toggles). **No admin badge-grant surface** (ADM-07) — needs a
  product/template decision or composition inside the admin console; ask before building.
- **SPN-08's list surface** (sponsor's sent interests) lands here on the deal-flow board —
  decided in P3.
- Verified Builder ✔ renders on gallery cards (§~262) and project detail (§~445).
- `vault_request` is already in the client notification union; whatever grant/expiry/alert
  types the emit map needs get added to the union **in the same change**.

**Client slices** per the phase doc: `subscription` (+ `useEntitlement` as a UX-only mirror —
the server's `requireEntitlement()` is the enforcer) · `vault` · `saved-search`/watchlist ·
`badge` rendering. FR-S9a is authoritative on vault-doc protection (immutable +
activity-logged Lumen storage + short-lived signed links; **no separate AES step** — the
stories' AES lines apply to S3 media only).

**Server handoff produced:** `P5-monetization-server.md` — `subscription/` (PayMongo
recurring + dunning per §9.13, entitlement resolution wired into `auth.ts`) · `vault/`
(Lumen `vault/`, time-bounded access grants, signed links) · `saved-search`/`watchlist`
(+ the go-live-alert emit **on publish**, which touches the P2 review `decide()` path —
that's this phase's cross-slice landmine) · `badge/` (Lumen `credentials/`) · migration
`00008` → DB v8 · real MRR metrics.

---

## The handoff skeleton (identical for all three server docs)

Header (status/target/traces to the paired client doc) → **Goal** → **⚠️ Landmines**
(cross-phase seams, before anything else) → **Endpoint contract table** (fixed by the shipped
client `lib/*/api.ts` — implement exactly, never redesign) → wire shapes + **emit map**
(template-voice strings) → **Planned build by file** + migration → **ordered implementation
process** → **verification plan** (in-process assertions + e2e against the live client) →
**Decisions & Open Items**. Same skeleton the owner already implemented P0–P3 from.

---

## Decision checklist (owner answers these; each row blocks only what it says)

| Blocks | Decision (plan §9) |
|---|---|
| Step 1 start | Staging `LUMEN_WALLET_*` credentials · OwnerAddress = org wallet? (recommended) |
| Step 2 fund flow only | §9.8 escrow vs direct · §9.9 KYC timing (Didit) · §9.10 platform fee · §9.11 currency / min-max / partial-vs-all-or-nothing / refunds |
| Step 3 start | §9.12 tier pricing/seats/entitlement matrix · §9.13 dunning · §9.14 vault grant duration/revoke/watermark · §9.15 badge source (manual admin recommended for v1) |
