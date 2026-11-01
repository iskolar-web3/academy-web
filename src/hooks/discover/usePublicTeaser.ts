import { useQuery } from "@tanstack/react-query";
import { publicTeaserQuery, TEASER_DISPLAY_LIMIT } from "#/lib/discover/api";
import { toProjectCardData } from "#/lib/discover/model";

/**
 * The public landing teaser (PLT-06) as card view-models, capped at
 * `TEASER_DISPLAY_LIMIT`. Shared by the hero carousel and Recently published, so both
 * read one cached request. Client-only: the server render and the first client render
 * both show the pending state (no hydration mismatch).
 */
export function usePublicTeaser() {
	const { data, isPending, isError } = useQuery({
		...publicTeaserQuery(),
		enabled: typeof window !== "undefined",
	});
	const cards = (data ?? [])
		.slice(0, TEASER_DISPLAY_LIMIT)
		.map(toProjectCardData);
	return { cards, isPending, isError };
}
