// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TbiMapSection } from "./TbiMapSection";

vi.mock("./TbiMapCanvas", () => ({
	TbiMapCanvas: () => <div data-testid="map" />,
}));
vi.mock("#/lib/tbi/places", async (importOriginal) => ({
	...(await importOriginal<object>()),
	searchPlaces: vi.fn(),
}));

import { searchPlaces } from "#/lib/tbi/places";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

describe("TBI discovery", () => {
	it("requests location on user action and shows the nearest TBI", () => {
		const locate = vi.fn((success: PositionCallback) =>
			success({
				coords: { latitude: 10.322, longitude: 123.898, accuracy: 20 },
			} as GeolocationPosition),
		);
		vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: locate } });
		render(<TbiMapSection />);
		expect(locate).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Find TBI Near Me" }));
		expect(locate).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Nearest listed TBI")).toBeTruthy();
		expect(screen.getByText("Less than 1 km", { selector: "p" })).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "View Nearest TBI" }));
		expect(screen.getByRole("link", { name: "View details" })).toBeTruthy();
	});
	it("supports a manual city when permission is denied", () => {
		const locate = vi.fn((_success, failure: PositionErrorCallback) =>
			failure({ code: 1 } as GeolocationPositionError),
		);
		vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: locate } });
		render(<TbiMapSection />);
		fireEvent.click(screen.getByRole("button", { name: "Find TBI Near Me" }));
		expect(screen.getByText(/Location access was denied/)).toBeTruthy();
		fireEvent.change(screen.getByLabelText("Choose a directory city"), {
			target: { value: "wildcat" },
		});
		expect(
			screen.getByRole("button", { name: "View Nearest TBI" }),
		).toBeTruthy();
		expect(screen.getByText(/From Cebu City, Cebu/)).toBeTruthy();
	});
	it("ignores a pending geolocation response after manual selection", () => {
		let respond: PositionCallback | undefined;
		vi.stubGlobal("navigator", {
			geolocation: {
				getCurrentPosition: (success: PositionCallback) => {
					respond = success;
				},
			},
		});
		render(<TbiMapSection />);
		fireEvent.click(screen.getByRole("button", { name: "Find TBI Near Me" }));
		fireEvent.change(screen.getByLabelText("Choose a directory city"), {
			target: { value: "wildcat" },
		});
		act(() =>
			respond?.({
				coords: { latitude: 14.6, longitude: 121, accuracy: 10 },
			} as GeolocationPosition),
		);
		expect(screen.getByText(/From Cebu City, Cebu/)).toBeTruthy();
	});
	it("searches for a municipality and lets the user choose the result", async () => {
		vi.mocked(searchPlaces).mockResolvedValue([
			{
				id: "test",
				label: "Palo, Leyte, Philippines",
				lat: 11.16,
				lng: 124.99,
			},
		]);
		render(<TbiMapSection />);
		fireEvent.change(screen.getByLabelText("Search a place"), {
			target: { value: "Palo" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: "Search Philippine places" }),
		);
		fireEvent.click(
			await screen.findByRole("button", { name: "Palo, Leyte, Philippines" }),
		);
		expect(screen.getByText(/From Palo, Leyte, Philippines/)).toBeTruthy();
	});
	it("keeps offline city selection available if place search fails", async () => {
		vi.mocked(searchPlaces).mockRejectedValue(new Error("offline"));
		render(<TbiMapSection />);
		fireEvent.change(screen.getByLabelText("Search a place"), {
			target: { value: "Laguna" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: "Search Philippine places" }),
		);
		await waitFor(() =>
			expect(screen.getByText(/Place search is unavailable/)).toBeTruthy(),
		);
		expect(screen.getByLabelText("Choose a directory city")).toBeTruthy();
	});
});
