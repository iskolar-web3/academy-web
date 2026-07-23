# Phase 06 — Sign-in Popover, Onboarding Basic-Info, 3-Column Layout, Startup Project Type

**Status:** ✅ Done (client) · ✅ server live
**Date:** 2026-07-19
**Repo(s):** academy-client (this doc) · academy-server (handoff — `documentation/phases/onboarding-basic-info-and-startup-type-server.md`)
**Traces to:** Owner-directed addition, layered on top of the existing plan rather than replacing it — see the handoff doc's note on `documents/iskolar-academy-plan.md` §4's existing "startup/incubation track" framing.
**Commit/PR:** —

## Goal

Four requests from the same conversation, bundled because they landed together, not because
they're one feature: (1) turn the landing page's "Sign in" into a popover anchored below the
button instead of a full-page navigation; (2) give every fresh account a second onboarding
step for basic info (name + school/org), since today `role-select` is the *entire* onboarding
flow and a JIT-provisioned user's name stays blank forever unless they separately find
profile-edit; (3) move the sponsor/student side rail from wherever it happened to sit
per-page onto one consistent left column, freeing the right column for a (currently
hardcoded) ad slot across the five main app pages; (4) add a third project type, `startup`,
for an already-operating company using Academy to reach investors.

## What Was Built

1. **Sign-in popover (widened mid-build — see below)**
   - **File:** `src/components/ui/popover.tsx`, `src/hooks/auth/useSignInAction.ts`, `src/components/landing/SignInPopover.tsx`, `src/components/landing/LandingHeader.tsx`, `src/components/landing/Hero.tsx`, `src/components/landing/LandingCta.tsx`, `src/routes/_public/login.tsx`
   - **Functions/Components:** `<Popover>`/`<PopoverTrigger>`/`<PopoverContent>` (new Radix primitive, restyled to the existing header-popover language), `useSignInAction()`, `<SignInPopover>`
   - **Purpose:** The SSO-redirect/dev-cookie-check logic moved out of the `/login` route into a shared hook so both the full page (still the redirect target for guards/logout) and the popover use one flow. First pass only converted the header's compact "Sign in" button, leaving the two larger marketing CTAs (`Hero.tsx`'s hero button, `LandingCta.tsx`'s bottom-of-page button) as plain links to `/login` — the product owner still hit a full-page login by clicking one of those, correctly read as "the login page is still there." All three landing sign-in entries now open the same popover; `/login` itself is unchanged and still exists purely as the redirect target for guards/logout/settings sign-out.

2. **Onboarding basic-info step (corrected mid-build — see below)**
   - **File:** `src/lib/auth/model.ts`, `src/lib/account/model.ts`, `src/lib/account/api.ts`, `src/hooks/auth/useCompleteOnboarding.ts`, `src/hooks/auth/useRouteGuard.ts`, `src/routes/_onboarding/basic-info.tsx`, `src/routes/_onboarding/role-select.tsx`
   - **Functions/Components:** `onboardingCompleted` (new field on `AcademyUser`), `studentOnboardingSchema`/`sponsorOnboardingSchema`/`adminOnboardingSchema`/`OnboardingInput`, `GENDERS`/`EDUCATION_LEVELS`, `completeOnboarding()`, `useCompleteOnboarding()`, `<BasicInfo>` (role-conditional: `<StudentForm>`/`<SponsorForm>`/`<AdminForm>`)
   - **Purpose:** A second onboarding step, gated by a new `onboardingCompleted` flag, one form per role — **not** fetched from iSkolar-main itself (no cross-service API exists for academy-server to pull profile data — confirmed by reading `iskolar-main/server/src/student/server.ts`, which only exposes a self-scoped `GET /students/me`), stored independently in Academy's own tables. First pass at this shipped a 2-field stand-in (full name + school/org) reusing `profileEditSchema`'s existing fields — **wrong**, called out directly by the product owner as not resembling iSkolar-main's actual onboarding at all. Corrected by reading `iskolar-main/web/src/lib/student/model.ts` and `.../sponsor/model.ts` properly: iSkolar-main has **four** onboarding forms (student; individual/organization/government sponsor), each with different fields. Student now collects first/middle/last name, gender, birth date, phone, education level, and school — the same fields iSkolar-main's student form collects. Sponsor collects display name, organization, and phone — a single non-branching form, since Academy's `sponsor` role has no individual/organization/government split anywhere else in the product (subscription/vault/badge all treat sponsor as one role); branching onboarding three ways would introduce a distinction nothing downstream uses. Admin has no iSkolar-main counterpart — just a name. `useRouteGuard` sends a role-confirmed-but-not-onboarded user to `/basic-info`, the same way it already sent a role-unconfirmed user to `/role-select`; `role-select.tsx` always continues to `/basic-info` next.

3. **Shared 3-column page shell**
   - **File:** `src/components/layout/AppPageLayout.tsx`, `src/components/layout/AdsPanel.tsx`, `src/hooks/account/useProfilePanel.ts`, `src/components/discover/SponsorRail.tsx`, `src/routes/{student/home,sponsor/home,_app/discover,_app/grants,_app/grants.$grantId}.tsx`
   - **Functions/Components:** `<AppPageLayout left right>`, `<AdsPanel>` (hardcoded placeholder ad cards), `useProfilePanel()`
   - **Purpose:** One shared left/middle/right grid now wraps discover, grants, grant detail, sponsor home, and student home (never settings/profile-edit/notifications). Left column is role-conditional — `SponsorRail` for sponsors (moved off its old hardcoded `w-[320px]` right-side placement to fill whatever width `AppPageLayout`'s left track gives it), `StudentProfileCard` for student/admin via the new `useProfilePanel()` hook. That hook also fixes a real staleness bug found while wiring it: `student/home.tsx` was building the profile card from hardcoded placeholder text ("UP Diliman", a fixed skills list) with a comment saying so, even though the real profile API had shipped back in P0 — it now reads the live `displayName`/`org`/`skills` from `useMyProfile()`, the same source `ProfileEditForm` already uses (so onboarding-entered values show up prefilled there for free, no separate wiring needed — verified by reading `ProfileEditForm.tsx`'s existing `defaultValues`).

4. **`startup` project type**
   - **File:** `src/lib/project/model.ts`, `src/lib/project/helper.ts`, `src/components/project/SubmitProjectModal.tsx`, `src/components/discover/DiscoverCard.tsx`, `src/components/project/ProjectDetailView.tsx`, `src/components/admin/ReviewQueuePanel.tsx`, `src/components/admin/ReviewDecisionModal.tsx`, `src/utils/fileHandling.ts`
   - **Functions/Components:** `PROJECT_TYPES` (+`"startup"`), `PROJECT_TYPE_LABELS` (new — replaces four identical hand-copied `TYPE_LABEL` maps), `requiresDocumentUpload()`, `documentLabel()`
   - **Purpose:** `startup` reuses every existing project field and the existing document-upload gate — extended from `thesis_capstone`-only to `thesis_capstone` **or** `startup` — just relabeled ("pitch deck" instead of "thesis paper" in the submit wizard and admin review). `idea` still requires no document, unchanged. Centralizing the four duplicate `TYPE_LABEL` maps into one `PROJECT_TYPE_LABELS` export was the direct, minimal way to add the new label once instead of four times, not a speculative refactor.

5. **Onboarding form UI parity + `/login` deletion (second correction round)**
   - **File:** `src/components/ui/calendar.tsx` (new), `src/routes/_onboarding/basic-info.tsx`, `src/components/landing/SignInPopover.tsx`, `src/routes/_public/login.tsx` (**deleted**), `src/hooks/auth/useRouteGuard.ts`, `src/components/layout/RoleNav.tsx`, `src/routes/_app/settings.tsx`, `package.json` (+`react-day-picker`, +`date-fns`)
   - **Functions/Components:** `<Calendar>` (Radix Popover + `react-day-picker`, restyled to Academy's tokens, single-mode only), `<BirthDateField>`, `studentFormSchema` (client-only draft schema, plain non-empty strings so gender/education-level selects start on a real placeholder instead of a silently-picked default)
   - **Purpose:** The first onboarding build still didn't match iSkolar-main closely enough — the owner flagged three concrete gaps: (a) the birth-date field was a native `<input type="date">`, which renders the browser's own generic calendar chrome instead of anything the app controls; (b) the gender select defaulted to `"male"` and education level to `"tertiary_education"` with no real "nothing chosen yet" state, so a user could submit without ever making a real choice; (c) education-level option labels were bare "Secondary"/"Tertiary" instead of iSkolar-main's actual copy. Fixed by reading `iskolar-main/web/src/routes/_onboarding/profile-setup/student.tsx` and its `package.json` directly: it uses `react-day-picker` `^9.12.0` + `date-fns` `^4.1.0` behind a Popover, a `"Set birth date"` placeholder button, dropdown month/year caption, future dates disabled — added as Academy's first consumer of both packages, restyled to Academy's own tokens rather than the generic shadcn ones (matching the existing restyle convention for `popover.tsx`/`dropdown-menu.tsx`), not iskolar-main's literal CSS classes. Gender/education-level selects now open on a disabled placeholder option ("Select your gender" / "Select your education level" — the exact wording iSkolar-main uses) with `mode: "onBlur"` validation and the Continue button disabled until `formState.isValid`, so every field is genuinely required, not silently defaulted. Education-level option labels now read "Secondary Education (High School)" / "Tertiary Education (Higher Education)", iSkolar-main's exact copy — there is no separate description/tooltip in iSkolar-main's own UI beyond that parenthetical, confirmed by reading the source, so none was invented here either.
   - **Also fixed in the same pass:** the owner pointed out `/login` still existed as a real page reachable from outside the popover flow, and logout/settings-sign-out/`useRouteGuard` all redirected there. Deleted `routes/_public/login.tsx` entirely — `useRouteGuard`'s unauthenticated redirect, `RoleNav`'s logout, and `settings.tsx`'s sign-out now all send the user to `/` (the landing page, where every sign-in entry point already opens `SignInPopover`). `pnpm generate-routes` regenerates `routeTree.gen.ts` with no `/login` route left in it.

6. **Third correction round: submit-gate bug, header centering, profile destination + onboarding-field visibility**
   - **File:** `src/routes/_onboarding/basic-info.tsx`, `src/components/layout/RoleNav.tsx`, `src/lib/account/model.ts`, `src/lib/account/api.ts`, `src/hooks/account/useProfile.ts` (return type only, no code change), `src/components/account/ProfileView.tsx`, `src/routes/_app/u.$userId.tsx`
   - **Functions/Components:** `MyAccountProfile`/`myAccountProfileSchema` (new — `AccountProfile` + `gender`/`birthDate`/`phone`/`educationLevel`, own-profile only), `EDUCATION_LEVEL_LABELS` (moved to `lib/account/model.ts` so both the form and the profile view share it), `MyDetailsPanel`, `formatBirthDate()`
   - **Purpose:** Three more real bugs from actually using the second-round build. (a) **The Continue button stayed disabled even with middle name — an optional field — left blank.** Root cause: gating the button on React Hook Form's `formState.isValid` with `mode: "onBlur"` is a known-flaky pattern — `isValid` doesn't reliably reflect the form's real state until every field has been individually interacted with, regardless of which fields are actually required. Fixed by dropping the `isValid` gate entirely on all three forms — the button now only disables while the mutation is pending; `handleSubmit` already refuses to call the submit callback and populates real per-field `errors` (already wired to render under each field) when the form is invalid, so validation still fully blocks a bad submit, it just doesn't rely on a timing-sensitive derived boolean to do it. (b) **The header nav wasn't centered** — `RoleNav.tsx`'s `flex justify-between` distributes space based on each of the three children's own width; once a real (long) display name started rendering in the account pill, the right side got wider than the logo on the left and visibly dragged the "centered" nav left. Fixed with `absolute` + `left-1/2 -translate-x-1/2` (and the vertical equivalent) so the nav centers on the header itself, independent of how wide either side is. (c) **"Profile" in the account dropdown went to the edit-profile page, not the public profile** — changed to `/u/$userId` with the signed-in user's own `academyUserId`. Since the public profile page never showed the onboarding-collected fields (gender/birthDate/phone/educationLevel — deliberately, per the original handoff's Open Items, since nothing had asked for it yet), added a `MyDetailsPanel` that renders only when viewing your own profile, fed by a new `MyAccountProfile` shape returned by `GET /accounts/me/profile` — **never** by the public `GET /accounts/:userId/profile`, since these are PII (phone number, birth date) that must not leak to other viewers. `ProfileView`'s existing "Edit profile" button (already present, already correctly gated on `canEdit`) stays as the way to reach the edit page — nothing else changed there.

7. **Sponsor onboarding rebuilt as a genuine 3-way branch (correction, 2026-07-20)**
   - **File:** `src/lib/account/model.ts`, `src/routes/_onboarding/basic-info.tsx`
   - **Functions/Components:** `SPONSOR_TYPES`/`SponsorType`, `EMPLOYMENT_TYPES`/`ORGANIZATION_TYPES`/`AGENCY_TYPES` (+ their `*_LABELS` maps), `individualSponsorOnboardingSchema`/`organizationSponsorOnboardingSchema`/`governmentSponsorOnboardingSchema`, `SponsorTypeSelect`, `IndividualSponsorForm`/`OrganizationSponsorForm`/`GovernmentSponsorForm`, `OnboardingShell`'s new `onBack`/`subtitle` props
   - **Purpose:** The one-form sponsor design (item 2 above) was an explicit choice the owner picked when directly asked whether to branch — then rejected on sight, next to a screenshot of iSkolar-main's real sponsor onboarding. Rebuilt to genuinely match: a card picker ("What kind of sponsor are you?" — Individual / Organization / Government, same visual language as `role-select.tsx`'s cards) followed by one of three real forms, mirroring `iskolar-main/web/src/lib/sponsor/model.ts`'s `create{Individual,Organization,Government}SponsorRequestSchema` field-for-field: individual asks name parts + employment type + birth date (reuses the existing `BirthDateField`/`Calendar` from student onboarding) + phone; organization asks org name + organization type + phone; government asks agency name + agency type + phone. Each type-specific select uses the same disabled-placeholder pattern already established for gender/education level (a real "Select your X type" placeholder, not a silently-picked default). `sponsorType` is new metadata on `sponsor_profile`, not a new top-level academyRole — Academy's `sponsor` role stays singular; verified visually in a real (Playwright) browser for all three forms, including the "← Change type" back-navigation between them, before considering this done.

## Decisions & Trade-offs

- **Onboarding mirrors iSkolar-main's fields/design; it does not call iSkolar-main.** Confirmed there's no cross-service endpoint for academy-server to fetch a user's already-entered profile — building one would mean changes inside the iskolar-main repo itself, a different team/repo boundary, for a feature that's otherwise entirely self-contained in Academy's own data model.
- **`startup` keeps the document gate rather than skipping it.** An operating startup asking for investor attention benefits from the same "prove you're real" bar a thesis/capstone already clears — `idea` stays the only type with no such requirement, unchanged from before this change.
- **All three landing sign-in entries open the popover, not just the header's.** Reversed from the first pass, which only converted the header button and left the two larger CTAs full-page — that inconsistency is exactly what the owner hit and flagged.
- ~~**Sponsor onboarding stays one form, not iSkolar-main's three.**~~ **REVERSED
  (2026-07-20):** this was an explicit, disclosed choice the owner picked when asked — and
  then rejected once actually seeing the resulting form next to iSkolar-main's real one.
  Sponsor onboarding now genuinely branches three ways (`SponsorTypeSelect` → Individual /
  Organization / Government, each its own field set matching iSkolar-main's forms
  field-for-field), with `sponsorType` added as new metadata on `sponsor_profile` —
  Academy's `sponsor` academyRole itself is still one role; nothing downstream
  (subscription/vault/badge) needed to change. See item 7 below and the new server
  handoff, `sponsor-onboarding-3-way-branch-server.md`.
- **The date picker is restyled to Academy's own tokens, not iSkolar-main's literal CSS.** Same behavioral pattern (Popover + `react-day-picker`, dropdown caption, disabled future dates, "Set birth date" placeholder) but built with Academy's `action`/`content-*`/`surface-*` classes, matching how every other restyled Radix primitive in this codebase (`popover.tsx`, `dropdown-menu.tsx`) already works — "mirror patterns, not literal code."
- **`/login` is gone, not just de-emphasized.** Keeping it around as a technically-unreachable fallback route was exactly the kind of half-measure that caused the first round of confusion ("the login page is still there") — deleting it outright, with every redirect target repointed to `/`, removes the possibility of anyone landing on it again.

## Verification

- `pnpm exec biome check --write` — clean across every file touched, including the second correction round (`calendar.tsx`, the rebuilt `basic-info.tsx`, the `/login` deletion's redirect fixes).
- `pnpm exec tsc --noEmit` — clean after each feature group and after the second correction round.
- `pnpm generate-routes` — run after adding `_onboarding/basic-info.tsx`, and again after deleting `routes/_public/login.tsx`; confirmed `routeTree.gen.ts` has no `/login` entry left (`grep -n "/login" routeTree.gen.ts` → no matches).
- `pnpm build` — clean production build after every round; the `login` chunk is gone from `dist/`, the `basic-info` chunk grew as expected (now bundles the calendar/date-picker code).
- Not yet driven in a browser against a live server (see Open Items) — verified by type-checking, linting, and reading the wiring so far.

## Open Items

- ~~Server exists but for the wrong onboarding shape — needs a follow-up pass.~~ RESOLVED
  (2026-07-19, same day): the server was first built and verified against the *original*
  2-field handoff (`onboardingBasicInfoSchema` — `displayName`+`org` only), then fixed to
  the corrected per-role shape once this doc's onboarding-field correction landed —
  `account/model.ts`/`repository.ts`/`server.ts` rewritten to the three role-shaped
  schemas/methods, migration `00010`'s missing `student_profile`/`sponsor_profile`
  columns added directly (additive, no rollback needed). Verified 20/20 in-process; see
  `academy-server/documentation/phases/onboarding-basic-info-and-startup-type-server.md`.
  The `startup` project-type half was unaffected throughout and stayed correct.
- Drive the full flow in a browser for both roles: fresh student account → role-select →
  the full 8-field form → student home; fresh sponsor account → role-select → the
  3-field form → subscription tier picker. Then submit a `startup` project without a
  document to confirm the 422 gate fires the same way `thesis_capstone`'s does.
- `documents/iskolar-academy-plan.md` doesn't mention either change yet — worth folding
  in now that both halves have shipped (including the fix).
- **No server change needed for the second correction round** (isValid removal, date
  picker, placeholders) — the wire contract was already correct and already required
  every field; only the client's own "nothing chosen yet" representation changed.
- ~~The third correction round *does* need a server change~~ RESOLVED (2026-07-19, same
  day): `GET /accounts/me/profile` and `PATCH /accounts/me/profile` now both return
  `MyAccountProfile` via a new `getOwnProfileByAcademyId` repository method, kept
  deliberately separate from the shared `getProfileByAcademyId` the public
  `GET /accounts/:userId/profile` still uses — the PII boundary is structural, not a
  runtime check. The server also caught and fixed a `pg` `DATE`-serialization bug along
  the way (`birth_date` came back a calendar day off in timezones behind UTC). Verified
  24/24 in-process; see
  `academy-server/documentation/phases/onboarding-basic-info-and-startup-type-server.md`.
  `MyDetailsPanel` should now render real values — worth a browser check per the item
  above.
- ~~Item 7 (sponsor onboarding 3-way branch) needs a server change~~ RESOLVED
  (2026-07-20, same day as the client rebuild): migration `00011` → DB v11 added five
  nullable `sponsor_profile` columns; `account/model.ts` replaced the flat
  `sponsorOnboardingSchema` with the three `.strict()` schemas above; `account/
  repository.ts` split into `completeIndividualSponsorOnboarding`/
  `completeOrganizationSponsorOnboarding`/`completeGovernmentSponsorOnboarding`
  (organization/government both write their `name` to **both** `display_name` and `org`);
  `account/server.ts`'s sponsor branch now selects the schema by the body's own
  `sponsorType`. Verified 26/26 in-process; see
  `academy-server/documentation/phases/sponsor-onboarding-3-way-branch-server.md`. Worth a
  browser check per the item above, now covering all three sponsor forms too.
