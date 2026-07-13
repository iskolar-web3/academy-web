# Next Steps Guide — P4 → P5 → Lumen pass → PayMongo pass

**What this is:** the standing reminder + step-by-step guide for the remaining roadmap.
When the owner says "start P4" / "start P5" / "start the Lumen pass" / "start the PayMongo
pass", follow the matching step below top-to-bottom. This file is a **guide, not a phase
doc** — the phase docs (`P4-grants-funding.md`, `P5-monetization-deal-flow.md`, and the
`PL-lumen-pass`/PayMongo-pass pairs created in Steps 3–4) remain the canonical scope
records; where this guide corrects them, the correction wins and gets folded into the phase
doc at build time.

**Written:** 2026-07-06, right after P3 client shipped. **Reordered:** 2026-07-13, per the
owner's advisor — Lumen (the document-vault integration) is now built **last**; internal
web-system functions (grant CRUD/gallery/admin, subscriptions, deal-flow, notifications)
come first. **Storage decision:** 2026-07-13 — every document that would otherwise wait on
Lumen (P1 thesis paper, P4 proposal PDF, P5 vault docs/badge evidence) is stored **for real**
in the interim, in a Postgres `bytea` column, behind one small swappable module — not a
cosmetic filename-only placeholder. SQLite was considered and rejected (see Decisions below).
Net effect: **P4 and P5 no longer need Lumen staging credentials to start, and nothing is
functionally fake in the meantime** — reviewers/sponsors/admins can open real documents
before Lumen exists at all.

**Payments decision (2026-07-13):** PayMongo (real money capture, payouts, recurring
billing) is **also built last**, alongside Lumen — but revised same-day into a **simulated
checkout**, not a flat disabled state. Every money action (P4's grant funding, P5's tier
subscribe) gets the real UI flow — click the action → a confirm modal with the real
details/features → **Authorize** → a client-side "Redirecting to PayMongo…" pause (a couple
seconds) → completes, writing a **real** DB row (`grant_contribution`, `subscription`)
marked `provider: 'simulated'` — or **Cancel/close**, no change. This is built the same way
`documents.ts` was: one small module (`src/payments.ts`), simulated internals now, swapped
for real PayMongo calls in the PayMongo pass (Step 4) with the modal/UX mostly unchanged.
Net effect: **P4 and P5 need no plan §9 money-model decisions to build or demo** (they only
gate the real swap in Step 4), and nothing in the interim is a silent/invisible stand-in —
every simulated transaction is a real, inspectable row, clearly labeled in the UI as a
prototype so it's never mistaken for a live charge.

---

## The interim document-storage module (build this once, first)

One cross-cutting server module, used by every domain that needs a real file behind a
record — **not** a new database engine, not per-domain storage code.

- **`src/documents.ts`** (cross-cutting, alongside `db.ts`/`auth.ts`) exposes
  `storeDocument({ folder, filename, mimeType, buffer }): Promise<{ id, url }>` and
  `getDocument(id): Promise<{ filename, mimeType, buffer } | null>`. `folder` is the same
  four-value enum Lumen will eventually use (`thesis-papers` | `grant-proposals` | `vault` |
  `credentials`) so the eventual swap doesn't need a data-shape change.
- **Migration** adds one `document` table: `id` (uuid pk), `folder` (text, CHECK against the
  four values), `filename`, `mime_type`, `size_bytes`, `data bytea`, `created_at`. Each owning
  table (`ownership_declaration`, `grant_request`, `vault_document`, future `badge` table)
  gets a `document_id` FK instead of a bare filename string.
- **Size cap**: enforce the same PDF/allow-list MIME + size limit (FR-S4, suggest 10 MB) at
  the upload handler — this bounds row size regardless of backend; Postgres TOASTs large
  `bytea` automatically, no extra work needed on our side.
- **Reads are auth-gated per domain, not signed-URL.** Unlike Lumen's eventual short-lived
  signed link (any bearer of the URL can fetch within the window), a Postgres-backed read has
  no separate link mechanism — each domain's own read endpoint (`GET /projects/:id/thesis`,
  `GET /grants/:id/proposal`, the vault doc read, the badge evidence read) re-checks the same
  viewer rules that domain already enforces (owner/reviewer for thesis, owner/sponsor with an
  accepted access-grant for vault, etc.) before streaming the bytes back with the stored
  `mime_type`. This is stricter than Lumen's model, not looser — no regression.
- **This module is real infrastructure, not a stub** — build it once, expect it to be
  genuinely used by P1 (retrofit), P4, and P5, then swapped out from underneath in Step 3.

### P1 retrofit — done 2026-07-13, client + server

The immediate follow-up flagged above shipped: `SubmitProjectModal` now uploads the real PDF
(`uploadThesisPaper` → `POST /projects/:id/thesis`, wired save → upload → submit/resubmit),
and both `ProjectDetailView` and the admin `ReviewDecisionModal` gained a "View" link to the
stored document. See `phases/P1-submission.md` → "Update (thesis-upload retrofit,
2026-07-13)" for the exact file list. **The server side is the first real build of
`documents.ts`**, done the same day —
`academy-server/documentation/phases/thesis-storage-retrofit-server.md` (30/30 in-process).
P4's proposal-PDF and P5's vault/badge uploads (Steps 1–2 below) **reuse this same module**
— it's already built, not just planned.

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
   Expected new packages across all four steps: **zero on the client** (uploads are plain
   multipart `fetch`; PayMongo, once its pass starts, should be server-driven with the client
   only following a checkout/next-action URL — only add a client SDK if that reference pass
   proves it unavoidable, and say so in the phase doc). **Zero new packages on the server for
   storage** — `documents.ts` is `pg` bytea, already-installed driver, no new dependency.
6. **Real uploads from Step 1 on; simulated-but-real checkouts for money** — every document
   picker (thesis, proposal PDF, vault doc, badge evidence) is wired to a real
   `POST .../<field>` endpoint backed by `documents.ts` from the moment it's built. Every
   money action (grant fund, tier subscribe) gets the **simulated-checkout pattern**: tap the
   action → confirm modal (real details/features, an Authorize + a Cancel/close) → Authorize
   triggers a client-side "Redirecting to PayMongo…" pause (~2s, `setTimeout` in the click
   handler — not part of render, no SSR concern) → calls `src/payments.ts` (simulated
   internals) → a **real** row lands in the DB (`grant_contribution`/`subscription`,
   `provider: 'simulated'`) → success state. No flat "Coming soon" blocks and no silent
   backend defaults — every simulated transaction is real, inspectable state, and the modal
   copy always says plainly that it's a prototype and no real payment is taken.
7. **`payments.ts` ships with a hard kill-switch from day one** — an env flag (suggest
   `PAYMENTS_SIMULATED`, default `true` outside production) gates which internals run;
   production must fail loudly if it's still `true` rather than silently accepting simulated
   "payments" as real. This is non-negotiable — see Decisions & Trade-offs.
8. **§9 money-model gates only block the PayMongo pass (Step 4), not P4/P5 themselves** —
   see the decision checklist at the bottom. The one exception: §9.12's *entitlement matrix*
   (what each tier unlocks, not pricing) is needed for P5's real gating logic and the tier
   modal's feature list — pricing itself can borrow the template's illustrative number
   (`tierInfo` seed) provisionally.

---

## Step 1 — P4 Grants & Funding — done 2026-07-13, client + server

The client shipped: real gallery + detail + create-request page, the inline
`GrantFundPanel` simulated checkout, the student dashboard's "Grant payouts" section, and
admin cancel-with-reason. Full corrections list and file inventory in
`phases/P4-grants-funding.md` → "Realized Build — Client". Server done the same day —
`academy-server/documentation/phases/P4-grants-funding-server.md` (51/51 in-process) —
this is where `src/payments.ts` got built for real (simulated internals), ready to be
reused as-is by P5's tier-subscribe flow below.

**Scope source (kept for the record):** `P4-grants-funding.md` was authoritative for
stories/slices before the reference pass, **with these corrections** (folded into the
phase doc's Realized Build, kept here too since this guide predates that pass):

- **Routes:** live groups are `_app` / `student` / `sponsor` / `admin`, not the doc's
  `_grants` / `_student`. The existing `_app/grants.tsx` placeholder becomes the gallery;
  add `_app/grants.$grantId.tsx` (detail + fund) and `student/grants/new.tsx` (create).
- **ADM-02 is not a new route** — the admin console's grant-requests section already renders
  the template design as a P4 stub inside `ModerationPanel.tsx`; it goes live there.
- **No dedicated template section exists** for the sponsor funded-grants list (SPN-11 — the
  fund-flow copy just says "find the receipt in your funded grants") or a student
  "my grant requests" dashboard — compose from existing template list patterns and record
  that in the phase doc, or defer if the owner prefers.
- **Proposal-PDF upload is real, backed by `documents.ts`** (Rule 0.6) — `GrantForm`'s file
  picker uploads via `POST /grants/:id/proposal` → `documents.ts.storeDocument(...)` →
  `grant_request.document_id` set. Sponsors/admins can actually open the proposal PDF from
  day one of P4, well before Lumen exists.
- **The fund flow is a simulated checkout** (Rule 0.6) — `FundDialog` opens on the grant
  detail's Fund action with the template's amount-entry UI; **Authorize** triggers a ~2s
  client-side "Redirecting to PayMongo…" state, then calls `src/payments.ts`'s
  `createContribution(grantId, amount)` (built now, simulated internals — see build order
  below), which writes a real `grant_contribution` + `transaction_ledger` row
  (`provider: 'simulated'`) and bumps the grant's raised total; **Cancel** just closes the
  modal, no change. `LedgerReceipt` and the sponsor "My funded grants" page (SPN-11) read
  this real (simulated) data — no empty state needed. `grant_funded` notifications fire for
  real (client union + ₱ renderer already shipped in P3). The modal's copy must say plainly
  this is a prototype and no real payment is taken — check the template for tone, but this
  line has no template precedent, so write it clearly rather than skip it.

**Template sections (reference pass targets):** GRANTS GALLERY §~520 · GRANT DETAIL + FUND
FLOW §~553 · CREATE GRANT REQUEST §~1348 · the ADMIN console's grant-requests block ·
VM grant seeds §~1851. (§ = line anchors in
`design-template/iskolar-academy/project/iSkolar Academy.dc.html` as of 2026-07-06 — re-grep
`===== ` markers, they drift.)

**Build order (no §9 decision needed to start or finish this step — amounts are free-entry,
not tiered, so no pricing/escrow/KYC decision is even relevant yet):**
1. `src/documents.ts` + `document` migration — already built via the P1 retrofit, reuse as-is.
2. `src/payments.ts` — **new cross-cutting module, created now** (not deferred to Step 4).
   Simulated internals: `createContribution(grantId, amount)` writes the
   `grant_contribution` + `transaction_ledger` rows synchronously (`provider: 'simulated'`,
   no external call) and returns success — the client supplies the ~2s "redirecting" pause,
   the server doesn't need an artificial delay. Gated by `PAYMENTS_SIMULATED` (Rule 0.7) from
   the moment this file exists.
3. `lib/grant` model/api · create-request form with real proposal-PDF upload · gallery
   + detail + progress bar · student my-requests · admin oversight + cancel-with-reason.
4. `FundDialog`/`LedgerReceipt`/funded-grants page — the real simulated-checkout flow (see
   above).
5. STU-16 graduation reuses the P1 submit flow unchanged — grant and project stay unlinked.

**Server delivered:** `P4-grants-funding-server.md` — `grant/` slice (`grant_request` —
request CRUD, browse, admin cancel-with-reason) **plus** `src/payments.ts` in simulated
mode. Migration `00008` (DB v8) adds `grant_request` (+ `document_id` FK, all core fields
`NOT NULL` — no draft laxity) and `grant_contribution` (`provider` column, `'simulated' |
'paymongo'`, append-only from day one — the discipline that matters before real money
does). **Correction (2026-07-13):** no separate `grant_member` table and no separate
`transaction_ledger` table shipped — both were leftover from an earlier, wider-scoped
draft of this plan. `grant_member` is superseded by the client's own reference-pass
finding (no structured team roster for grants — `teamNote` is free text); `grant_contribution`
itself *is* the ledger for this phase (its own `provider` column + append-only discipline
already satisfy FR-G6 — nothing else needs a domain-agnostic ledger table, and P5's
`subscription` table won't share one either). **Not yet:** `payout`/`kyc_verification`
(disbursement to the student is out of scope for the simulated funding-in flow) or any real
PayMongo/webhook code — those are Step 4. Landmines to carry forward even in simulated mode:
**append-only ledger** (no UPDATE/DELETE, ever) and **amounts as integer centavos** (never
floats) — get these right now so Step 4 doesn't have to fix sloppy foundations.

---

## Step 2 — P5 Monetization & Deal-flow

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
- **Vault docs and badge credentials are real, backed by `documents.ts`** (Rule 0.6) —
  `VaultManager`'s upload and the admin `BadgeGrantForm`'s evidence upload both write real
  bytes via `documents.ts`, gated by the domain's own access rules (vault: an approved,
  time-bounded access grant; badge evidence: admin/owner read). Access grants, entitlement
  *gating logic*, deal-flow, and saved-search/watchlist are all real here too.
- **Tier subscribe is a simulated checkout, not a flat block or a silent default** (Rule
  0.6 — supersedes the earlier "auto top-tier default" idea, replaced same-day by the
  owner). Clicking a tier in `PlanTable` opens a confirm modal listing that tier's real
  features (from the §9.12 **entitlement matrix**, still needed — see the decision
  checklist) and its price (borrow the template's illustrative `tierInfo` seed, e.g.
  ₱12,000/mo for Alpha, flagged provisional pending §9.12's real pricing call); **Authorize**
  → the same ~2s "Redirecting to PayMongo…" pause → `src/payments.ts`'s
  `subscribeToTier(sponsorId, tier)` (simulated internals, same module P4 already built)
  upserts a real `subscription` row (`provider: 'simulated'`) → success state; **Cancel**
  leaves the sponsor's current plan (or no plan) unchanged. `requireEntitlement()` gates on
  this real row — no synthetic default anywhere. `SeatManager` is a simpler real CRUD against
  `subscription.seats` (adjusting seats within an already-chosen plan isn't itself a distinct
  money action, so it skips the confirm-modal ceremony) — implementer's call if that changes.
  Invoices list stays empty (no recurring billing cycle runs in simulated mode; that's
  Step 4). Same modal-copy requirement as P4: state plainly this is a prototype.

**Client slices** per the phase doc: `subscription` (+ `useEntitlement` as a UX-only mirror —
the server's `requireEntitlement()` is the enforcer) · `vault` · `saved-search`/watchlist ·
`badge` rendering. FR-S9a's *eventual* protection model (immutable + activity-logged Lumen
storage + short-lived signed links; AES-256 applies to S3 media only, not vault docs) is
the target state Step 3 migrates toward — during P5 itself, protection is "auth-gated
Postgres read," documented above, which is a stricter-not-looser interim.

**Server handoff produced:** `P5-monetization-server.md` — `subscription/` (plan/tier model +
`requireEntitlement()` wired into `auth.ts`, backed by `src/payments.ts`'s
`subscribeToTier()` in simulated mode) · `vault/` (access-grant model + real document
read/write via `documents.ts`) · `saved-search`/`watchlist` (+ the go-live-alert emit **on
publish**, which touches the P2 review `decide()` path — that's this phase's cross-slice
landmine) · `badge/` (grant model + evidence via `documents.ts`) · migration `00008` → DB v8
(`subscription` table with the same `provider` column discipline as P4's ledger). **Not
yet:** real PayMongo recurring billing, dunning, invoices — Step 4. MRR can be a real query
over the simulated `subscription` rows (cheap, and more honest than illustrative constants
now that real rows exist) or stay illustrative — implementer's call, either is fine for now.

---

## Step 3 — Lumen pass (last; swaps `documents.ts`'s backend, not the app)

**Why last, and why it's smaller than originally planned:** because P1 (retrofit), P4, and
P5 all built against the real `documents.ts` interface instead of a placeholder, every
upload endpoint, every client picker, every read-auth check **already exists and already
works** by the time this step starts. Step 3 is no longer "wire four upload flows from
scratch" — it's **"swap what's behind one function."** `storeDocument`/`getDocument` change
their internals from `pg` bytea to real Lumen calls; nothing else in the app changes.

**Mirror this, not that:** iskolar-main has two Lumen integrations. Mirror the **server-side**
one — `iskolar-main/server/src/lumen.ts`: register the file (MD5-base64 checksum) at
`POST {BASE}/file/file/create/{path}` with `lumen-api-key`/`lumen-api-secret` headers →
Zod-parse `{ SASURL, WorkflowID, File.FileURL }` → `PUT` the blob to `SASURL`
(`x-ms-blob-type: BlockBlob` + content-type + content-md5) → store the returned URL/key.
Do **not** mirror `iskolar-main/web/src/lib/lumen/` — it puts the API secret in client env
(`VITE_TEST_LUMEN_*`). Secrets stay server-only in Academy.

### 3a. Client scope — none expected

Every picker, every upload call, every read already shipped in the P1 retrofit / P4 / P5.
Re-verify at build time that no client code assumed the Postgres-backed read shape in a way
that would break if a signed URL replaces a same-origin stream (e.g. an `<iframe src=...>`
or `<a download>` pointed at `GET /projects/:id/thesis` directly — if so, that call becomes
"fetch a signed URL, then link to it" instead of "stream from our own API," a small but real
client change to check for, not assume away).

### 3b. Server scope (owner's, via handoff)

Written as **`academy-server/documentation/phases/PL-lumen-pass-server.md`** in the same
change, containing:

- `src/lumen.ts` — cross-cutting client, `uploadToLumen(req, buffer)` per the mirror above,
  with folder as a parameter (`thesis-papers/`, `grant-proposals/`, `vault/`, `credentials/`).
- `documents.ts` internals swap: `storeDocument` calls `uploadToLumen` instead of an `INSERT`
  into `document`; `getDocument` either proxies a signed Lumen URL or redirects to it,
  instead of `SELECT`ing `data bytea`. Same exported function signatures — **zero call-site
  changes** at any of the four consumers.
- Env (validated in `env.ts`, fail-fast): `LUMEN_WALLET_BASE_URL`, `LUMEN_WALLET_API_KEY`,
  `LUMEN_WALLET_API_SECRET`. No new packages (`fetch` + `node:crypto`).
- **Backfill migration**: existing rows in `document` (accumulated during the interim) get
  uploaded to Lumen once, in a one-off script, and their `document_id` FKs updated to point
  at the new Lumen-backed records (or the `document` table gains a `lumen_url` column and
  keeps `data` as a fallback — implementer's call; document whichever is chosen). This is
  the one piece of real migration work this step adds beyond the swap itself.
- Activity-logs read (`GET /directoryItems/logs`) — build only once a surface actually wants
  to render it (e.g. the vault's access-log view, if the P5 template calls for one).
- Verification plan: re-run every P1/P4/P5 in-process suite unchanged (the contract didn't
  move) plus a new suite for `lumen.ts` itself (mocked `fetch`) and one live manual check per
  folder against staging credentials.

### 3c. Decisions the owner supplies before starting Step 3

- Staging `LUMEN_WALLET_*` credentials (from the iskolar-main team) — **not needed before
  this step**; P4 and P5 proceed without them.
- **OwnerAddress policy** — recommend the org wallet in v1 (iskolar-main web used one);
  per-student wallets would drag Lumen wallet-auth into Academy's login — out of scope.
- **Backfill approach** for existing interim-stored documents (migrate-and-delete vs.
  keep-as-fallback) — see 3b.

### 3d. Docs produced in Step 3

`phases/PL-lumen-pass.md` (client — likely near-empty per 3a) + the server handoff above;
index row "PL" added after P5 in both `phases/README.md` files.

---

## Step 4 — PayMongo pass (last; swaps `payments.ts`'s simulated internals for real PayMongo)

**Why last:** same reasoning as Lumen — an external, credentialed integration that P4 and P5
were deliberately built not to depend on. `src/payments.ts` already exists (built in Step 1,
simulated mode); the confirm-modal UI/UX from Steps 1–2 already works end to end. This step
is a backend swap, not new UI from scratch — **but be honest that it's not as clean a swap
as the Lumen/`documents.ts` one**: a simulated capture is synchronous (click Authorize, get
an immediate result), while a real PayMongo capture is inherently asynchronous (create an
intent → redirect the browser to PayMongo's hosted checkout → the user pays there → a
webhook confirms later, possibly seconds to minutes after the redirect). The client's
"Redirecting to PayMongo…" pause was rehearsing a real redirect the whole time, but the
*completion* step changes from "immediate success" to "pending until the webhook lands" —
call this out explicitly in the phase doc rather than promising a zero-diff swap that isn't
true here.

Order relative to Step 3 doesn't matter — Lumen and PayMongo are independent integrations
(documents vs. money) and can run in either order, or in parallel if the owner wants to
split the work. Listed after Lumen here only because it was decided second.

### 4a. Client scope

The confirm modals (`FundDialog`, the tier-subscribe modal) keep their existing shape —
details/features shown, Authorize/Cancel. What changes:
- Authorize now actually **navigates the browser** to PayMongo's checkout URL (returned by
  the server) instead of running a local timer; on return, the grant/subscription shows
  **pending** until the webhook confirms, then flips to funded/subscribed — `LedgerReceipt`
  and the tier-success state both need a pending UI state that didn't exist in simulated mode.
- `SeatManager` → real `manageSeats()` call once seats have billing consequences.
- Invoices list → real data once recurring billing exists.
- No client SDK unless this step's reference pass proves one unavoidable (Rule 0.5) —
  default assumption stays server-driven intent/checkout-URL.

### 4b. Server scope (owner's, via handoff)

Written as **`academy-server/documentation/phases/PayMongo-pass-server.md`**, containing:
- `src/payments.ts` internals swap: `createContribution`/`subscribeToTier` no longer write
  the DB row directly — they create a real PayMongo intent/subscription and return a
  checkout URL; a new webhook handler performs the DB write **on confirmed payment**, with
  `provider: 'paymongo'` and the real processor reference. Same exported function names where
  possible, but the return shape changes (was: written row; now: a checkout URL) — this is
  the one real contract change, unlike documents.ts's zero-diff swap.
- `PAYMENTS_SIMULATED` flips to `false` in production — **hard-fail if it's still `true`**
  when real credentials aren't configured, so simulated mode can never silently reach a real
  user (Rule 0.7).
- Migration adding `payout`, `kyc_verification` (disbursement to students — out of scope
  until now), plus whatever recurring-billing/dunning schema §9.13 needs. Landmine now live
  for real (wasn't a risk in simulated mode): **webhook idempotency** — PayMongo retries,
  every write keyed on the processor reference, never assume single delivery.
- **Decide what happens to the simulated seed data** accumulated during Steps 1–2 (test
  `grant_contribution`/`subscription` rows with `provider: 'simulated'`) — wipe before go-live
  is the obvious default; flag it so it isn't forgotten.
- `grant_funded`/`grant_closed` notification emits (client union + ₱ renderer already shipped
  in P3 — these already fire in simulated mode from Step 1; verify they still fire correctly
  once completion becomes webhook-driven instead of synchronous) · dunning/past-due handling
  for subscriptions per §9.13.
- Real `FUNDING_BARS`/MRR — if Steps 1–2 already switched these to real queries over
  simulated data, no change needed here beyond the `provider` filter no longer mattering.

### 4c. Decisions the owner supplies before starting Step 4

- §9.8 escrow vs. direct · §9.9 KYC timing (Didit) · §9.10 platform fee · §9.11 currency /
  min-max / partial-vs-all-or-nothing / refunds — **all of plan §9's fund-flow items**.
- §9.12's pricing/seats (the entitlement-matrix half already landed in Step 2) · §9.13
  dunning — **all of plan §9's billing items**.
- PayMongo API keys (staging → production), webhook endpoint registration, and the
  simulated-seed-data disposition above.

### 4d. Docs produced in Step 4

`phases/PayMongo-pass.md` (client) + the server handoff above; both phase docs (`P4`, `P5`)
get their simulated-mode Open Items flipped to done in the same change.

---

## Decisions & Trade-offs

- **Real interim storage (Postgres `bytea`), not a filename-only placeholder** — decided
  2026-07-13. Closes the functional gap (reviewers/sponsors/admins can open real documents)
  multiple phases before Lumen exists, at the cost of one small migration to backfill into
  Lumen later.
- **SQLite was proposed and rejected** — it would add a second database engine to a project
  that deliberately standardized on one (`db.ts`'s pooled Postgres connection, Goose
  migrations). No shared migration tooling, no shared connection/backup story, and a SQLite
  file needs a persistent local disk — a real risk on typical ephemeral-filesystem container
  deploys, which Postgres and the storage the app already provisions don't have.
- **One shared `documents.ts` module, not per-domain storage code** — every future swap
  (Postgres → Lumen) happens once, behind one interface, instead of four times.
- **Reads are app-auth-gated, not signed-URL, during the interim** — stricter than the
  eventual Lumen model, so there's no security regression to fix later, only a UX shape
  (same-origin stream vs. signed link) to potentially adjust in Step 3.
- **Simulated checkout, not "Coming soon" and not a silent default** — decided 2026-07-13,
  revised same-day from an initial flat-"Coming soon" proposal on the owner's direction.
  Rejected two alternatives: a disabled placeholder (demos nothing, tests nothing) and a
  silent top-tier/auto-fund default (real gating never gets exercised through its actual UI,
  and a hidden default is easy to mistake for real behavior later). The simulated checkout
  exercises the real click-through UX, produces real inspectable DB rows for entitlement/
  ledger logic to run against, and swaps cleanly later — while staying honest via explicit
  "prototype, no real payment" modal copy and a `provider` column that never lets a simulated
  row be confused with a real one in the data itself.
- **`payments.ts` mirrors `documents.ts`'s one-module-swap shape** — built once in Step 1
  with simulated internals, its backend swapped in Step 4 for real PayMongo calls. Unlike
  documents.ts, the swap isn't a clean zero-diff: real payment capture is asynchronous
  (redirect + webhook) where simulated capture is synchronous, so Step 4's client work is
  larger than "remove a gate" — see Step 4's honest framing of this.
- **The kill-switch is mandatory, not optional** — `PAYMENTS_SIMULATED` (or equivalent) must
  exist from the moment `payments.ts` does, defaulting to simulated everywhere except
  production, and production must hard-fail rather than silently accept simulated
  transactions if real credentials aren't configured. A prototype payment flow that could
  accidentally process as "real" for an actual user is the one outcome this whole design
  exists to prevent.

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
| Nothing in Step 1 (P4) — the simulated fund flow needs no pricing/escrow/KYC decision (amount is free-entry, capture is synchronous-simulated) | — (§9.8–9.11 moved to Step 4 below) |
| Step 2 (P5) start | §9.12's **entitlement matrix only** (what each tier unlocks) — pricing/seats are payment-specific and moved to Step 4; the tier modal borrows the template's illustrative price meanwhile · §9.14 vault grant duration/revoke/watermark · §9.15 badge source (manual admin recommended for v1) |
| Step 3 (Lumen pass) start | Staging `LUMEN_WALLET_*` credentials · OwnerAddress = org wallet? (recommended) · backfill approach for interim-stored documents |
| Step 4 (PayMongo pass) start | §9.8 escrow vs direct · §9.9 KYC timing (Didit) · §9.10 platform fee · §9.11 currency/min-max/refunds · §9.12's pricing/seats · §9.13 dunning · PayMongo API keys + webhook registration · disposition of Steps 1–2's simulated seed data |
