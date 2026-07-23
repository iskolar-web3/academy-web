import { useQuery } from "@tanstack/react-query";
import { mySubscriptionQuery } from "#/lib/subscription/api";

/** Active plan + entitlements (SPN-12). */
export function useMySubscription() {
	return useQuery(mySubscriptionQuery());
}
