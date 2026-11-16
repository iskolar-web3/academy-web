/**
 * Calendar-date helpers for date-only fields (birth date). A date-only value is stored and
 * sent as a plain "YYYY-MM-DD" string and only ever turned into a LOCAL-midnight `Date` for
 * the picker/formatting — never through UTC. `toISOString()` / `new Date("YYYY-MM-DD")` both
 * go through UTC and shift the day by one in non-UTC timezones (Aug 23 in UTC+8 became Aug 22).
 */

/** Local calendar date → "YYYY-MM-DD" (no UTC conversion). */
export function toIsoDate(date: Date): string {
	const y = String(date.getFullYear()).padStart(4, "0");
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → local-midnight `Date`; undefined for empty/malformed input. */
export function parseIsoDate(iso: string): Date | undefined {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) {
		return undefined;
	}
	const [, y, m, d] = match.map(Number);
	const date = new Date(y, m - 1, d);
	// Reject overflow like 2001-02-30 (rolls to March).
	return date.getMonth() === m - 1 ? date : undefined;
}
