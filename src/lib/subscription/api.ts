import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type Subscription,
	subscriptionSchema,
} from "#/lib/subscription/model";

/**
 * Read the sponsor's current plan.
 */

/** The caller's current plan (defaults to Scout server-side if no row exists yet).
 * `GET /subscriptions/me`. */
export function mySubscriptionQuery() {
	return queryOptions({
		queryKey: ["subscription", "mine"] as const,
		queryFn: async (): Promise<Subscription> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/subscriptions/me");
			return subscriptionSchema.parse(res.data);
		},
	});
}
