# 15 — Admin "Add Grant" (client)

**Status:** 🔨 In progress (built; awaiting product answers in the server doc's Open Items)
**Date:** 2026-11-01
**Repo(s):** academy-client (this doc) · academy-server (`documentation/09-admin-add-grant-server.md`)
**Traces to:** PRD FR-G3 · ADM-02 · admin Add Grant request
**Commit/PR:** —

## Goal

Add a "Grants" tab to the admin console with an Add Grant form and a grant list that has a reason-required Cancel action.

## What Was Built

1. **Model + API**
   - **File:** `src/lib/grant/model.ts`, `src/lib/grant/api.ts`
   - **Functions:** `ADMIN_GRANT_CONFIG` (mirrors the server), `adminGrantFormSchema`, `adminGrantListSchema`, `studentSearchHitSchema`, `adminGrantsQuery`, `studentSearchQuery`, `createAdminGrant`
2. **Hooks**
   - **File:** `src/hooks/grant/useAdminGrants.ts`
   - **Functions:** `useAdminGrants`, `useStudentSearch`, `useCreateAdminGrant`
3. **UI**
   - **File:** `src/components/admin/AddGrantForm.tsx`, `src/components/admin/AdminGrantsPanel.tsx`, `src/routes/admin/dashboard.tsx`
   - **Purpose:** A debounced student picker (name + school only), title/description with character counters, a whole-peso goal, a PDF upload, and an internal note. The list shows status chips, raised/goal/percent, backers, and totals. Cancel reuses `ConfirmActionDialog`, which already blocks a blank reason. Styling reuses the `GrantForm` and `ModerationPanel` classes.

## Decisions & Trade-offs

- Client checks are UX only. The server checks the PDF signature, which the browser can't be trusted with.
- No contact details are fetched anywhere in this surface.

## Verification

- `tsc --noEmit` clean. `biome check` clean on touched files.
- Not yet clicked through in a browser.

## Open Items

- See the server doc.
