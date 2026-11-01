import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	adminGrantsQuery,
	createAdminGrant,
	studentSearchQuery,
} from "#/lib/grant/api";
import type { AdminGrantInput } from "#/lib/grant/model";

/** Admin grant list + funding totals. */
export function useAdminGrants() {
	return useQuery(adminGrantsQuery());
}

/** Add Grant student picker. Disabled until the query has 2+ characters. */
export function useStudentSearch(q: string) {
	return useQuery(studentSearchQuery(q));
}

/** Admin "Add Grant" create. Invalidates every grant query (gallery + admin list). */
export function useCreateAdminGrant() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (vars: { input: AdminGrantInput; file: File }) =>
			createAdminGrant(vars.input, vars.file),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["grant"] }),
	});
}
