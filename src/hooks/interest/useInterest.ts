import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expressInterest, myInterestsQuery } from "#/lib/interest/api";

/** The sponsor's interested project ids (SPN-08) — drives "✓ Interest sent" states. */
export function useMyInterests() {
	return useQuery(myInterestsQuery());
}

/** One-tap express interest (SPN-07); idempotent server-side. */
export function useExpressInterest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (projectId: string) => expressInterest(projectId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["interest"] }),
	});
}
