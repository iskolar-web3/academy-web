import { useQuery } from "@tanstack/react-query";
import { publishedProjectsQuery } from "#/lib/discover/api";
import type { GalleryParams } from "#/lib/discover/model";

/** The showcase gallery, keyed off the URL search params (SPN-03/04/05). */
export function useProjectGallery(params: GalleryParams = {}) {
	return useQuery(publishedProjectsQuery(params));
}
