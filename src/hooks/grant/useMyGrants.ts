import { useQuery } from "@tanstack/react-query";
import { myGrantsQuery } from "#/lib/grant/api";

/** The signed-in student's own grant requests (student dashboard "Grant payouts"). */
export function useMyGrants() {
	return useQuery(myGrantsQuery());
}
