import { useQuery } from "@tanstack/react-query";
import { grantQuery, openGrantsQuery } from "#/lib/grant/api";

/** Grants gallery (SPN-09) — every grant regardless of status, matching the template. */
export function useOpenGrants() {
	return useQuery(openGrantsQuery());
}

/** One grant (gallery detail + fund flow). */
export function useGrant(id: string) {
	return useQuery(grantQuery(id));
}
