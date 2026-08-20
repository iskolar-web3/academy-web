import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type AcademyNotification,
	notificationListSchema,
} from "#/lib/notification/model";

/**
 * Notification API (PLT-07) — calls the `notification` slice on academy-server (contract in
 * that repo's `documentation/06-discovery-contact-server.md`). The list powers the
 * header bell, the notifications page, and the dashboard invites card; invite responses
 * (STU-08) post to the P1 member sub-paths that land with this slice.
 */

/** The caller's notifications, newest first. `GET /notifications`. */
export function notificationsQuery() {
	return queryOptions({
		queryKey: ["notification", "list"] as const,
		queryFn: async (): Promise<AcademyNotification[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/notifications");
			return notificationListSchema.parse(res.data);
		},
	});
}

/** Mark one notification read. `POST /notifications/:id/read`. */
export async function markRead(id: string): Promise<void> {
	await apiFetch(`/notifications/${id}/read`, { method: "POST" });
}

/** Mark everything read. `POST /notifications/read-all`. */
export async function markAllRead(): Promise<void> {
	await apiFetch("/notifications/read-all", { method: "POST" });
}

/** Accept a membership invite (STU-08). `POST /projects/:id/members/:memberId/accept`. */
export async function acceptInvite(
	projectId: string,
	memberId: string,
): Promise<void> {
	await apiFetch(`/projects/${projectId}/members/${memberId}/accept`, {
		method: "POST",
	});
}

/** Decline a membership invite (STU-08). `POST /projects/:id/members/:memberId/decline`. */
export async function declineInvite(
	projectId: string,
	memberId: string,
): Promise<void> {
	await apiFetch(`/projects/${projectId}/members/${memberId}/decline`, {
		method: "POST",
	});
}
