/**
 * Watchlist domain (SPN-15, P5). Reduced from the original plan's `saved_search` +
 * `watchlist_item` pair to **just the watchlist** — the template has no saved-search
 * management page anywhere (no "save a query" UI is ever rendered); the only saved-search
 * surface that actually exists is the single go-live-alerts on/off toggle, which lives on
 * `Subscription.alertsEnabled` (a sponsor-level preference, not a per-query entity) — see
 * `next-steps-lumen-p4-p5.md`'s scope correction. This file only models the private,
 * per-project watch toggle.
 */

/** The caller's watched project ids — mirrors `lib/interest`'s `myInterestsQuery` shape. */
export type WatchlistIds = string[];
