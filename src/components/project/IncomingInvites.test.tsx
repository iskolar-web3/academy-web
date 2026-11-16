// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AcademyNotification } from "#/lib/notification/model";
import { isPendingInvite } from "#/lib/notification/model";

const api = vi.hoisted(() => ({
	notifications: [] as unknown[],
	acceptInvite: vi.fn(async () => {}),
	declineInvite: vi.fn(async () => {}),
}));

vi.mock("#/lib/notification/api", async () => {
	const { queryOptions } = await import("@tanstack/react-query");
	return {
		notificationsQuery: () =>
			queryOptions({
				queryKey: ["notification", "list"],
				queryFn: async () => api.notifications,
			}),
		markRead: vi.fn(),
		markAllRead: vi.fn(),
		resendInvite: vi.fn(),
		acceptInvite: api.acceptInvite,
		declineInvite: api.declineInvite,
	};
});

const { IncomingInvites } = await import("./IncomingInvites");

function invite(
	overrides: Partial<AcademyNotification> = {},
): AcademyNotification {
	return {
		id: "n1",
		type: "member_invite",
		tone: "action",
		title: "Sibol",
		body: "Lead invited you: Frontend",
		ageLabel: "1h ago",
		unread: true,
		projectId: "p1",
		actorUserId: "u-lead",
		actorName: "Lead",
		memberId: "m1",
		inviteConsent: "pending",
		...overrides,
	};
}

function renderWith(ui: ReactNode) {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

afterEach(cleanup);

describe("isPendingInvite", () => {
	it("stays pending after the notification is read (regression)", () => {
		expect(isPendingInvite(invite({ unread: false }))).toBe(true);
	});
	it("is done once the member accepted or declined", () => {
		expect(isPendingInvite(invite({ inviteConsent: "accepted" }))).toBe(false);
		expect(isPendingInvite(invite({ inviteConsent: "declined" }))).toBe(false);
	});
	it("falls back to unread when the server omits inviteConsent", () => {
		expect(
			isPendingInvite(invite({ inviteConsent: undefined, unread: true })),
		).toBe(true);
		expect(
			isPendingInvite(invite({ inviteConsent: undefined, unread: false })),
		).toBe(false);
	});
	it("ignores other notification types", () => {
		expect(isPendingInvite(invite({ type: "review_decision" }))).toBe(false);
	});
});

describe("IncomingInvites", () => {
	it("shows Accept for a read-but-pending invite and posts accept", async () => {
		api.notifications = [invite({ unread: false })];
		renderWith(<IncomingInvites />);

		fireEvent.click(await screen.findByRole("button", { name: /accept/i }));

		await waitFor(() =>
			expect(api.acceptInvite).toHaveBeenCalledWith("p1", "m1"),
		);
	});

	it("posts decline", async () => {
		api.notifications = [invite()];
		renderWith(<IncomingInvites />);

		fireEvent.click(await screen.findByRole("button", { name: /decline/i }));

		await waitFor(() =>
			expect(api.declineInvite).toHaveBeenCalledWith("p1", "m1"),
		);
	});

	it("renders nothing once the invite is answered", async () => {
		api.notifications = [invite({ inviteConsent: "accepted" })];
		const { container } = renderWith(<IncomingInvites />);

		await waitFor(() => expect(container.innerHTML).toBe(""));
	});
});
