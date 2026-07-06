import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { type ApiEnvelope, apiFetch } from "#/lib/api";

/**
 * Interest API (SPN-07/08 · STU-12) — one-tap sponsor interest. **Idempotent** server-side
 * (unique sponsor×project; a re-tap returns 200 and never re-notifies). The reveal to the
 * student is the `sponsor_interest` notification linking to the sponsor's profile — never
 * the student's contact info. `GET /interests/me` returns the sponsor's interested project
 * ids (SPN-08) and drives every "✓ Interest sent" button state.
 */

const interestIdsSchema = z.array(z.string());

/** Project ids I've expressed interest in (SPN-08). `GET /interests/me`. */
export function myInterestsQuery() {
	return queryOptions({
		queryKey: ["interest", "mine"] as const,
		queryFn: async (): Promise<string[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/interests/me");
			return interestIdsSchema.parse(res.data);
		},
	});
}

/** Express interest (SPN-07). Idempotent. `POST /projects/:id/interest`. */
export async function expressInterest(projectId: string): Promise<void> {
	await apiFetch(`/projects/${projectId}/interest`, { method: "POST" });
}
