import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSponsorProfile, updateStudentProfile } from "#/lib/account/api";
import type {
	SponsorProfileEdit,
	StudentProfileEdit,
} from "#/lib/account/model";

/** Mutation for editing own student profile (STU-01). */
export function useUpdateStudentProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: StudentProfileEdit) => updateStudentProfile(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "profile"] }),
	});
}

/** Mutation for editing own sponsor profile (SPN-01). */
export function useUpdateSponsorProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: SponsorProfileEdit) => updateSponsorProfile(input),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "profile"] }),
	});
}
