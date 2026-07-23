# 05 — Shadcn/Radix Adoption & Library-Usage Audit

**Status:** ✅ Done · **Date:** 2026-07-06 · **Repo(s):** academy-client · academy-server (audit + Biome wiring)
**Traces to:** Plan §3 (architecture) · CLAUDE.md "Code Style" (Shadcn/ui convention) · iSkolar reference blueprint §6 (Styling & UI Standards)
**Commit/PR:** —

## Goal

Close the gap between the project's *declared* stack and its *exercised* stack. A library
audit (2026-07-06, prompted while comparing against the `iSkolar_Blueprint` reference) found
that several packages were installed at scaffold time **by mirroring the iskolar-main
reference stack, without ever verifying each package gained a consumer**:

| Package | State found by the audit |
|---|---|
| Shadcn/ui scaffold | `components.json` fully configured (new-york/zinc, aliases, the `--primary → --color-action` token bridge in `styles.css`) — but `src/components/ui/` **did not exist**; zero components ever generated |
| `clsx` + `tailwind-merge` (`cn()` in `lib/utils.ts`) | Defined, **zero importers** |
| `class-variance-authority` | Installed, **zero imports** |
| `lenis` | Installed, **never imported** (the iSkolar reference uses it for landing smooth-scroll) |
| `tw-animate-css` | `@import`ed in `styles.css`, **no class of it used anywhere** |
| `.animate-toast` keyframe (`dsToast`) | Defined in `styles.css`, **never used** — the design-template TOAST surface was never built |

**Process lesson (the reason this doc exists):** *installed-by-reference ≠ used.* When a
stack is mirrored from a reference project, every package must either gain a consumer in the
same phase that introduces it, or be dropped. This audit is the corrective; the rule is now
part of the conventions (see below).

## What Was Built

**The convention: Shadcn for behavior, template classes for visuals.** Shadcn components are
copy-in source — the Radix layer supplies behavior/a11y (focus traps, aria, keyboard nav,
scroll-lock, portals) and the visual layer is class strings we own, which were replaced
wholesale with the design-template's exact geometry and tokens. Colors flow automatically
through the pre-existing `--primary → --color-action` bridge. **Zero intended visual drift.**
Static surfaces (cards, chips, pills, pipeline, banners) stay hand-rolled token classes —
they have no behavior to gain.

### `components/ui/` (generated via `pnpm dlx shadcn@latest add …`, then restyled)

| File | Restyled to | Consumed by |
|---|---|---|
| `button.tsx` | The template's 3 button treatments as **cva variants** (`primary` action-blue + 6/16 shadow · `secondary` card/line/muted · `destructive` card/#f0c9cb/danger) × 3 sizes (36/42/46px). **The single source of button truth going forward** — the `.btn-*` CSS classes retire as remaining surfaces migrate. | Both modals' action rows |
| `dialog.tsx` | Template overlay `rgba(20,28,56,0.42)` + sheet (`bg-surface-overlay`, `shadow-modal`, 18px radius, fade+rise enter ≈ the template's `fadeInUp`); default Shadcn close button removed (modals supply their own ✕ via `DialogClose asChild`); `overlayClassName` prop for the review modal's backdrop blur | `SubmitProjectModal`, `ReviewDecisionModal` |
| `dropdown-menu.tsx` | The header popover language (18px radius, `#e3ebfb` border, frosted white, `shadow-pop`, `animate-pop-in`); **trimmed to the primitives in use** (no checkbox/radio/sub-menu dead exports) | `RoleNav` (notifications + account menus) |
| `switch.tsx` | The settings Toggle exactly (46×26 track, 20px thumb, 3→23px travel) | `/settings` Go-live alerts |
| `tabs.tsx` | The admin tab-rail (10px-radius triggers, `#e3ebfb`+action active) | `/admin/dashboard` console rail |
| `checkbox.tsx` | Line border on card, action fill + white check | Wizard Ownership step (2 declarations) |
| `sonner.tsx` | The design-template **TOAST** (top-right 84/24 under the header, white card on `border-line`, 14px radius, 16/40 shadow, green ✓), light-only — `next-themes` import stripped and the package removed | Mounted in `__root.tsx` |

### Surfaces refactored (behavior gained, pixels unchanged)

| Surface | Change | Behavior gained | Plumbing deleted |
|---|---|---|---|
| `SubmitProjectModal` | Wrapper → `Dialog`; footer → `Button`; declarations → `Checkbox`; success toasts | focus trap, `role="dialog"`/aria, scroll-lock | manual Escape effect + backdrop button |
| `ReviewDecisionModal` | Same treatment; decision row → `Button` variants (Reject=destructive · Return=secondary · Approve=primary, all size `lg` — exact class match); decision toasts | same | same |
| `RoleNav` | Both popovers → controlled `DropdownMenu`s (one `open` state so the account menu's "Notifications" entry hands off); `cn()` for conditional classes | keyboard nav, focus return, outside-click | Escape effect, full-screen backdrop button, `popoverCls`/`menuItemCls` consts |
| `/settings` | Local `Toggle` component → `Switch` | keyboard + aria-checked | the hand-rolled Toggle |
| `/admin/dashboard` | Tab-rail state → `Tabs` | arrow-key nav, aria-selected | manual tab state |
| `__root.tsx` | `<Toaster />` mounted | transient confirmations (a designed-but-never-built template surface) | — |
| `routes/_public/index.tsx` | lenis smooth scroll (effect-mounted, reduced-motion-guarded, destroyed on leave) | landing scroll feel, mirroring the iSkolar reference | — |

Toast emit points: wizard submit/save · review approve/return/reject · moderation
unpublish/flag · profile save.

### Dependency delta

- **Added:** `radix-ui` (one unified package for all primitives), `sonner`.
- **Removed:** `next-themes` (CLI-installed for the sonner wrapper; stripped — light-only app).
- **Revived (0 → real consumers):** `cn()`/`clsx`/`tailwind-merge` (all `ui/*` + refactored
  conditionals), `class-variance-authority` (`buttonVariants`), `lenis` (landing),
  `tw-animate-css` (dialog/dropdown enter-exit animations).

## Decisions & Trade-offs

- **`ui/select.tsx` generated, then deleted.** The wizard's category/type selects are native
  `<select>` elements — already fully accessible and exactly what the template mockup renders.
  Radix Select would be markup churn for zero gain, and an importer-less file would recreate
  the very dead-code problem this change fixes. Regenerate via the CLI if a custom-designed
  dropdown ever lands.
- **`Button` + cva over the `.btn-*` CSS classes** (user decision, Option A) — typed variants,
  one encoding of the three treatments; adopted opportunistically in the surfaces this change
  touches, `.btn` classes retire as others migrate naturally.
- **Two visual micro-deltas accepted** (both upgrades, both on-palette): the wizard's
  declaration checkboxes render as 16px Radix checkboxes instead of native OS checkboxes, and
  dialog enter animation is the shared tw-animate fade+rise instead of the one-off keyframes.
- **`dropdown-menu.tsx` trimmed** to used primitives — consistent with the no-dead-code rule;
  the full kit is one CLI command away.

## Verification

- `pnpm exec biome check src` → only the pre-existing `Hero.tsx` `noStaticElementInteractions`
  finding; `pnpm exec tsc --noEmit` → **0**; `pnpm build` (client + SSR) → **✓**.
- Surface pass: both modals open/close via ✕, backdrop, and Escape (now Radix-handled), tab
  focus stays trapped inside; header menus arrow-key navigate and return focus; settings
  toggle switches by keyboard; admin tabs switch panels; toasts appear top-right under the
  header on submit/decision/moderation/profile-save; landing scrolls smoothly (and doesn't
  when `prefers-reduced-motion` is set).

## Server follow-up (same audit, same day)

The same audit ran on `academy-server`: **all 7 runtime deps exercised** (clean), but two
mirrored-not-used findings — **Biome** was a devDependency with no `biome.json` and no script
(fixed: config mirroring the client + `check`/`lint`/`format` scripts; 6 files formatted, then
clean; build ✓), and **`CLIENT_URL`** is validated in `env.ts` with zero consumers (**kept
deliberately** by user decision — reserved for SSO-redirect/email flows; noted in the server
CLAUDE.md as the known exception). Both repos' CLAUDE.md now carry a **"Library & Dependency
Discipline"** section: analyze existing deps/primitives before writing, add a package only with
its first consumer in the same change, mirror the iSkolar reference's *patterns* not its
package lists.

## Open Items

- Migrate remaining raw-string/`.btn` buttons onto `<Button>` opportunistically as their
  surfaces get touched; retire the `.btn-*` classes when the last consumer is gone.
- **Convention (standing rule):** a package enters `package.json` only in the same change
  that gives it a consumer; when mirroring the iSkolar reference stack, audit usage before
  install, not after.
