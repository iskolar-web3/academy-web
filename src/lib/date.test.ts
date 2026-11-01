import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { parseIsoDate, toIsoDate } from "#/lib/date";

// Regression: the birth-date picker saved Aug 22 when Aug 23, 2000 was picked (UTC+8), because
// it serialized via toISOString(). Run with TZ=Asia/Manila (or any non-UTC zone) to exercise it;
// the cases also hold in UTC.
const CASES = [
	"2000-08-23",
	"2000-08-01",
	"2000-08-31",
	"2000-01-01",
	"1999-12-31",
	"2000-02-29",
	"2001-02-28",
	"2024-03-01",
];

describe("date-only round-trip", () => {
	it.each(CASES)("%s survives picker → string → display", (iso) => {
		const [y, m, d] = iso.split("-").map(Number);
		// What react-day-picker hands onSelect: local midnight of the clicked day.
		const picked = new Date(y, m - 1, d);

		const stored = toIsoDate(picked);
		expect(stored).toBe(iso);

		const reparsed = parseIsoDate(stored);
		expect(reparsed && toIsoDate(reparsed)).toBe(iso);
		expect(reparsed?.getDate()).toBe(d);
	});

	it("displays the chosen day, not the previous one", () => {
		const picked = new Date(2000, 7, 23);
		const display = format(
			parseIsoDate(toIsoDate(picked)) as Date,
			"MMMM d, yyyy",
		);
		expect(display).toBe("August 23, 2000");
	});

	it("rejects empty or malformed values", () => {
		expect(parseIsoDate("")).toBeUndefined();
		expect(parseIsoDate("2000-8-23")).toBeUndefined();
		expect(parseIsoDate("2001-02-30")).toBeUndefined();
	});
});
