// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketingPreference } from "#/lib/account/model";
import { MarketingPreferenceSettings } from "./MarketingPreferenceSettings";

let stored: MarketingPreference;
let failRead: boolean;
let failSave: boolean;
let readWait: Promise<void> | undefined;
let saveWait: Promise<void> | undefined;
let requests: {
	method: string;
	body?: unknown;
	credentials?: RequestCredentials;
}[];

function response(data: MarketingPreference) {
	return new Response(JSON.stringify({ message: "ok", data }), { status: 200 });
}

beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		},
	);
	stored = {
		marketingOptIn: true,
		marketingEmail: "learner@example.test",
		marketingOptInAt: "2026-11-14T00:00:00.000Z",
	};
	failRead = false;
	failSave = false;
	readWait = undefined;
	saveWait = undefined;
	requests = [];
	vi.stubGlobal(
		"fetch",
		vi.fn(async (_url: string, init?: RequestInit) => {
			const method = init?.method ?? "GET";
			requests.push({
				method,
				body: init?.body ? JSON.parse(String(init.body)) : undefined,
				credentials: init?.credentials,
			});
			if (method === "GET") {
				await readWait;
				if (failRead) {
					return new Response(JSON.stringify({ message: "Read failed" }), {
						status: 503,
					});
				}
				return response(stored);
			}
			await saveWait;
			if (failSave) {
				return new Response(JSON.stringify({ message: "Save failed" }), {
					status: 503,
				});
			}
			const input = JSON.parse(String(init?.body));
			stored = {
				marketingOptIn: input.marketingOptIn,
				marketingEmail: input.marketingEmail ?? stored.marketingEmail,
				marketingOptInAt: input.marketingOptIn
					? "2026-11-14T01:00:00.000Z"
					: null,
			};
			return response(stored);
		}),
	);
});

afterEach(cleanup);

function renderSettings(
	accountId = "account-a",
	qc = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
	}),
) {
	return render(
		<QueryClientProvider client={qc}>
			<MarketingPreferenceSettings key={accountId} accountId={accountId} />
		</QueryClientProvider>,
	);
}

describe("saved email preference", () => {
	it("loads signup consent, saves opt-out, and retains it after a fresh visit", async () => {
		const view = renderSettings();
		await waitFor(() =>
			expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
				"true",
			),
		);
		expect(
			(screen.getByLabelText("Email for updates") as HTMLInputElement).value,
		).toBe("learner@example.test");
		fireEvent.click(screen.getByRole("switch"));
		fireEvent.click(screen.getByRole("button", { name: "Save preference" }));
		await screen.findByText("Email preference saved.");
		expect(requests.find((item) => item.method === "PATCH")).toEqual({
			method: "PATCH",
			body: { marketingOptIn: false },
			credentials: "include",
		});
		view.unmount();
		renderSettings();
		await waitFor(() =>
			expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
				false,
			),
		);
		expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
			"false",
		);
		fireEvent.click(screen.getByRole("switch"));
		fireEvent.click(screen.getByRole("button", { name: "Save preference" }));
		await screen.findByText("Email preference saved.");
		expect(stored.marketingOptIn).toBe(true);
	});

	it("requires an email for opt-in and disables edits until the write is confirmed", async () => {
		stored = {
			marketingOptIn: false,
			marketingEmail: null,
			marketingOptInAt: null,
		};
		renderSettings();
		await waitFor(() =>
			expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
				false,
			),
		);
		fireEvent.click(screen.getByRole("switch"));
		fireEvent.click(screen.getByRole("button", { name: "Save preference" }));
		expect(screen.getByRole("alert").textContent).toBe(
			"Enter a valid email address.",
		);
		expect(requests.filter((item) => item.method === "PATCH")).toHaveLength(0);
		fireEvent.change(screen.getByLabelText("Email for updates"), {
			target: { value: "new@example.test" },
		});
		let releaseSave = () => {};
		saveWait = new Promise<void>((resolve) => {
			releaseSave = resolve;
		});
		fireEvent.click(screen.getByRole("button", { name: "Save preference" }));
		await waitFor(() =>
			expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
				true,
			),
		);
		expect(
			(screen.getByRole("button", { name: "Saving…" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		releaseSave();
		await screen.findByText("Email preference saved.");
		expect(stored.marketingEmail).toBe("new@example.test");
	});

	it("disables the switch on a failed read and lets the user retry", async () => {
		failRead = true;
		renderSettings();
		await screen.findByText("Couldn't load your email preference.");
		expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
			true,
		);
		failRead = false;
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		await waitFor(() =>
			expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
				"true",
			),
		);
	});

	it("preserves unsaved edits after failure and retries the same choice", async () => {
		failSave = true;
		renderSettings();
		await waitFor(() =>
			expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
				"true",
			),
		);
		fireEvent.click(screen.getByRole("switch"));
		fireEvent.click(screen.getByRole("button", { name: "Save preference" }));
		await screen.findByRole("alert");
		expect(stored.marketingOptIn).toBe(true);
		expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
			"false",
		);
		failSave = false;
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		await screen.findByText("Email preference saved.");
		expect(stored.marketingOptIn).toBe(false);
	});

	it("does not show another account's cached email while loading", async () => {
		const qc = new QueryClient({
			defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
		});
		const view = renderSettings("account-a", qc);
		await screen.findByLabelText("Email for updates");
		view.unmount();
		let releaseRead = () => {};
		readWait = new Promise<void>((resolve) => {
			releaseRead = resolve;
		});
		stored = {
			marketingOptIn: false,
			marketingEmail: "other@example.test",
			marketingOptInAt: null,
		};
		renderSettings("account-b", qc);
		expect(screen.queryByDisplayValue("learner@example.test")).toBeNull();
		expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
			true,
		);
		releaseRead();
		await waitFor(() =>
			expect((screen.getByRole("switch") as HTMLButtonElement).disabled).toBe(
				false,
			),
		);
		expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe(
			"false",
		);
	});
});
