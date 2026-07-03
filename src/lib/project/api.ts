import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type Project,
	type ProjectInput,
	projectListSchema,
	projectSchema,
} from "#/lib/project/model";

/**
 * Project API — calls the `project` slice on academy-server (see that repo's
 * `documentation/phases/P1-submission-server.md` for the contract). Reads parse through Zod;
 * lifecycle transitions POST to their own sub-paths so the **server** owns the status machine
 * and the MVP gate (the client gate is UX only). Query keys/signatures are unchanged from the
 * earlier mock store, so hooks and UI didn't move.
 */

/** My projects (dashboard). `GET /projects/me`. */
export function myProjectsQuery() {
	return queryOptions({
		queryKey: ["project", "mine"] as const,
		queryFn: async (): Promise<Project[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/projects/me");
			return projectListSchema.parse(res.data);
		},
	});
}

/** One project (owner or public projection). `GET /projects/:id`. */
export function projectQuery(id: string) {
	return queryOptions({
		queryKey: ["project", id] as const,
		queryFn: async (): Promise<Project> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(`/projects/${id}`);
			return projectSchema.parse(res.data);
		},
	});
}

/** Create a draft (STU-03). `POST /projects`. */
export async function createDraft(input: ProjectInput): Promise<Project> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/projects", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return projectSchema.parse(res.data);
}

/**
 * Save edits (STU-11). `PATCH /projects/:id`. The server runs the re-review predicate:
 * a published project whose title/category/MVP links change re-enters `under_review`.
 */
export async function updateProject(
	id: string,
	input: ProjectInput,
): Promise<void> {
	await apiFetch(`/projects/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

/** Submit for review (STU-04). Server re-validates the MVP gate. `POST /projects/:id/submit`. */
export async function submitProject(id: string): Promise<void> {
	await apiFetch(`/projects/${id}/submit`, { method: "POST" });
}

/** Resubmit a returned/withdrawn project. `POST /projects/:id/resubmit`. */
export async function resubmitProject(id: string): Promise<void> {
	await apiFetch(`/projects/${id}/resubmit`, { method: "POST" });
}

/** Withdraw a published project (STU-10). `POST /projects/:id/withdraw`. */
export async function withdrawProject(id: string): Promise<void> {
	await apiFetch(`/projects/${id}/withdraw`, { method: "POST" });
}

/** Delete a draft. `DELETE /projects/:id`. */
export async function deleteDraft(id: string): Promise<void> {
	await apiFetch(`/projects/${id}`, { method: "DELETE" });
}
