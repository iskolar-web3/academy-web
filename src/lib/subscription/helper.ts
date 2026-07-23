import type { Entitlement, Subscription } from "#/lib/subscription/model";
import { planInfo } from "#/lib/subscription/model";

/** Client-side gate mirror — UX only. The server's `requireEntitlement()` is the enforcer;
 * this only hides/disables controls (FR-S8). */
export function hasEntitlement(
	subscription: Subscription | undefined,
	key: Entitlement,
): boolean {
	if (!subscription) return false;
	return planInfo(subscription.tier).entitlements.includes(key);
}
