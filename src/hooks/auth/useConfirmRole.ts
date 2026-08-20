import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmRole } from "#/lib/account/api";
import type { RoleConfirmInput } from "#/lib/account/model";
import { validateSessionQuery } from "#/lib/auth/api";

/**
 * Confirm the seeded role at onboarding (PLT-04). On success it writes the updated
 * `academy_user` straight into the session cache so the `_onboarding` guard re-evaluates
 * (roleConfirmed → true) and the caller can route into the role area immediately.
 */
export function useConfirmRole() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: RoleConfirmInput) => confirmRole(input),
		onSuccess: (user) => {
			qc.setQueryData(validateSessionQuery().queryKey, user);
		},
	});
}
