import { apiFetch } from "#/lib/api";

/**
 * Upvote API (PLT-08) — one endpoint: toggle the caller's upvote on a published project.
 * The count comes embedded on the project (`upvotes` + `upvotedByMe`); the server enforces
 * one-per-user (unique user×project) and owns Trending/Top math.
 */

/** Toggle my upvote. `POST /projects/:id/upvote`. */
export async function toggleUpvote(projectId: string): Promise<void> {
	await apiFetch(`/projects/${projectId}/upvote`, { method: "POST" });
}
