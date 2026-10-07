import { describe, expect, it } from "vitest";
import { distanceKm, rankTbis, TBIS } from "./directory";

describe("TBI distance and directory", () => {
	it("calculates geographic distances in kilometres", () => {
		expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(
			111.195,
			2,
		);
		expect(distanceKm({ lat: 14.6, lng: 121 }, { lat: 14.6, lng: 121 })).toBe(
			0,
		);
		expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(
			20015.114,
			2,
		);
	});
	it("ranks the full directory independently of display filters", () => {
		const cebu = TBIS.find((tbi) => tbi.id === "up-cebu");
		if (!cebu) {
			throw new Error("Missing Cebu TBI");
		}
		const ranked = rankTbis(cebu);
		expect(ranked[0].tbi.id).toBe("up-cebu");
		expect(ranked[0].distance).toBe(0);
		expect(ranked).toHaveLength(TBIS.length);
		expect(rankTbis(cebu, [])).toEqual([]);
	});
	it("keeps records unique, sourced, and within Philippine geographic bounds", () => {
		expect(new Set(TBIS.map((tbi) => tbi.id)).size).toBe(TBIS.length);
		for (const tbi of TBIS) {
			expect(tbi.lat).toBeGreaterThan(4);
			expect(tbi.lat).toBeLessThan(22);
			expect(tbi.lng).toBeGreaterThan(116);
			expect(tbi.lng).toBeLessThan(127);
			expect(new URL(tbi.url).protocol).toBe("https:");
			expect(tbi.address.length).toBeGreaterThan(0);
		}
	});
});
