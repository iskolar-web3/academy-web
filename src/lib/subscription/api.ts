import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type PlanKey,
	type Subscription,
	subscriptionSchema,
} from "#/lib/subscription/model";

/**
 * Subscription API (P5). `subscribeToTier` is the simulated-checkout write — a real
 * `POST`, no real PayMongo call yet (see `next-steps-lumen-p4-p5.md`). Server-side this
 * calls `src/payments.ts`'s `subscribeToTier()` (same module P4's grant fund flow built).
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

/** Simulated checkout (SPN-12). `POST /subscriptions/subscribe`. */
export async function subscribeToTier(tier: PlanKey): Promise<Subscription> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/subscriptions/subscribe", {
		method: "POST",
		body: JSON.stringify({ tier }),
	});
	return subscriptionSchema.parse(res.data);
}

/** Real CRUD, no checkout ceremony (seats aren't a distinct money action). `POST /subscriptions/seats`. */
export async function updateSeats(seats: number): Promise<Subscription> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/subscriptions/seats", {
		method: "POST",
		body: JSON.stringify({ seats }),
	});
	return subscriptionSchema.parse(res.data);
}

/** Go-live alerts preference (SPN-14 — a single on/off toggle, not multiple named saved
 * searches; see `next-steps-lumen-p4-p5.md`'s scope correction). `POST /subscriptions/alerts`. */
export async function setAlertsEnabled(
	enabled: boolean,
): Promise<Subscription> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/subscriptions/alerts", {
		method: "POST",
		body: JSON.stringify({ enabled }),
	});
	return subscriptionSchema.parse(res.data);
}
