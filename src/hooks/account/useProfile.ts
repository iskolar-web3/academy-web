import { useQuery } from "@tanstack/react-query";
import { myProfileQuery, profileQuery } from "#/lib/account/api";

/** Query a public profile by user id (STU-02 / SPN-02). */
export function useProfile(userId: string) {
	return useQuery(profileQuery(userId));
}

/** Query the signed-in user's own profile (prefills the edit form + account header). */
export function useMyProfile() {
	return useQuery(myProfileQuery());
}
