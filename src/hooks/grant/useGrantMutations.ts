import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	cancelGrantRequest,
	createGrantRequest,
	fundGrant,
} from "#/lib/grant/api";
import type { GrantInput } from "#/lib/grant/model";

/** Grant lifecycle mutations (STU-14, SPN-10, ADM-02), each invalidating the grant cache. */
export function useGrantMutations() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: ["grant"] });

	const create = useMutation({
		mutationFn: (vars: { input: GrantInput; file: File }) =>
			createGrantRequest(vars.input, vars.file),
		onSuccess: invalidate,
	});

	const fund = useMutation({
		mutationFn: (vars: { id: string; amount: number; reason: string }) =>
			fundGrant(vars.id, { amount: vars.amount, reason: vars.reason }),
		onSuccess: invalidate,
	});

	const cancel = useMutation({
		mutationFn: (vars: { id: string; reason: string }) =>
			cancelGrantRequest(vars.id, vars.reason),
		onSuccess: invalidate,
	});

	return { create, fund, cancel };
}
