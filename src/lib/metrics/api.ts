import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import {
	type PlatformMetrics,
	platformMetricsSchema,
} from "#/lib/review/model";

/**
 * Metrics API (ADM-06) — a single counts read for the admin Metrics tab. Admin-only on the
 * server. Counts only, no time-series (FR-AD5); the two bar charts in the tab are illustrative
 * until P4 (grants funded) / P5 (sponsor MRR) supply real data.
 */

/** Platform count cards. `GET /admin/metrics`. */
export function platformMetricsQuery() {
	return queryOptions({
		queryKey: ["metrics", "platform"] as const,
		queryFn: async (): Promise<PlatformMetrics> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/admin/metrics");
			return platformMetricsSchema.parse(res.data);
		},
	});
}
