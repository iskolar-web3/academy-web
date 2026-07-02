import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "#/lib/account/api";

/** Query a profile by user id (STU-02 / SPN-02). Errors until the API is wired. */
export function useProfile(userId: string) {
	return useQuery(profileQuery(userId));
}
