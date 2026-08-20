import { useMySubscription } from "#/hooks/subscription/useMySubscription";
import { hasEntitlement } from "#/lib/subscription/helper";
import type { Entitlement } from "#/lib/subscription/model";

/** Client-side gate helper (UX; server `requireEntitlement()` is the enforcer). */
export function useEntitlement(key: Entitlement): boolean {
	const { data } = useMySubscription();
	return hasEntitlement(data, key);
}
