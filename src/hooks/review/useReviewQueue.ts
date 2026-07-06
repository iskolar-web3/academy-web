import { useQuery } from "@tanstack/react-query";
import { moderationProjectsQuery, reviewQueueQuery } from "#/lib/review/api";

/** The admin review queue — submitted + re-review projects (ADM-01). */
export function useReviewQueue() {
	return useQuery(reviewQueueQuery());
}

/** Published projects available to moderate (ADM-05). */
export function useModerationProjects() {
	return useQuery(moderationProjectsQuery());
}
