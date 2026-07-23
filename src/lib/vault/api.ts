import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch, apiUpload, BACKEND_URL } from "#/lib/api";
import {
	type MyVault,
	myVaultListSchema,
	type VaultAccessDecision,
	type VaultAccessRequest,
	type VaultDocument,
	vaultAccessRequestListSchema,
	vaultDocumentListSchema,
} from "#/lib/vault/model";

/**
 * Vault API (P5). Documents reuse the interim `documents.ts` storage (folder `'vault'`) —
 * real Postgres storage today, swapped for Lumen later with no contract change, same as
 * the P1 thesis retrofit and P4's grant proposals.
 */

/** One entry per project the caller owns, even with zero documents yet (STU-17's
 * "Set up Venture-Pitch Vault" IS uploading the first document, not a separate step).
 * `GET /vaults/me`. */
export function myVaultsQuery() {
	return queryOptions({
		queryKey: ["vault", "mine"] as const,
		queryFn: async (): Promise<MyVault[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/vaults/me");
			return myVaultListSchema.parse(res.data);
		},
	});
}

/** Upload a vault document (STU-17). Multipart, mirrors `uploadThesisPaper`/grant proposal
 * upload exactly. `POST /vaults/:projectId/documents`. */
export async function uploadVaultDoc(
	projectId: string,
	file: File,
): Promise<{ key: string }> {
	const formData = new FormData();
	formData.append("file", file);
	const res = await apiUpload<ApiEnvelope<{ key: string }>>(
		`/vaults/${projectId}/documents`,
		formData,
	);
	return res.data;
}

/** Read a vault document — owner or a sponsor with an approved, unexpired access grant.
 * Direct navigation target, same pattern as `thesisPaperUrl`/`grantProposalUrl`. */
export function vaultDocumentUrl(
	projectId: string,
	documentId: string,
): string {
	return `${BACKEND_URL}/vaults/${projectId}/documents/${documentId}`;
}

/** The caller's incoming access requests, across every project they own (STU-18).
 * `GET /vaults/access-requests/me`. */
export function myVaultAccessRequestsQuery() {
	return queryOptions({
		queryKey: ["vault", "access-requests", "mine"] as const,
		queryFn: async (): Promise<VaultAccessRequest[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(
				"/vaults/access-requests/me",
			);
			return vaultAccessRequestListSchema.parse(res.data);
		},
	});
}

/** Approve (14-day grant) / deny / revoke (STU-18). `POST /vaults/access-requests/:id/decide`. */
export async function decideVaultAccess(
	requestId: string,
	decision: VaultAccessDecision,
): Promise<void> {
	await apiFetch(`/vaults/access-requests/${requestId}/decide`, {
		method: "POST",
		body: JSON.stringify({ decision }),
	});
}

/** Sponsor requests access to a project's vault (SPN-16). `POST /projects/:id/vault-access`. */
export async function requestVaultAccess(projectId: string): Promise<void> {
	await apiFetch(`/projects/${projectId}/vault-access`, { method: "POST" });
}

/** A sponsor's own view of a project's vault documents — 200 only with an approved,
 * unexpired grant (else 403, matched by not calling this until `vaultAccessStatus ===
 * "approved"`). `GET /projects/:id/vault-documents`. */
export function projectVaultDocumentsQuery(
	projectId: string,
	enabled: boolean,
) {
	return queryOptions({
		queryKey: ["vault", "documents", projectId] as const,
		queryFn: async (): Promise<VaultDocument[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(
				`/projects/${projectId}/vault-documents`,
			);
			return vaultDocumentListSchema.parse(res.data);
		},
		enabled,
	});
}
