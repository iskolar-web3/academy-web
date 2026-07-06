import { useQuery } from "@tanstack/react-query";
import { platformMetricsQuery } from "#/lib/metrics/api";

/** Platform count cards for the admin Metrics tab (ADM-06). */
export function usePlatformMetrics() {
	return useQuery(platformMetricsQuery());
}
