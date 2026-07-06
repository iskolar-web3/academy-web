import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decideReview, moderateProject } from "#/lib/review/api";
import type { ModerationInput, ReviewDecisionInput } from "#/lib/review/model";

/**
 * Admin review + moderation mutations (ADM-04/05). Each invalidates the review caches (queue +
 * moderation list + metrics) and the project cache so the student's dashboard reflects the
 * decision. The student `review_decision` notification is emitted server-side.
 */
export function useReviewDecision() {
	const qc = useQueryClient();
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["review"] });
		qc.invalidateQueries({ queryKey: ["metrics"] });
		qc.invalidateQueries({ queryKey: ["project"] });
	};

	const decide = useMutation({
		mutationFn: (vars: { id: string; input: ReviewDecisionInput }) =>
			decideReview(vars.id, vars.input),
		onSuccess: invalidate,
	});

	const moderate = useMutation({
		mutationFn: (vars: { id: string; input: ModerationInput }) =>
			moderateProject(vars.id, vars.input),
		onSuccess: invalidate,
	});

	return { decide, moderate };
}
