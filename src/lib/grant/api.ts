import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch, apiUpload, BACKEND_URL } from "#/lib/api";
import {
	type GrantInput,
	type GrantRequest,
	grantListSchema,
	grantSchema,
} from "#/lib/grant/model";

/**
 * Grant API — calls the `grant` slice on academy-server (see that repo's
 * `documentation/07-grants-funding-server.md` for the contract). No draft state: a
 * grant is created and the required title-proposal PDF is uploaded in **one** multipart
 * request (matching the template's single "Publish grant request" button — there is no
 * two-step create-then-upload the user ever sees).
 */

/** All grant requests (any status — the gallery shows open/funded/closed alike, matching
 * the template). `GET /grants`. */
export function openGrantsQuery() {
	return queryOptions({
		queryKey: ["grant", "list"] as const,
		queryFn: async (): Promise<GrantRequest[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/grants");
			return grantListSchema.parse(res.data);
		},
	});
}

/** One grant. `GET /grants/:id`. */
export function grantQuery(id: string) {
	return queryOptions({
		queryKey: ["grant", id] as const,
		queryFn: async (): Promise<GrantRequest> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(`/grants/${id}`);
			return grantSchema.parse(res.data);
		},
	});
}

/** The caller's own grant requests (student dashboard "Grant payouts"). `GET /grants/me`. */
export function myGrantsQuery() {
	return queryOptions({
		queryKey: ["grant", "mine"] as const,
		queryFn: async (): Promise<GrantRequest[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/grants/me");
			return grantListSchema.parse(res.data);
		},
	});
}

/**
 * Publish a grant request (STU-14). Multipart: `data` (JSON-stringified `GrantInput`) +
 * `file` (the title-proposal PDF, required). `POST /grants`.
 */
export async function createGrantRequest(
	input: GrantInput,
	file: File,
): Promise<GrantRequest> {
	const formData = new FormData();
	formData.append("data", JSON.stringify(input));
	formData.append("file", file);
	const res = await apiUpload<ApiEnvelope<unknown>>("/grants", formData);
	return grantSchema.parse(res.data);
}

/** Direct link to read the stored title-proposal PDF — same pattern as
 * `thesisPaperUrl` (auth-gated server-side, a top-level navigation target). */
export function grantProposalUrl(grantId: string): string {
	return `${BACKEND_URL}/grants/${grantId}/proposal`;
}

/** Admin cancel-with-reason (ADM-02). `POST /grants/:id/cancel`. */
export async function cancelGrantRequest(
	grantId: string,
	reason: string,
): Promise<void> {
	await apiFetch(`/grants/${grantId}/cancel`, {
		method: "POST",
		body: JSON.stringify({ reason }),
	});
}
