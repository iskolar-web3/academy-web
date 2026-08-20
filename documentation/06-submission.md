# Phase 06 — Submission (Project Draft → MVP Gate → Members/Consent → Ownership → Lifecycle)

**Status:** ✅ Client done · ✅ server live
**Date:** 2026-07-03 (core) · 2026-07-06 (invites + STU-02 backfill, closed by Phase 08) · 2026-07-13 (thesis upload, client + server)
**Repo(s):** academy-client (this doc) · academy-server (`project/` — see `academy-server/documentation/04-submission-server.md`)
**Traces to:** PRD — FR-ST1…ST11, FR-S4 (uploads), FR-N4 (Lumen storage) · Plan — §6, §7 (Phase 1) · Stories — STU-03, STU-04, STU-05, STU-06, STU-07, STU-08, STU-09, STU-10, STU-11
**Commit/PR:** —

## Goal

Let a student create a project as a draft, pass the three-URL MVP gate, declare ownership (uploading the thesis paper for thesis/capstone), choose individual/team with credited members + consent, and manage the full lifecycle from a dashboard (edit, delete draft, resubmit-returned, withdraw, edit-after-publish re-review).

## What Was Built

1. **Project model, api, mock-then-real swap**
   - **File:** `src/lib/project/api.ts`, `src/lib/project/model.ts`, `src/lib/project/helper.ts`
   - **Functions/Components:** `Project`, `ProjectStatus` (draft\|submitted\|under_review\|returned\|published\|withdrawn\|rejected), MVP-gate `.refine()` on the submit schema, `getMyProjectsQuery`, `createDraft`, `submitProject`, `withdrawProject`, `resubmitProject`
   - **Purpose:** Built client-only first against an in-memory mock store so create → dashboard → submit → lifecycle worked end-to-end, then swapped to `apiFetch` against the live server contract once `academy-server`'s `project` slice shipped; `lib/project/mock.ts` was deleted, no orphaned consumers.
2. **Submit wizard modal**
   - **File:** `src/components/project/SubmitProjectModal.tsx`, `src/routes/student/projects/new.tsx`, `src/routes/student/projects/$projectId/edit.tsx`
   - **Purpose:** A 1:1 port of the design-template's 760px modal with a 5-step numbered stepper (Details · MVP · Team · Ownership · Review), opened from the dashboard's "+ Submit a project" button rather than a standalone page; `/student/projects/new` redirects to the dashboard. Edit unified onto the same modal, prefilled via `projectToFormValues`, carrying the STU-11 re-review notice — the earlier page-based `ProjectForm` and its subfields were removed, and the stricter `helper.mvpGateIssues` was retired in favor of the modal's single gate (demo + repo required, video optional).
3. **Project detail + dashboard**
   - **File:** `src/components/project/ProjectDetailView.tsx`, `src/routes/student/home.tsx`, `src/components/account/StudentProfileCard.tsx`, `src/components/project/MyProjectCard.tsx`, `src/components/project/ProjectPipeline.tsx`, `src/lib/project/helper.ts`
   - **Functions/Components:** `pipelineSteps`, `dashboardStats`, `dashboardAction`, `statusChipClass`, `projectCover`, `hueFromString`
   - **Purpose:** Project detail rebuilt to the design-template (gradient cover, two-column body, a side rail for MVP links + lifecycle actions), viewer-aware (owner\|sponsor\|public). The dashboard lives at `/student/home` — a 1:1 build of the design-template STUDENT DASHBOARD: a sticky profile sidebar (gradient header, rounded avatar, skills chips), four stat tiles, and per-project cards (hue color bar + status badge + a Draft→Submitted→In review→Published pipeline stepper). `/student/projects` redirects here; the earlier `MyProjectsTable` was removed — the template's single-action-per-card design meant submit/resubmit/withdraw/delete all moved onto the project **detail** page instead of the dashboard.
4. **Thesis-paper upload**
   - **File:** `src/lib/api.ts` (`apiUpload`), `src/lib/project/api.ts` (`uploadThesisPaper`, `thesisPaperUrl`), `src/hooks/project/useProjectMutations.ts`
   - **Purpose:** Real multipart upload — `POST /projects/:id/thesis` — wired into the submit/edit flow (save → upload if a new file was picked → submit/resubmit). The picker shows "Uploading…" while pending and "Replace" once a file exists; the detail page and admin review modal both gained a "View" link opened in a new tab (the SSO cookie rides the top-level navigation, no CORS involved). Not blocked on Lumen — storage is interim (Postgres `bytea` via the server's `documents.ts` module), swapped for Lumen later behind the same client contract. The server independently stopped trusting the client's optimistically-echoed `thesisPaperName` on save — only the upload route itself sets it, so a failed upload can never leave a phantom "View" link.
5. **Membership invitations**
   - **File:** `src/components/project/IncomingInvites.tsx`
   - **Purpose:** Shipped stubbed first (static seed, local state) pending the notification model, then rewired in Phase 08 to render live `member_invite` notifications and post real accept/decline.
6. **Public-profile published-work backfill**
   - **File:** `src/components/account/ProfileView.tsx`, `src/routes/_app/u.$userId.tsx`
   - **Purpose:** `/u/$userId` reads the live `?owner=` discovery query once discovery data existed (Phase 08) — closing the stub Phase 05 left open.

## Decisions & Trade-offs

- **Multi-step form over one giant form** — the submit flow has distinct gates (fields → MVP → ownership → team); stepping keeps validation legible and matches the gate semantics.
- **MVP gate as a Zod `.refine()`** on the submit schema, not ad-hoc checks — schema is the single source of truth; the draft schema stays lax, the submit schema strict.
- **Non-user members allowed** — name + contribution only; consent applies only to linked iSkolar users.
- **Thesis paper → Lumen vault, not S3** — provenance/tamper-evidence is native to Lumen; only general media goes to S3. Interim: stored for real in Postgres `bytea` behind the server's `documents.ts` module until the Lumen pass swaps the backend — the client contract doesn't change either way.

## Verification

- Draft saves without MVP/ownership; submit blocked until 3 well-formed URLs + ownership satisfied.
- thesis_capstone submit requires a thesis-paper upload; idea requires only the declaration tick.
- Dashboard reflects all 7 statuses; withdraw removes from public surfaces and stays resubmittable.
- Editing description/non-MVP fields stays published; changing MVP link/title/category re-enters `under_review` with a pre-apply warning.
- `pnpm exec tsc --noEmit`, `pnpm exec biome check`, `pnpm build` — clean after each increment, including the thesis-upload retrofit.

## Open Items

- **Linked-member picker** — the submit modal's "linked" toggle is a checkbox, not a real identifier input; `formToProjectInput` sends placeholder `linkedUserId: "linked-N"` ids, so a real invite can never reach a real user through the UI yet. The server already defines `linkedUserId` as the invitee's iSkolar user id and tolerates the placeholders — closing the loop needs a member-identifier field / user search in the modal.
- Video hosting (external URL vs. S3 upload) for the MVP video field is still an open product decision — external link is the working assumption.
