import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile } from "#/lib/account/api";
import type { ProfileEdit } from "#/lib/account/model";
import { validateSessionQuery } from "#/lib/auth/api";

/**
 * Mutation for editing own profile (STU-01 / SPN-01). On success it seeds the fresh
 * record into the `me` profile cache and invalidates every profile query + the session
 * (the display-name snapshot on the header may have changed).
 */
export function useUpdateProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: ProfileEdit) => updateMyProfile(input),
		onSuccess: (profile) => {
			qc.setQueryData(["account", "profile", "me"], profile);
			qc.invalidateQueries({ queryKey: ["account", "profile"] });
			qc.invalidateQueries({ queryKey: validateSessionQuery().queryKey });
		},
	});
}
