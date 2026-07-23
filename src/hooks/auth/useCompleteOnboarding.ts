import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "#/lib/account/api";
import type { OnboardingInput } from "#/lib/account/model";
import { validateSessionQuery } from "#/lib/auth/api";

/**
 * Submit the basic-info onboarding step. On success it writes the updated
 * `academy_user` straight into the session cache so the guard re-evaluates
 * (onboardingCompleted → true) and the caller can route into the role area.
 */
export function useCompleteOnboarding() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: OnboardingInput) => completeOnboarding(input),
		onSuccess: (user) => {
			qc.setQueryData(validateSessionQuery().queryKey, user);
		},
	});
}
