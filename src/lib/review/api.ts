import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import { type Project, projectListSchema } from "#/lib/project/model";
import type { ModerationInput, ReviewDecisionInput } from "#/lib/review/model";

/**
 * Review API — calls the `review` slice on academy-server (contract in that repo's
 * `documentation/phases/P2-review-server.md`). All routes are admin-only
 * (`requireRole("admin")`); the server owns the decision status machine and writes the
 * `review_decision` notification. Queue + moderation reads reuse the project `Project` shape.
 */

/** Submitted + re-review projects awaiting a decision (ADM-01). `GET /admin/review/queue`. */
export function reviewQueueQuery() {
	return queryOptions({
		queryKey: ["review", "queue"] as const,
		queryFn: async (): Promise<Project[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/admin/review/queue");
			return projectListSchema.parse(res.data);
		},
	});
}

/** Published projects available to moderate (ADM-05). `GET /admin/moderation/projects`. */
export function moderationProjectsQuery() {
	return queryOptions({
		queryKey: ["review", "moderation"] as const,
		queryFn: async (): Promise<Project[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(
				"/admin/moderation/projects",
			);
			return projectListSchema.parse(res.data);
		},
	});
}

/**
 * Decide a submission (ADM-04). `POST /admin/review/:id/decision`. Server transitions the
 * project (approve → published, return → returned + note, reject → rejected), writes a `review`
 * row, and emits the `review_decision` notification to the student.
 */
export async function decideReview(
	id: string,
	input: ReviewDecisionInput,
): Promise<void> {
	await apiFetch(`/admin/review/${id}/decision`, {
		method: "POST",
		body: JSON.stringify(input),
	});
}

/** Moderate a published project (ADM-05). `POST /admin/moderation/:id`. */
export async function moderateProject(
	id: string,
	input: ModerationInput,
): Promise<void> {
	await apiFetch(`/admin/moderation/${id}`, {
		method: "POST",
		body: JSON.stringify(input),
	});
}
