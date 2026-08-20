# Manual Testing Guide — Full System Walkthrough

A human, browser-driven, step-by-step test script covering the entire shipped system —
auth through every feature phase, in build order. Each section lists concrete steps and
the expected result; check items off during a real pass. Grounded in what each phase's
own `Verification` section already confirmed (see `../05-foundation.md` through
`../10-monetization-deal-flow.md` and `academy-server/documentation/03-foundation-server.md`
through `08-monetization-server.md`) — this doc is the click-through version of the same
facts, not a new set of assumptions.

Auth (§0) is covered **two ways** — a fast dev-token method and a real-SSO method that
actually runs `iskolar-main` locally — every fact in both (ports, commands, table/column
names, cookie behavior, the missing-redirect gap) was verified directly against both
repos' source while writing this doc, not assumed from memory.

## 0 · Setup (once per session)

Academy's own stack is required either way. Auth into it can come from **either** of two
methods — pick one per test pass (see the warning at the end of Method B about mixing them):

- **Method A** — mint a dev JWT directly (fast, no `iskolar-main` checkout needed).
- (RECOMMENDED)
  **Method B** — run `iskolar-main` for real and get a genuine SSO session (slower, but
  exercises the actual cross-service handoff Academy's `auth.ts` is built against).

### Always: start Academy itself

- [ ] **Academy Postgres**: from `academy-server/`, `docker compose up -d` — wait for `STATUS` to show `healthy` (`docker compose ps`). Host port **5432**.
- [ ] **Academy server**: from `academy-server/`, `pnpm dev` — watch for `Server running on http://localhost:5000` and the migration log reaching the latest DB version. Port **5000**.
- [ ] **Academy client**: from `academy-client/`, `pnpm dev` — serves on `http://localhost:3000`. Port **3000**.

### Method A — mint a dev token

- [ ] **Mint a dev token** (from `academy-server/`, a fresh terminal):
  ```bash
  pnpm exec tsx src/dev/mint-token.ts <iskolarUserId> <role>
  # e.g. pnpm exec tsx src/dev/mint-token.ts test-student-1 student
  ```
  Prints two lines — `userId=... role=...` then the raw token. Copy the token line. **Expires in 1 hour** — re-mint if a pass runs long. `role` is `student`, `sponsor`, or `admin`; the same `iskolarUserId` always maps to the same account, so reuse an id to stay signed in as "the same person" across visits.
- [ ] **Sign in as that token** (the cookie is `HttpOnly`, so the browser console's `document.cookie` won't set it — use DevTools directly):
  1. Open `http://localhost:3000` in Chrome/Edge, press F12 → **Application** tab → **Storage → Cookies → `http://localhost:3000`**.
  2. Add a row: **Name** `auth_token`, **Value** the copied token, **Domain** `localhost`, **Path** `/`, **HttpOnly** checked, **Secure** unchecked (dev is http), **SameSite** `Lax`.
  3. Reload the page. Cookies scoped to `localhost` (no port) are sent on same-site cross-port requests, so this one cookie covers calls to both `:3000` and `:5000`.
- [ ] **Switch users**: edit the same cookie row's value to a newly-minted token (or delete + re-add), then reload. To sign out, delete the row and reload.
- [ ] Keep three token values handy through this pass — most sections need a **student**, a **sponsor**, and an **admin** account, sometimes in the same section.

### Method B — real SSO via a locally-running `iskolar-main`

This exercises the genuine flow: `iskolar-main` issues the same `auth_token` JWT Academy
verifies, so signing in over there signs you into Academy too, with no code involved on
Academy's side. Paths below assume `iskolar-main` is checked out as a sibling of
`iskolar-academy` (i.e. `D:\GithubRepo\iskolar-main`); adjust if yours differs.

**One-time prerequisite check — the shared secret.** Academy verifies iSkolar's token with
`HS256` using a secret both sides must agree on. Confirm they already match before doing
anything else:
```bash
grep JWT_SECRET academy-server/.env
grep JWT_SECRET ../iskolar-main/server/.env
```
Both lines must print the **identical** value. If they don't, copy one into the other and
restart both servers — a mismatch means every real-SSO sign-in will silently 401.

Goose must also be on `PATH` (`goose -version`) — `iskolar-main`'s server shells out to it
at boot too, same as Academy's.

**Port map for this method** (everything running side by side):

| Service | Started from | Command | Port |
|---|---|---|---|
| Academy Postgres | `academy-server/` | `docker compose up -d` | 5432 (host) |
| Academy server | `academy-server/` | `pnpm dev` | 5000 |
| Academy client | `academy-client/` | `pnpm dev` | 3000 |
| iskolar-main Postgres | `iskolar-main/server/` | `docker compose up -d postgres` | 5433 (host) → 5432 (container) |
| iskolar-main server | `iskolar-main/server/` | `pnpm dev` | **5001** (hardcoded in `src/index.ts` — not env-configurable, ignore anything that says 5000) |
| iskolar-main web | `iskolar-main/web/` | `pnpm exec vite --port 3001` | 3001 |

1. **Start iskolar-main's own database** — a separate container from Academy's, on a
   different host port so the two don't collide:
   ```bash
   cd iskolar-main/server
   docker compose up -d postgres
   ```
   Pass **only** `postgres` as the service name — do **not** run a bare `docker compose up
   -d`. This compose file also defines an `ocr-service` that builds from a sibling
   `../ocr-service` checkout; most setups won't have that repo checked out, and the build
   will fail. Neither `ocr-service` nor `azurite` (Azure Blob emulator, also in this file)
   is needed for auth — they only back document/profile-image uploads, unrelated to
   signing in.
   ```bash
   docker compose ps    # postgres → STATUS "healthy"; container name iskolar-postgres-1
   ```

2. **Start iskolar-main's server**:
   ```bash
   cd iskolar-main/server
   pnpm dev
   ```
   Watch for `Server is running on http://localhost:5001`. This also runs its own `goose
   up` migration on boot (identical mechanism to Academy's server) — confirm that
   succeeds in the log before continuing. If it warns `Goose not found. Skipping
   migrations.`, stop here and fix `PATH` first; nothing past this point will work against
   an unmigrated database.

3. **Start iskolar-main's web app.** Its `package.json` `dev` script is hardcoded to
   `vite --port 3000`, which collides with Academy's client — don't run `pnpm dev` here.
   Invoke Vite directly instead, overriding the port explicitly:
   ```bash
   cd iskolar-main/web
   pnpm exec vite --port 3001
   ```
   Confirm the terminal banner shows it bound to **3001**. (`iskolar-main/server/.env`'s
   own `CLIENT_URL`, `ALLOWED_ORIGINS`, and `APP_BASE_URL` are already set to
   `http://localhost:3001` in this checkout — if you ever regenerate that `.env` from the
   `.env.example` template, which defaults to 3000, re-point all three back to 3001, or
   CORS will reject the web app's own API calls.)

4. **Get a signed-in student or sponsor account** (self-service, via the real UI):
   1. Open `http://localhost:3001/register`, submit an email, a password, and the
      confirm-password field.
   2. The page will very likely show a "Failed to send email verification" error toast —
      **this is expected here, not a sign anything is broken.** The account row is created
      in the database regardless (that happens before the email-send attempt); the send
      itself fails only because this checkout's `RESEND_API_KEY` is a placeholder, not a
      live Resend key, so no real email can go out. The account exists, just unverified.
   3. Verify it by hand instead, since no real email is ever coming:
      ```bash
      docker exec iskolar-postgres-1 psql -U iskolar -d iskolar -c \
        "UPDATE users SET is_verified = TRUE WHERE email = '<the email you just registered>';"
      ```
   4. Go to `http://localhost:3001/login`, sign in with that email/password. A freshly
      verified account has no role yet, so you land on `/welcome` → click through to
      `/role-selection` → pick **iStudent** or **iSponsor** (only these two, plus
      **School**, are offered here — **Admin is never self-service**, see step 5).
   5. You're now signed in on `iskolar-main`, on port **3001**.

5. **Get a signed-in admin account** (not self-service — seeded from `.env` at boot):
   1. Stop `iskolar-main`'s server if it's running (Ctrl+C in its terminal).
   2. In `iskolar-main/server/.env`, set both:
      ```
      ADMIN_EMAIL=admin@example.com
      ADMIN_PASSWORD=some-password-at-least-8-characters
      ```
      (Both are blank by default in this checkout — that's why no admin exists yet.)
   3. Restart it (`pnpm dev`). Watch the boot log for `Default admin account created.` —
      this step is idempotent (it checks for an existing `admin` row first), so it's safe
      to leave these two vars in `.env` permanently; a second boot just no-ops silently.
   4. This seeded row **also** lands with `is_verified = false` — the seed path doesn't set
      it either, so it needs the exact same manual fix as step 4.3, targeting the admin's
      email instead:
      ```bash
      docker exec iskolar-postgres-1 psql -U iskolar -d iskolar -c \
        "UPDATE users SET is_verified = TRUE WHERE email = 'admin@example.com';"
      ```
   5. Log in at `http://localhost:3001/login` with those exact credentials → already role
      `admin`, lands directly on `/dashboard` — no role-selection step for this one.

6. **Cross over to Academy — the actual point of this method.** iskolar-main's login sets
   an `auth_token` cookie: `HttpOnly`, `SameSite=Lax`, and in dev **no explicit `Domain`
   attribute at all** — which means the browser scopes it to the bare host `localhost`,
   with no port restriction, so the exact same cookie is also sent to Academy's server on
   `:5000`. **In the same browser, same profile** (not a different browser or an incognito
   window — the cookie has to actually be present), open `http://localhost:3000`.
   Academy's `GET /auth/session` call succeeds off that same cookie and you're signed in
   there too, carrying whichever role you picked in step 4 or 5.
   - **Don't go looking for an automatic redirect back — there isn't one, and that's not a
     bug you're causing.** Academy's own "Sign in" popover does build a URL like
     `http://localhost:3001/login?redirect=%2F`, but iskolar-main's `/login` page does not
     read or act on that `redirect` query parameter at all (checked directly — no such
     handling exists in its login route). After logging in there you land on
     iskolar-main's own page (`/home`, `/scholarships`, `/dashboard`, or `/welcome`
     depending on role), never back on Academy automatically. Navigate to
     `localhost:3000` yourself, as in the step above.
   - The first time a given `iskolar-main` account hits Academy, `academy_user` gets
     JIT-provisioned; `roleConfirmed` seeds from the JWT's `role` claim exactly as in
     Method A (student/admin start confirmed, sponsor starts unconfirmed) and you'll go
     through Academy's own onboarding (`/role-select` → `/basic-info`) same as always.

7. **Signing out / switching accounts under Method B:** logging out from *either* app
   clears the same host-scoped cookie, since neither sets an explicit `Domain` in dev — so
   it signs you out of both at once. To test a different `iskolar-main` account, register
   or log in as that one instead (repeat steps 4–5).
   - **Do not mix Method A and Method B in the same browser profile in the same pass.**
     Both use a cookie literally named `auth_token`, scoped to the bare host `localhost` —
     a DevTools-injected mint-token cookie and a real iskolar-main session cookie occupy
     the exact same slot, and whichever was set most recently silently wins. Pick one
     method for a given test pass, or explicitly clear the cookie before switching
     methods.

## 1 · Auth & Landing (Foundation)

- [ ] Visit `http://localhost:3000` **signed out** (no cookie) → landing page renders, shows the top-3 most-recently-published projects as plain cards, no gated content, no crash.
- [ ] Click any "Sign in" affordance (header, hero button, bottom CTA) → `SignInPopover` opens anchored below the trigger, not a full-page navigation.
- [ ] Sign in as a **brand-new** identity (an `iskolarUserId` never used before under Method A, or a freshly-registered `iskolar-main` account under Method B) as `student` → lands on `/role-select` (role confirmed by the token, but onboarding not yet completed).

## 2 · Onboarding

- [ ] **Role-select**: pick a role (if the minted token didn't already fix one) → routes to `/basic-info`.
- [ ] **Student basic-info form**: fill first/middle(optional)/last name, gender (verify the select opens on a real "Select your gender" placeholder, not a silently-picked default), birth date via the calendar popover (verify it opens a real date-picker, not a native `<input type=date>`; future dates disabled), phone, education level (same placeholder pattern), school. Continue stays disabled only while the mutation is pending — leaving the optional middle name blank must **not** block it.
- [ ] **Sponsor basic-info — 3-way branch**: pick "What kind of sponsor are you?" → verify all three:
  - Individual: name parts, employment type, birth date (same calendar), phone.
  - Organization: org name, organization type, phone.
  - Government: agency name, agency type, phone.
  - Verify "← Change type" navigates back to the picker without losing your place.
- [ ] **Admin basic-info**: just a name field.
- [ ] After submitting any role's form → lands in that role's home area (`/student/home`, `/sponsor/home`, or `/admin/dashboard`).

## 3 · Foundation — Profile

- [ ] Edit profile (`/student/profile` or `/sponsor/profile`): change Display name / Headline / School-or-org / Bio → Save → reflected immediately.
- [ ] Visit your own public profile (`/u/:yourUserId`) → a **"Your details"** panel shows gender/birth date/phone/education level (own-profile only).
- [ ] Sign in as a **different** user and visit the first user's `/u/:id` → the "Your details" panel and its PII fields are **completely absent** (not null-masked, not present at all).
- [ ] Sign out (delete the cookie), reload → back to the signed-out landing state; "Log out" from the account menu also lands on `/`.

## 4 · Submission — Projects (as student)

- [ ] From `/student/home`, click **"+ Submit a project"** → the 5-step wizard modal opens (Details · MVP · Team · Ownership · Review), not a separate page.
- [ ] Fill details, leave MVP links blank, try to submit → **blocked**, the gate names exactly what's missing (a live demo + a public repo).
- [ ] Fill a demo URL + a repo URL, declare ownership, submit → status becomes `submitted`; the dashboard's pipeline tracker shows Draft → Submitted.
- [ ] Create a `thesis_capstone` or `startup` project → the Ownership step requires a document upload (thesis paper / pitch deck respectively); pick a PDF, verify the picker shows "Uploading…" then "Replace"; after submit, the detail page and (once reviewed) the admin modal both show a working **"View"** link to the uploaded PDF.
- [ ] Add a team member on the Team step, mark them "linked" → their consent starts `pending` and they stay uncredited on the public showcase (verified later in §6) until they accept.
- [ ] From the dashboard, withdraw a **published** project → status `withdrawn`, dropped from public surfaces; resubmit → back to `submitted`.
- [ ] Edit a **published** project's non-MVP field (e.g. pitch text) → stays `published`. Edit an MVP link → re-enters `under_review` with a warning shown before you apply it.
- [ ] Delete a **draft** → succeeds; try deleting a `submitted` project → blocked (409-style rejection surfaced as an error toast).

## 5 · Review — Admin console

- [ ] Sign in as **admin**, open `/admin/dashboard` → one console with a sticky tab-rail: **Review queue · Moderation · Metrics**.
- [ ] **Review queue** tab lists the project submitted in §4 (title, type pill, school, submitted date, MVP-link summary) → click it → the review modal opens (not a separate route) showing pitch/purpose/tech/MVP links/team/ownership.
- [ ] Click **Return** with the note field left blank → blocked, a note is required. Type a note, confirm → project status `returned`, the note round-trips to the student's dashboard.
- [ ] Resubmit that project (as the student) → back to `submitted`, reappears in the queue.
- [ ] **Approve** it → status `published`, disappears from the queue, now visible on `/discover` (verified in §6).
- [ ] Submit and **reject** a project → status `rejected`, terminal — a second decision on it is blocked.
- [ ] **Moderation** tab: lists published projects; **flag** one → a marker is set, it **stays published**; **unpublish** another → status `withdrawn`, drops from public listings.
- [ ] **Metrics** tab: four count cards (In review · Published · Returned · Students) show real numbers that move as you approve/return projects during this pass.

## 6 · Discovery & Contact

- [ ] Sign in as **sponsor**, open `/discover` → the gallery shows only **published** projects (the one approved in §5 should appear).
- [ ] Type a search term matching a project's title/pitch/tech/school → result narrows correctly; try a category filter and each sort (Newest / Trending / Top) → each changes the order/set sensibly; clear filters → full list returns.
- [ ] Open a project's detail page → click the upvote heart → count increments, heart fills, spring + confetti animation plays; click again → toggles back off, count decrements.
- [ ] Click **"I'm interested"** on a sponsor account with **no organization set** → blocked with a prompt to add an organization; go set `org` on your sponsor profile (§3), return, click again → **"✓ Interest sent"**; click a third time → stays sent, no duplicate action.
- [ ] Sign in as the project's **student owner** → the notification bell shows an unread badge; open it → a `sponsor_interest` notification links to the sponsor's public profile (this is the reveal — never raw contact info).
- [ ] Open `/notifications` → the full page lists it with the right tone/title/body/age label; **Mark all read** clears the unread state; the bell badge count matches.
- [ ] Back on the project the team member was added to in §4: as that **linked member**, find their invite notification and **Accept** it → they become credited on the project's public showcase card; a second member who **Declines** never appears anywhere public.

## 7 · Grants & Funding

- [ ] Sign in as **student**, go create a grant request (`+ Request a grant` from `/student/home`) — one page, one "Publish grant request" button, no draft state. Fill title/category/purpose/target amount, upload the required proposal PDF, publish → grant is immediately `open` (live on `/grants`, no admin gate).
- [ ] Try publishing with a non-numeric or zero target, or a missing/non-PDF proposal → each blocked with a clear message.
- [ ] Sign in as **sponsor**, open `/grants`, open the grant's detail page → the fund flow is inline in the sticky rail (not a popup dialog). Fill Reason (optional) + Amount, submit → a **mock PayMongo checkout screen** opens (its own header bar, order summary, a GCash/Card toggle — Card shows read-only mock card fields).
- [ ] Click **Pay** → a multi-stage processing sequence plays ("Verifying payment method…" → "Processing payment…" → "Finalizing your contribution…", with a stage-dot indicator) → success screen, "Request submitted."
- [ ] Reload the grant detail page → raised amount and backer count increased by your contribution; fund it again from a second sponsor account → backers counts **unique sponsors**, not total contributions.
- [ ] Fund a grant up to its exact target → it auto-transitions to `funded`; try funding it again → blocked (already funded).
- [ ] As the student owner, check notifications → a `grant_funded` notification for each contribution, naming the sponsor, linking to `/student/home`'s "Grant payouts" section (raised amount + status chip per grant).
- [ ] Sign in as **admin**, open the Moderation tab's open-grants list → **Cancel** one with a reason prompt (blank reason is allowed) → status `cancelled`; a second cancel or a fund attempt on it is blocked.

## 8 · Monetization & Deal-Flow

- [ ] Sign in as **sponsor**, open the subscription page (`/sponsor/subscription`) → see Scout (free, current), Alpha, Venture Partner tiers.
- [ ] Click **Alpha** → `TierConfirmModal` opens (features + price, Cancel/Authorize) → Authorize → a brief "Redirecting to PayMongo…" pause → success; your tier is now Alpha, seats/alerts controls become meaningful.
- [ ] Click **Venture Partner** → a "Sales will reach out" toast, **no** checkout modal opens (this tier is never self-serve).
- [ ] Update **Seats** to a non-integer or 0 → rejected; set a valid integer ≥1 → saves. Toggle the **go-live alerts** switch → persists across a reload.
- [ ] Open the deal-flow board (`/sponsor/home`) → a real feed of trending published projects, same card shape as `/discover`.
- [ ] On a deal-flow card, toggle **Watchlist** → as a **Scout**-tier sponsor this is blocked (Alpha+ only); after upgrading to Alpha (above), retry → toggles on/off, reflected on reload.
- [ ] Sign in as **student**, open `/student/vaults` → one card per project you own, even with zero documents; upload a deck/financials PDF → the vault now shows that document.
- [ ] Sign in as **sponsor** (Alpha+), open that project's detail page, click **Request vault access** → status becomes "requested"; sign back in as the **student owner**, open the access-requests list, **Approve** → grant shows "Approved · expires in 14d".
- [ ] Back as the **sponsor**, the same button now reads approved and lets you open/list the vault's documents; sign in as the student and **Revoke** the grant → the sponsor is locked out again on their next attempt.
- [ ] Re-request access after a **denial** or **revoke** → the same button works again (not a dead end) — verify it re-enters the "requested" state rather than silently doing nothing.
- [ ] Sign in as **admin**, open the Badges tab, grant a **Verified Builder** badge to a published project with an evidence PDF → the project's detail page and its `/discover` gallery card both now show the verified checkmark immediately (no reload workaround needed).

## Cleanup

- [ ] Delete any Academy test accounts created during this pass so they don't pollute shared data:
  ```bash
  docker exec iskolar-academy-postgres-1 psql -U iskolar -d iskolar_academy \
    -c "DELETE FROM academy_user WHERE iskolar_user_id LIKE '<your-test-prefix>-%';"
  ```
  (Cascades to projects, grants, contributions, notifications, vault data, etc. tied to that user.)
  Under Method A, `iskolar_user_id` is whatever string you minted with, so a `LIKE` prefix
  works as shown. Under Method B it's `iskolar-main`'s real `users.user_id` (a UUID) — find
  it first via `display_name`/`headline` you set during onboarding, e.g.
  `WHERE iskolar_user_id = '<the uuid>'` or `WHERE display_name = '<what you typed>'`.
- [ ] **If you used Method B**, also delete the test account(s) from `iskolar-main`'s own database (cascades to that user's `refresh_token`/`admin` rows there):
  ```bash
  docker exec iskolar-postgres-1 psql -U iskolar -d iskolar \
    -c "DELETE FROM users WHERE email = '<the test email you registered>';"
  ```
- [ ] Clear the `auth_token` cookie in DevTools when done.
- [ ] **If you used Method B**, also stop its three processes (`iskolar-main` server, `iskolar-main` web, `Ctrl+C` both) and its Postgres container: `cd iskolar-main/server && docker compose down`.
