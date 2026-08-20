import { z } from "zod";

/**
 * Review domain (P2) — types + schemas for the Academy Admin console. Queue items reuse the
 * project `Project` shape (a submitted/under-review project awaiting a decision), so the review
 * modal renders straight from the queue payload. A decision is pass/fail with no scoring
 * (FR-AD3); a **return** must carry actionable notes, an approve/reject need none.
 */

export const REVIEW_DECISIONS = ["approve", "return", "reject"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const MODERATION_ACTIONS = ["unpublish", "flag"] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

/**
 * A review decision (ADM-04). Notes are required only on `return` — the sole resubmittable
 * outcome that needs feedback; approve publishes and reject is terminal.
 */
export const reviewDecisionSchema = z
	.object({
		decision: z.enum(REVIEW_DECISIONS),
		note: z.string().max(1000).optional(),
	})
	.refine((d) => d.decision !== "return" || (d.note?.trim().length ?? 0) > 0, {
		message: "Add a note so the student knows what to fix.",
		path: ["note"],
	});
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

export const moderationSchema = z.object({
	action: z.enum(MODERATION_ACTIONS),
});
export type ModerationInput = z.infer<typeof moderationSchema>;

/**
 * Platform metrics (ADM-06) — deliberately **counts, not analytics** (FR-AD5). The server owns
 * the labels/values; `delta` is a plain 7-day count string ("+3 this week"), never a chart.
 * The funding/MRR bar charts in the Metrics tab are illustrative until P4/P5 supply real data.
 */
export const metricCardSchema = z.object({
	label: z.string(),
	value: z.number(),
	delta: z.string(),
});
export type MetricCard = z.infer<typeof metricCardSchema>;

export const platformMetricsSchema = z.object({
	cards: z.array(metricCardSchema),
});
export type PlatformMetrics = z.infer<typeof platformMetricsSchema>;
