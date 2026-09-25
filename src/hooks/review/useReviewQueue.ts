import { useQuery } from "@tanstack/react-query";
import {
	moderationProjectsQuery,
	reviewQueueQuery,
	reviewVerificationQuery,
} from "#/lib/review/api";

/** The admin review queue — submitted + re-review projects (ADM-01). */
export function useReviewQueue() {
	return useQuery(reviewQueueQuery());
}

export function useReviewVerification(id: string) {
	return useQuery(reviewVerificationQuery(id));
}

/** Published projects available to moderate (ADM-05). */
export function useModerationProjects() {
	return useQuery(moderationProjectsQuery());
}
