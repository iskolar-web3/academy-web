import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { type ApiEnvelope, apiFetch } from "#/lib/api";

/**
 * Watchlist API (SPN-15). Mirrors `lib/interest`'s shape exactly: `GET /watchlist` returns
 * the sponsor's watched project ids, driving every "★ Watching" card state; toggling is a
 * single idempotent endpoint (same pattern as upvote's toggle, not interest's one-way tap).
 * Private — never visible to the student (FR-DF/SPN-15).
 */

const watchlistIdsSchema = z.array(z.string());

/** Project ids I'm watching. `GET /watchlist`. */
export function watchlistQuery() {
	return queryOptions({
		queryKey: ["watchlist", "mine"] as const,
		queryFn: async (): Promise<string[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/watchlist");
			return watchlistIdsSchema.parse(res.data);
		},
	});
}

/** Toggle watch (add/remove). `POST /projects/:id/watch`. */
export async function toggleWatch(projectId: string): Promise<void> {
	await apiFetch(`/projects/${projectId}/watch`, { method: "POST" });
}
