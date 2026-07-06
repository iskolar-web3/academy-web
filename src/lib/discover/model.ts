import { z } from "zod";
import type { ProjectCardData } from "#/components/project/ProjectCard";
import { projectCover } from "#/lib/project/helper";
import { projectSchema } from "#/lib/project/model";

/**
 * Discover domain (SPN-03/04/05) — the public showcase projection. A showcase item is the
 * project shape the detail view already renders **plus** two server-owned display fields:
 * `trending` (top by upvotes in the last 30 days — powers the card badge) and `upvotedByMe`
 * (drives the heart state, PLT-08). Only `published` projects ever appear here.
 */

export const showcaseProjectSchema = projectSchema.extend({
	trending: z.boolean(),
	upvotedByMe: z.boolean(),
});
export type ShowcaseProject = z.infer<typeof showcaseProjectSchema>;

export const showcaseListSchema = z.array(showcaseProjectSchema);

export const GALLERY_SORTS = ["newest", "trending", "top"] as const;
export type GallerySort = (typeof GALLERY_SORTS)[number];

/** URL search params the gallery binds to (shareable / back-button-correct). */
export interface GalleryParams {
	q?: string;
	category?: string;
	sort?: GallerySort;
	/** Filter to one owner's published work (STU-02 profile backfill). */
	owner?: string;
}

/** Showcase item → the landing/teaser card view-model (`ProjectCard`). */
export function toProjectCardData(p: ShowcaseProject): ProjectCardData {
	return {
		id: p.id,
		title: p.title,
		category: p.category || "Uncategorized",
		pitch: p.pitch,
		school: p.school || "iSkolar Academy",
		upvotes: p.upvotes,
		verified: true, // everything on the showcase is published → Verified Builder
		cover: projectCover(p.hue),
	};
}
