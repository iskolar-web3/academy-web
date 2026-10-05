# Phase 12 — Landing content audit

**Status:** ✅ Done
**Date:** 2026-10-06
**Repo(s):** academy-client (academy-server inspected)
**Traces to:** Owner-requested comparison of landing content with current implementation
**Commit/PR:** —

## Goal

Make the public landing page describe what visitors can actually do in the current application.

## What Was Built

Audited all landing components and their sign-in entry point against the frontend forms, hooks, API clients, backend routes, validation, repositories, and feature configuration. Checked the application route composition, project submission and verification, admin review, discovery, sponsor interest and notifications, grants and payments, and supporting subscription/vault/watchlist/badge features.

| Claim or behavior | Implementation evidence | Landing correction |
| --- | --- | --- |
| Projects are "seen and funded"; "Fund your thesis" | `server/src/payments.ts` only writes simulated contributions and subscriptions; no external payment call exists. | Hero emphasizes visibility; grant benefit describes proposal submission and explicitly states payments are not live. Footer now says Connect. |
| Submission suggests a video is required | `server/src/project/model.ts` requires demo/repository URLs and ownership; `web/src/lib/project/reviewChecks.ts` treats video as optional. | Benefit copy explicitly labels video optional. Submission step mentions project details and required supporting documents. |
| All teammates approve their credits | `web/src/lib/project/helper.ts` still generates `linked-${i}` identities rather than selecting real accounts. Server consent routes exist, but this frontend linkage is incomplete. | Removed the promise of a working teammate-approval flow from the landing. |
| Grant application follows MVP review | `server/src/grant/server.ts` and its repository create proposals separately with a required PDF; they do not require a published project. | Timeline is explicitly about project publication; grant proposals are described separately. |
| Students choose when to connect | `server/src/interest/repository.ts` sends the owner a notification linking to the sponsor profile. | Describes interest notifications and optional follow-up, without suggesting built-in messaging. |
| Sign in to see "every" project or "browse all" | `server/src/discover/repository.ts` caps the gallery at 48 and public teaser at 3. | Describes searching/filtering the showcase without promising an unlimited result list. |
| Card button says "Sign in to view" | `useSignInAction` routes through onboarding or a role dashboard, not directly to the selected project. | Card action now says "Sign in to explore". |
| Preview silently renders no cards on loading, failure, or empty result | `RecentProjectsPreview` previously treated missing data as an empty list. | Distinct loading, failure, and genuinely empty messages. |

Updated the hero, benefit cards, publication timeline, CTA, footer, sign-in benefit list, project preview, and both page/social descriptions. Existing branding, visual design, and supported Google/iSkolar sign-in copy were retained.

## Decisions & Trade-offs

- Keep the implemented grant-proposal feature visible while explaining the payment limitation in user-facing language.
- Use the actual source behavior as evidence; older roadmap comments do not establish that a feature works.
- This is a landing content correction, not an implementation of payments or teammate linking.

## Verification

- TypeScript check passed.
- Biome checks passed for changed source files; unrelated existing CRLF formatting findings in untouched landing helpers were not changed.
- Production build and a request to the built SSR handler verified the updated landing copy and metadata.

## Open Items

- Deploy the frontend for the revised copy to appear publicly.
- Payments and the teammate account picker remain implementation gaps. Revisit the related copy when those features ship.
- This audit checked the workspace implementation, not the configuration or data of the production deployment.
