// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Tbi } from "#/lib/tbi/directory";
import { TbiMapSection } from "./TbiMapSection";

vi.mock("./TbiMapCanvas", () => ({
	TbiMapCanvas: ({
		tbis,
		onSelect,
		selectedId,
	}: {
		tbis: Tbi[];
		onSelect: (tbi: Tbi) => void;
		selectedId?: string;
	}) => (
		<div data-testid="map" data-selected={selectedId ?? ""}>
			{tbis.map((tbi) => (
				<button key={tbi.id} type="button" onClick={() => onSelect(tbi)}>
					{`Marker ${tbi.name}`}
				</button>
			))}
		</div>
	),
}));

afterEach(cleanup);

describe("TBI partnerships", () => {
	it("shows the current TBI partner with an external link to UMak", () => {
		render(<TbiMapSection />);
		expect(
			screen.getByRole("heading", { name: "TBI partnerships" }),
		).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				name: "UMak Center for Technology Incubation and Enterprise Development",
			}),
		).toBeTruthy();
		expect(screen.getByAltText("CTIED logo")).toBeTruthy();
		const visit = screen.getByRole("link", { name: /Visit UMak/ });
		expect(visit.getAttribute("href")).toBe("https://www.umak.edu.ph/");
		expect(visit.getAttribute("target")).toBe("_blank");
		expect(visit.getAttribute("rel")).toContain("noopener");
	});

	it("plots the partner on the map and tracks the selected marker", () => {
		render(<TbiMapSection />);
		const map = screen.getByTestId("map");
		expect(map.getAttribute("data-selected")).toBe("");
		fireEvent.click(
			screen.getByRole("button", {
				name: "Marker UMak Center for Technology Incubation and Enterprise Development",
			}),
		);
		expect(map.getAttribute("data-selected")).toBe("umak-ctied");
	});

	it("offers the partnering email CTA", () => {
		render(<TbiMapSection />);
		expect(
			screen.getByRole("heading", {
				name: "Interested in partnering with us?",
			}),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /hello@iskolar\.io/ })
				.getAttribute("href"),
		).toBe("mailto:hello@iskolar.io");
	});
});
