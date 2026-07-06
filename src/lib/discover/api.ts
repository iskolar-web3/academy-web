import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type GalleryParams,
	type ShowcaseProject,
	showcaseListSchema,
	showcaseProjectSchema,
} from "#/lib/discover/model";

/**
 * Discover API — calls the `discover` slice on academy-server (contract in that repo's
 * `documentation/phases/P3-discovery-contact-server.md`). Published-only projections;
 * search/filter/sort run **server-side** (tsvector search; Trending = upvotes last 30 days,
 * Top = all-time). The teaser read is public (no cookie) for the visitor landing (PLT-06).
 */

/** The showcase gallery (SPN-03/04/05). `GET /discover/projects`. */
export function publishedProjectsQuery(params: GalleryParams = {}) {
	return queryOptions({
		queryKey: ["discover", "projects", params] as const,
		queryFn: async (): Promise<ShowcaseProject[]> => {
			const search = new URLSearchParams();
			if (params.q) search.set("q", params.q);
			if (params.category && params.category !== "All")
				search.set("category", params.category);
			if (params.sort) search.set("sort", params.sort);
			if (params.owner) search.set("owner", params.owner);
			const qs = search.toString();
			const res = await apiFetch<ApiEnvelope<unknown>>(
				`/discover/projects${qs ? `?${qs}` : ""}`,
			);
			return showcaseListSchema.parse(res.data);
		},
	});
}

/** One published project (public/sponsor detail). 404 unless published. `GET /discover/projects/:id`. */
export function showcaseProjectQuery(id: string) {
	return queryOptions({
		queryKey: ["discover", "project", id] as const,
		queryFn: async (): Promise<ShowcaseProject> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(
				`/discover/projects/${id}`,
			);
			return showcaseProjectSchema.parse(res.data);
		},
	});
}

/** Top-3 newest published for the visitor landing (PLT-06). PUBLIC. `GET /discover/teaser`. */
export function publicTeaserQuery() {
	return queryOptions({
		queryKey: ["discover", "teaser"] as const,
		queryFn: async (): Promise<ShowcaseProject[]> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/discover/teaser");
			return showcaseListSchema.parse(res.data);
		},
	});
}
