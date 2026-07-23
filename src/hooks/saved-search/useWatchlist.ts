import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleWatch, watchlistQuery } from "#/lib/saved-search/api";

/** The sponsor's watched project ids (SPN-15). */
export function useWatchlist() {
	return useQuery(watchlistQuery());
}

/** Toggle a project's watch state, invalidating the watchlist cache. */
export function useToggleWatch() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (projectId: string) => toggleWatch(projectId),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
	});
}
