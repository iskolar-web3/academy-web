import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	decideVaultAccess,
	myVaultAccessRequestsQuery,
	projectVaultDocumentsQuery,
	requestVaultAccess,
} from "#/lib/vault/api";
import type { VaultAccessDecision } from "#/lib/vault/model";

/** A sponsor's own read of a project's vault documents — only fetched once access is
 * approved (SPN-16). */
export function useProjectVaultDocuments(projectId: string, enabled: boolean) {
	return useQuery(projectVaultDocumentsQuery(projectId, enabled));
}

/** The caller's incoming vault access requests (STU-18). */
export function useMyVaultAccessRequests() {
	return useQuery(myVaultAccessRequestsQuery());
}

export function useDecideVaultAccess() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { requestId: string; decision: VaultAccessDecision }) =>
			decideVaultAccess(vars.requestId, vars.decision),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["vault", "access-requests"] }),
	});
}

/** Sponsor requests access to a project's vault (SPN-16). */
export function useRequestVaultAccess() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (projectId: string) => requestVaultAccess(projectId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["discover"] }),
	});
}
