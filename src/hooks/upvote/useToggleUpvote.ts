import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShowcaseProject } from "#/lib/discover/model";
import { toggleUpvote } from "#/lib/upvote/api";

/**
 * Optimistic upvote toggle (PLT-08 — "count updates immediately"). Flips `upvotedByMe`
 * and nudges `upvotes` across every cached discover list before the request resolves;
 * rolls back on error and reconciles with the server on settle.
 */
export function useToggleUpvote() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (projectId: string) => toggleUpvote(projectId),
		onMutate: async (projectId) => {
			await qc.cancelQueries({ queryKey: ["discover"] });
			const previous = qc.getQueriesData({ queryKey: ["discover"] });
			const flip = (p: ShowcaseProject): ShowcaseProject =>
				p.id === projectId
					? {
							...p,
							upvotedByMe: !p.upvotedByMe,
							upvotes: p.upvotes + (p.upvotedByMe ? -1 : 1),
						}
					: p;
			// Discover caches hold both lists (gallery/teaser) and single projects (detail).
			qc.setQueriesData({ queryKey: ["discover"] }, (data: unknown) => {
				if (!data) return data;
				if (Array.isArray(data)) return data.map(flip);
				return flip(data as ShowcaseProject);
			});
			return { previous };
		},
		onError: (_err, _projectId, context) => {
			for (const [key, data] of context?.previous ?? []) {
				qc.setQueryData(key, data);
			}
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["discover"] });
		},
	});
}
