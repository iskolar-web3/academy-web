import { z } from "zod";

/**
 * Subscription domain types and the plan labels displayed for existing accounts.
 */

export const PLAN_KEYS = ["scout", "alpha", "venture_partner"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const ENTITLEMENTS = ["vaultAccess", "watchlists"] as const;
export type Entitlement = (typeof ENTITLEMENTS)[number];

export interface PlanInfo {
	key: PlanKey;
	name: string;
	tagline: string;
	entitlements: Entitlement[];
}

export const PLANS: PlanInfo[] = [
	{
		key: "scout",
		name: "Scout",
		tagline: "Browse, filter, express interest",
		entitlements: [],
	},
	{
		key: "alpha",
		name: "Alpha",
		tagline: "Deal-flow tools",
		entitlements: ["vaultAccess", "watchlists"],
	},
	{
		key: "venture_partner",
		name: "Venture Partner",
		tagline: "Enterprise scouting",
		entitlements: ["vaultAccess", "watchlists"],
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
