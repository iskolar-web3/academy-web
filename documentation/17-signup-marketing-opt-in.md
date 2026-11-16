# Phase 17 - Signup marketing opt-in and email collection

**Status:** Done
**Date:** 2026-11-14
**Repo(s):** academy-web and academy-server
**Traces to:** Owner-requested optional signup email collection and ability to change consent anytime
**Commit/PR:** Follow-up changes uncommitted; feat/signup-marketing-opt-in in both repositories

## Goal

Collect an email address and explicit consent for iSkolar scholarships, opportunities, and updates. Signup remains available without subscribing. Users can later change their preference and collected address in Settings. The owner explicitly scoped this to collection only for now; no newsletter service or email delivery is required.

## What Was Built

| File | Functions / Components | Purpose |
| --- | --- | --- |
| `src/components/onboarding/OnboardingShell.tsx` | `OnboardingShell` | Shared optional, unchecked checkbox with left-aligned text and muted helper. Shows a validated email field only after opt-in, prefilled from private sign-in email when available. |
| `src/routes/_onboarding/basic-info.tsx` | All five role/sponsor forms | Submit consent and collected email with validated onboarding details. |
| `src/lib/account/model.ts`, `api.ts` | Preference schemas, query, update | Private GET/PATCH contract with strict booleans, email validation, Zod response parsing, abortable reads, and account-scoped cache keys. |
| `src/lib/auth/model.ts` | `academyUserSchema` | Retain the existing server's optional private sign-in email for prefill. |
| `src/hooks/account/useMarketingPreference.ts` | `useMarketingPreference` | Load/save preference and prevent an older read from replacing a confirmed save. |
| `src/hooks/auth/useCompleteOnboarding.ts` | Onboarding mutation | Refresh the current account's preference cache after signup. |
| `src/components/account/MarketingPreferenceSettings.tsx` | Settings form | Load saved choice, enable/disable updates, edit collected email, save explicitly, confirm success, and retry failed reads/writes without losing edits. |
| `src/routes/_app/settings.tsx` | Shared Settings route | Expose the persisted preference to every signed-in, onboarded role. |
| `src/components/layout/RoleNav.tsx` | Account dropdown | Add a discoverable Settings link for all roles and screen sizes. |
| Onboarding and preference component tests | 10 behavior tests | Cover safe defaults, required email on opt-in, signup without email/consent, persistent preference changes, loading/saving/errors/retry, and cross-account cache isolation. |

## Decisions & Trade-offs

- Exact signup copy: "Notify me about new scholarships, opportunities, and iSkolar updates." Helper: "Optional. You can change this anytime."
- The checkbox starts unchecked. Email is required only for opt-in; opting out removes the conditional input and allows signup without an address.
- Marketing email is separate from login identity. Editing it never changes the sign-in address. Addresses are collected, not independently verified.
- Settings is reachable through the account menu. Toggle/edit the preference, then choose **Save preference**. Confirmation appears only after the server accepts it; failures retain the draft and offer retry.
- Turning updates off clears active consent and its timestamp but retains the collected address for private prefill. An enabled address change or later re-enable records new consent time. Repeated saves with the same enabled address preserve the timestamp.
- Private preference data is keyed by account ID, and the Settings component remounts when the account changes. Public profile/search responses never expose collected addresses or consent.
- The underlying API is GET/PATCH `/accounts/me/marketing-preference`, scoped to the authenticated account. No caller-supplied account ID is accepted.
- Existing Settings alerts/digest/account/privacy stubs are outside this feature; the iSkolar email preference is persisted through the real API.

## Verification

- Full frontend suite: **41 tests pass**, including five onboarding and five Settings preference tests. TypeScript and targeted Biome checks pass.
- Production client and SSR builds pass with `DISABLE_NETLIFY_PLUGIN=true` for local verification.
- Backend: **106 account integration tests pass** (58 preference/workflow and 48 existing account tests), using isolated PostgreSQL 18.1 and all 19 migrations.
- Real browser/local backend workflow: unchecked signup -> opt in and collect address -> complete signup -> account menu Settings -> opt out/save -> refresh and confirm off -> re-enable with a different address/save -> confirm stored choice, address, and renewed timestamp.
- Inspected rendered signup and Settings screenshots. Settings fits 1440px, 375px, and 320px widths without horizontal overflow.
- Independent review found the missing Settings navigation entry; it was added and exercised in the real browser workflow.

## Open Items

- Deploy backend/migration 19 first, then frontend, because older strict onboarding schemas reject the new email field.
- Email sending, provider synchronization, verification emails, and public unsubscribe links are deliberately deferred under the collection-only scope. Authenticated users can change their saved preference in Settings now.
- Any later mailing list must use current opt-in consent and a usable collected address, and must honor subsequent opt-outs. Backend phase 10 documents the filtered collection query.
