import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { myVaultsQuery, uploadVaultDoc } from "#/lib/vault/api";

/** Owner vault management (STU-17). */
export function useMyVaults() {
	return useQuery(myVaultsQuery());
}

export function useUploadVaultDoc() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { projectId: string; file: File }) =>
			uploadVaultDoc(vars.projectId, vars.file),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["vault", "mine"] }),
	});
}
