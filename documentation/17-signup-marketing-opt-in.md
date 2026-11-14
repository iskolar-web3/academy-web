# Phase 17 - Signup marketing opt-in

**Status:** Done
**Date:** 2026-11-14
**Repo(s):** academy-web and academy-server
**Traces to:** Owner-requested optional iSkolar marketing/newsletter checkbox during signup
**Commit/PR:** Uncommitted; feat/signup-marketing-opt-in in both repositories

## Goal

Allow new Academy users to choose whether to receive iSkolar marketing updates and newsletters while completing signup. Signup must work without subscribing.

## What Was Built

| File | Functions / Components | Purpose |
| --- | --- | --- |
| `src/components/onboarding/OnboardingShell.tsx` | `OnboardingShell` | Existing shared signup layout, extracted from the route; adds one accessible, optional checkbox above Continue. |
| `src/routes/_onboarding/basic-info.tsx` | Student, individual sponsor, organization sponsor, government sponsor, and admin forms | Pass the explicit checkbox choice into the existing onboarding mutation after form validation. |
| `src/lib/account/model.ts` | Onboarding schemas | Include optional boolean `marketingOptIn` in the existing request contract. |
| `src/components/onboarding/OnboardingShell.test.tsx` | Signup preference tests | Cover unchecked default, explicit opt-in/opt-out, failure retention, and disabled state while saving. |

## Decisions & Trade-offs

- Academy uses Google/iSkolar authentication and collects signup information on `/basic-info`; the checkbox belongs in this shared step so every account type sees the same choice.
- Label: "Notify me about new scholarships, opportunities, and iSkolar updates." Helper: "Optional. You can change this anytime." The group aligns with the form fields, with smaller muted helper text directly below the label and natural wrapping on narrow screens.
- The checkbox starts unchecked, has no required validation, and uses the existing Radix Checkbox and design tokens. Clicking the label or using the keyboard changes the same controlled boolean.
- The shared shell owns the preference for its mounted form. Validation and save errors retain it; changing sponsor type starts a new, unchecked form.
- Both checked and unchecked choices are sent with `POST /accounts/me/onboarding`. The backend stores the choice and first acceptance time with the onboarding write. No private marketing fields were added to public profile responses.

## Verification

- `pnpm test`: 34 tests pass, including three new checkbox behavior tests.
- `pnpm typecheck` and targeted Biome checks pass.
- `DISABLE_NETLIFY_PLUGIN=true pnpm build`: client and SSR build pass.
- Browser checks at 1440px and 375px use mocked session/save responses against the real app UI: initially unchecked; submitting without selecting sends `marketingOptIn: false`; selecting and retrying sends `true`; save failure retains the choice; no horizontal overflow.
- Backend real PostgreSQL integration checks: 65 account tests pass, including 17 new preference cases across all five onboarding paths.
- Independent review found no material issues in consent defaults, schema compatibility, callback wiring, or atomic SQL persistence.

## Open Items

- Deploy the backend change first; startup applies migration `00018_signup_marketing_opt_in.sql`. Then deploy the frontend so strict older backend schemas do not reject the new field.
- This feature records the user's newsletter/marketing preference. It does not send emails or synchronize an external mailing list. Connecting the selected mailing provider and managing later subscription changes are follow-up work.

- Copy/layout refinement (2026-11-14): left-aligned the checkbox group with the form fields, updated the requested wording, and kept a generous clickable label area.
- The requested "change this anytime" helper requires a later preference-editing control before launch. The current implementation records consent during signup only.
