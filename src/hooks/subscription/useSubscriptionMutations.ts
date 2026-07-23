import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	setAlertsEnabled,
	subscribeToTier,
	updateSeats,
} from "#/lib/subscription/api";
import type { PlanKey } from "#/lib/subscription/model";

/** Subscription mutations (SPN-12/14), each invalidating the subscription cache. */
export function useSubscriptionMutations() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: ["subscription"] });

	const subscribe = useMutation({
		mutationFn: (tier: PlanKey) => subscribeToTier(tier),
		onSuccess: invalidate,
	});

	const setSeats = useMutation({
		mutationFn: (seats: number) => updateSeats(seats),
		onSuccess: invalidate,
	});

	const setAlerts = useMutation({
		mutationFn: (enabled: boolean) => setAlertsEnabled(enabled),
		onSuccess: invalidate,
	});

	return { subscribe, setSeats, setAlerts };
}
