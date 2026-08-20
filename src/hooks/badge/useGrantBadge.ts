import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grantBadge } from "#/lib/badge/api";
import type { BadgeKind } from "#/lib/badge/model";

/** Admin grant mutation (ADM-07) — invalidates both the moderation list and the discover
 * cache, since a granted badge flips `Project.verified` shown on gallery cards/detail. */
export function useGrantBadge() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { projectId: string; kind: BadgeKind; file: File }) =>
			grantBadge(vars.projectId, vars.kind, vars.file),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["review"] });
			qc.invalidateQueries({ queryKey: ["discover"] });
		},
	});
}
