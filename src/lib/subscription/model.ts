import { z } from "zod";

/**
 * Subscription domain — types + schemas (P5). Reuses the exact tier/feature breakdown
 * already settled in `documents/iskolar-academy-plan.md` §4 and hardcoded in the client's
 * pre-P5 `sponsor/subscription.tsx` mock — not re-decided here (see
 * `next-steps-lumen-p4-p5.md`'s 2026-07-15 correction). Only the real peso pricing (§9.12)
 * stays open; the illustrative `price` strings below are the template's own numbers.
 *
 * Seats are a plain billing quantity, not a real multi-user team feature — there is no
 * sponsor-org-member/invite system anywhere in this app, so "seats used" would be a fake
 * number with nothing behind it. `seats` is just what the sponsor is billed for.
 */

export const PLAN_KEYS = ["scout", "alpha", "venture_partner"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const ENTITLEMENTS = [
	"vaultAccess",
	"savedSearchAlerts",
	"watchlists",
] as const;
export type Entitlement = (typeof ENTITLEMENTS)[number];

export interface PlanInfo {
	key: PlanKey;
	name: string;
	/** Illustrative — real pricing is plan §9.12, still open, gated to the PayMongo pass. */
	price: string;
	tagline: string;
	features: string[];
	/** false → contact-sales tier, no self-serve checkout (Venture Partner). */
	selfServe: boolean;
	entitlements: Entitlement[];
}

export const PLANS: PlanInfo[] = [
	{
		key: "scout",
		name: "Scout",
		price: "Free",
		tagline: "Browse, filter, express interest",
		features: [
			"Full showcase + grants browse",
			"Sector / region filters",
			"Express interest",
		],
		selfServe: true,
		entitlements: [],
	},
	{
		key: "alpha",
		name: "Alpha",
		price: "₱12,000 / mo",
		tagline: "Pro deal-flow, seat-based",
		features: [
			"Everything in Scout",
			"Vault access requests",
			"Saved-search go-live alerts",
			"Private watchlists",
		],
		selfServe: true,
		entitlements: ["vaultAccess", "savedSearchAlerts", "watchlists"],
	},
	{
		key: "venture_partner",
		name: "Venture Partner",
		price: "Custom",
		tagline: "Enterprise scouting",
		features: [
			"Everything in Alpha",
			"Promoted placement (labeled)",
			"Incubation campaigns",
			"CRM / Notion / Airtable export",
		],
		selfServe: false,
		entitlements: ["vaultAccess", "savedSearchAlerts", "watchlists"],
	},
];

export function planInfo(key: PlanKey): PlanInfo {
	// biome-ignore lint/style/noNonNullAssertion: PLANS covers every PlanKey by construction.
	return PLANS.find((p) => p.key === key)!;
}

/** A sponsor with no subscription row yet defaults to Scout (server-computed, not stored
 * until they actually change plans) — every sponsor starts here, no null state to handle. */
export const subscriptionSchema = z.object({
	tier: z.enum(PLAN_KEYS),
	seats: z.number(),
	alertsEnabled: z.boolean(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;
