import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	marketingPreferenceQuery,
	updateMarketingPreference,
} from "#/lib/account/api";
import type { MarketingPreferenceEdit } from "#/lib/account/model";

export function useMarketingPreference(accountId: string) {
	const qc = useQueryClient();
	const options = marketingPreferenceQuery(accountId);
	const preference = useQuery(options);
	const update = useMutation({
		mutationFn: (input: MarketingPreferenceEdit) =>
			updateMarketingPreference(input),
		onMutate: async () => {
			await qc.cancelQueries({ queryKey: options.queryKey, exact: true });
		},
		onSuccess: async (saved) => {
			// An older background read must not replace the confirmed write.
			await qc.cancelQueries({ queryKey: options.queryKey, exact: true });
			qc.setQueryData(options.queryKey, saved);
		},
	});
	return { preference, update };
}
