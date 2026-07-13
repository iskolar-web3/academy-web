# Phase P1 — Submission (Project Draft → MVP Gate → Members/Consent → Ownership → Lifecycle)

**Status:** ✅ **Core done** · ✅ **invites + STU-02 backfill closed by P3** (2026-07-06) · ✅ **Thesis upload done, client + server** (2026-07-13) · 🔨 **Deferred** (linked-member picker — see P3 Open Items)
**Target:** after P0

### What's done vs still in progress

| | Scope | State |
|---|---|---|
| ✅ Done | Draft create/edit, submit-wizard modal (5-step, MVP gate), project detail (viewer-aware), full lifecycle actions (submit/resubmit/withdraw/delete), STU-11 re-review, dashboard + pipeline. **`lib/project/api.ts` calls the live server** (mock store retired). | Shipped, green |
| ✅ Closed (2026-07-13) | **Thesis upload (STU-05)** — real multipart upload (`uploadThesisPaper` → `POST /projects/:id/thesis`), wired into the submit/edit flow (save → upload → submit/resubmit), plus a "View" read-link on the owner detail page and the admin review modal. Not blocked on Lumen: storage is interim, real (Postgres `bytea`, see `next-steps-lumen-p4-p5.md`), swapped for Lumen later behind the same contract. Server shipped via `academy-server/documentation/phases/thesis-storage-retrofit-server.md` (30/30 in-process) — also closed a race the server team caught before implementing: the server no longer trusts the client's optimistically-echoed `thesisPaperName` on save, only the upload route itself sets it, so a failed upload can never leave a phantom "View" link. | Shipped, client + server |
| ✅ Closed by P3 (2026-07-06) | **Incoming invites (STU-08)** — `IncomingInvites` now renders live `member_invite` notifications and posts real accept/decline. **Public-profile published-work backfill (STU-02)** — `/u/$userId` reads the live `?owner=` discovery query. ⚠️ Caveat: the invite loop only delivers end-to-end once the modal's linked-member checkbox becomes a real identifier picker (tracked in the **P3** doc's Open Items). | Shipped with P3 |

> The remaining deferred item (linked-member picker) is tracked in the **P3** doc's Open
> Items. The thesis-upload item above is no longer gated on Lumen — see
> `documentation/phases/next-steps-lumen-p4-p5.md` for the storage-sequencing decision.

> **Update (thesis-upload retrofit, 2026-07-13):** `SubmitProjectModal` now uploads the
> picked PDF for real via a new `apiUpload` multipart helper (`lib/api.ts`) and
> `uploadThesisPaper()`/`thesisPaperUrl()` (`lib/project/api.ts`), through a new
> `uploadThesis` mutation (`useProjectMutations`). Flow: save (create/update) → upload (if a
> new file was picked) → submit/resubmit, all inside the existing try/catch → `toast.error`
> chain. The picker shows "Uploading…" while pending and "Replace" once a file exists;
> `ProjectDetailView` and `ReviewDecisionModal` both gained a "View" link to the stored PDF
> (`thesisPaperUrl`, opened in a new tab — the browser sends the SSO cookie on the top-level
> navigation, no CORS/fetch involved). No new packages; `tsc`/`biome`/`pnpm build` all green.

> **Build note (2026-07-01):** the `project` slice is built client-only. `lib/project/api.ts`
> is backed by an in-memory mock store (`lib/project/mock.ts`) so create → dashboard → submit
> → lifecycle works end-to-end; swap each body to `apiFetch` when `academy-server` lands.
> Routes use the **visible** `/student/projects/*` segment (see `../website-structure.md`).
>
> **Update (dashboard, design-template match):** the my-projects dashboard now lives at
> `/student/home` as a **1:1 build of the design-template STUDENT DASHBOARD** — a sticky
> profile sidebar (`components/account/StudentProfileCard`), four stat tiles, and per-project
> cards (`components/project/MyProjectCard`) with a lifecycle **pipeline tracker**
> (`components/project/ProjectPipeline`, `helper.pipelineSteps`). `MyProjectsTable` was
> removed; `/student/projects` now redirects to `/student/home`. Destructive lifecycle
> actions (submit/resubmit/withdraw/delete) live on the project **detail** page. Project
> gained server-owned display fields (`upvotes`, `hue`, `school`) to match the card. Profile
> detail (school/skills) is placeholder until the profile API lands (STU-01/02).
> **Stubbed pending server:** thesis-paper upload is a validated **file picker only** (no Lumen
> upload); linked-member invites show a **mock "consent pending"** state — invite accept/decline
> (STU-08) waits on the P3 notification model. The public-profile published-work backfill
> (STU-02) is also deferred to when discovery data lands.
>
> **Update (submit wizard = modal, 2026-07-03):** submitting is now a **1:1 port of the
> design-template SUBMIT WIZARD MODAL** (`components/project/SubmitProjectModal`) — a 760px
> modal with a 5-step numbered stepper (Details · MVP · Team · Ownership · Review), opened from
> the dashboard "+ Submit a project" button (state on `/student/home`), not a standalone page.
> `/student/projects/new` now **redirects** to `/student/home`.
>
> **Update (P1 client finished to contract, 2026-07-03):**
> - **Project Detail rebuilt** to the design-template PROJECT DETAIL (`components/project/ProjectDetailView`)
>   — gradient cover banner, two-column body (pitch · purpose quote · tech · team) + a side rail
>   (interact/manage card · MVP links · Venture Pitch Vault [P5 stub]). Viewer-aware
>   (`owner|sponsor|public`); the owner route feeds the manage card (status · returned note ·
>   lifecycle actions). Sponsor "Express interest"/public are stubs until **P3**.
> - **Edit unified onto the modal** — `$projectId/edit` now opens `SubmitProjectModal` **prefilled**
>   (`projectToFormValues`), with the STU-11 re-review notice; the page-based `ProjectForm` +
>   its subfields were **removed**. The MVP gate now lives solely in the modal (template-accurate:
>   demo+repo required, video optional) — the stricter `helper.mvpGateIssues` was **removed**,
>   resolving the create/edit gate discrepancy.
> - **Membership invitations (STU-08)** — `components/project/IncomingInvites` on the dashboard
>   (Accept/Decline). **Stubbed** (static seed, local state) pending the P3 notification model.
> - **API swapped mock → real** — `lib/project/api.ts` now calls `apiFetch` against the P1
>   endpoint contract (parsed via `projectSchema`); `lib/project/mock.ts` was **removed**. Hooks
>   and UI are unchanged. Surfaces show loading/empty/error states until the server slice ships
>   (`academy-server/documentation/phases/P1-submission-server.md`).
**Repo(s):** academy-client (this doc) · academy-server (`project/`)
**Traces to:** PRD — FR-ST1…ST11, FR-S4 (uploads), FR-N4 (Lumen storage) · Plan — §6, §7 (Phase 1) · Stories — STU-03, STU-04, STU-05, STU-06, STU-07, STU-08, STU-09, STU-10, STU-11
**Commit/PR:** —

## Goal

Let a student create a project as a draft, pass the three-URL MVP gate, declare ownership (uploading the thesis paper for thesis/capstone), choose individual/team with credited members + consent, and manage the full lifecycle from a dashboard (edit, delete draft, resubmit-returned, withdraw, edit-after-publish re-review).

## Stories in Scope

| Story | Title | FE surface |
|---|---|---|
| STU-03 | Create project (draft) | `_student/projects/new` |
| STU-04 | MVP submission gate | project form validation |
| STU-05 | Ownership + thesis upload | ownership step + Lumen upload |
| STU-06 | Individual or team | submit toggle |
| STU-07 | Team members & contributions | members subform |
| STU-08 | Respond to membership invite | invite accept/decline |
| STU-09 | My projects dashboard | `_student/projects` |
| STU-10 | Withdraw published | dashboard action |
| STU-11 | Edit after publish | edit flow w/ re-review notice |

## Planned Build (by FE slice)

### `project` slice
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/lib/project/api.ts` | lib | **Create** | `getMyProjectsQuery()`, `getProjectQuery(id)`, `createDraft()`, `updateProject()`, `submitProject()`, `deleteDraft()`, `withdrawProject()`, `resubmitProject()`. |
| `src/lib/project/model.ts` | lib | **Create** | `Project`, `ProjectStatus` (draft\|submitted\|under_review\|returned\|published\|withdrawn\|rejected), `ProjectType` (idea\|thesis_capstone), `Category` fixed list, draft + submit Zod schemas (MVP-gate refinement: 3 well-formed URLs). |
| `src/lib/project/helper.ts` | lib | **Create** | Pure: URL well-formedness, "edit triggers re-review?" predicate (MVP-link/title/category change), status → next-action map. |
| `src/lib/ownership/api.ts` | lib | **Create** | `declareOwnership()`, thesis-paper upload to Lumen vault (`thesis-papers/`); returns stored key. |
| `src/lib/ownership/model.ts` | lib | **Create** | `OwnershipDeclaration` type + schema (thesis paper required iff thesis_capstone). |
| `src/hooks/project/useMyProjects.ts` | hook | **Create** | Dashboard list query. |
| `src/hooks/project/useProject.ts` | hook | **Create** | Single project query. |
| `src/hooks/project/useProjectMutations.ts` | hook | **Create** | create/update/submit/delete/withdraw/resubmit mutations + invalidation. |
| `src/hooks/project/useProjectMembers.ts` | hook | **Create** | Member CRUD + invite. |
| `src/hooks/notification/useInviteResponse.ts` | hook | **Create** | Accept/decline a `member_invite` (STU-08). |

### Routes
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/routes/_student/projects/index.tsx` | route | **Create** | My-projects dashboard (STU-09): status list, actions. |
| `src/routes/_student/projects/new.tsx` | route | **Create** | Create-draft → submit wizard (STU-03…07). |
| `src/routes/_student/projects/$projectId/index.tsx` | route | **Create** | Owner project view (status, returned notes). |
| `src/routes/_student/projects/$projectId/edit.tsx` | route | **Create** | Edit; surfaces re-review warning (STU-11). |
| `src/routeTree.gen.ts` | generated | **Affect** | `pnpm generate-routes`. |

### Components
| File | Layer | Create·Affect | Purpose |
|---|---|---|---|
| `src/components/project/ProjectForm/ProjectForm.tsx` | component | **Create** | Multi-step form shell (draft fields → MVP → ownership → team). |
| `src/components/project/ProjectForm/MvpLinksField.tsx` | component | **Create** | live URL + repo + video, inline validation (STU-04). |
| `src/components/project/ProjectForm/OwnershipStep.tsx` | component | **Create** | Self-declaration tick + conditional thesis-paper upload (STU-05). |
| `src/components/project/ProjectForm/MembersField.tsx` | component | **Create** | Add members + contribution; user vs non-user; invite (STU-06/07). |
| `src/components/project/ProjectStatusBadge.tsx` | component | **Create** | Lifecycle status pill. |
| `src/components/project/MyProjectsTable.tsx` | component | **Create** | Dashboard table + per-status actions (STU-09/10). |
| `src/components/profile/ProfileView.tsx` | component | **Affect** | Fill the "published projects worked on" list (owner + accepted member). |
| `src/utils/fileHandling.utils.ts` | util | **Create** | Size + MIME allow-list checks before upload (FR-S4). |

### Server (academy-server — cross-reference)
`project/` slice (`server.ts` + `repository.ts` + `model.ts` + `query.ts`): draft/submit/lifecycle, `project_member` consent, `ownership_declaration` + Lumen `thesis-papers/` upload via `lumen.ts`; migrations for `project`, `project_member`, `ownership_declaration`.

## Implementation Process (ordered)

1. `lib/project` model + api + helper (status machine, MVP-gate schema).
2. Draft create/edit (STU-03) on `projects/new` + `projects/$id/edit`.
3. MVP-gate field + submit transition (STU-04).
4. Ownership step + Lumen thesis-paper upload (STU-05); wire `utils/fileHandling`.
5. Individual/team toggle + members subform + invite (STU-06/07); invite accept/decline (STU-08, leans on P3 notification model — stub the notification create until P3, or land notification model early).
6. Dashboard with lifecycle actions: edit, delete draft, resubmit, withdraw (STU-09/10).
7. Edit-after-publish predicate + re-review warning UX (STU-11).
8. Backfill public-profile published-work list (STU-02 completion).
9. `pnpm generate-routes`, `pnpm check`.

## Decisions & Trade-offs

- **Multi-step form over one giant form** — the submit flow has distinct gates (fields → MVP → ownership → team); stepping keeps validation legible and matches the gate semantics.
- **MVP gate as a Zod `.refine()`** on the submit schema, not ad-hoc checks — schema is the single source of truth; draft schema is lax, submit schema strict.
- **Non-user members allowed** (plan §9.3 recommendation) — name + contribution only; consent applies only to linked iSkolar users.
- **Thesis paper → Lumen vault, not S3** (FR-N4) — provenance/tamper-evidence is native to Lumen; only general media goes to S3. **Interim (2026-07-13):** stored for real in Postgres `bytea` behind the server's `documents.ts` module until the Lumen pass swaps the backend — see `next-steps-lumen-p4-p5.md`. The client contract (`uploadThesisPaper`/`thesisPaperUrl`) doesn't change either way.

## Dependencies & Open Items

- **Depends on:** P0 (auth, student route group, profile).
- **Cross-phase:** STU-08 invite response needs the `notification` model — either land the notification slice early or stub the create call until P3.
- **Open:** §9.2 video hosting (external URL vs S3 upload) changes the MVP video field — recommend external link in v1.

## Verification Plan

- Draft saves without MVP/ownership; submit blocked until 3 well-formed URLs + ownership satisfied (STU-03/04).
- thesis_capstone submit requires a thesis-paper upload; idea requires only the declaration tick (STU-05).
- Linked member stays uncredited until accept; declined never shown (STU-07/08).
- Dashboard reflects all 7 statuses; withdraw removes from public surfaces and stays resubmittable (STU-09/10).
- Editing description/non-MVP links stays published; changing MVP link/title/category re-enters `under_review` with a pre-apply warning (STU-11).
- `pnpm check` clean.
