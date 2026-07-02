import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createDraft,
	deleteDraft,
	resubmitProject,
	submitProject,
	updateProject,
	withdrawProject,
} from "#/lib/project/api";
import type { ProjectInput } from "#/lib/project/model";

/**
 * All project lifecycle mutations (STU-03/09/10/11), each invalidating the project cache
 * so the dashboard + detail views refresh.
 */
export function useProjectMutations() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: ["project"] });

	const create = useMutation({
		mutationFn: (input: ProjectInput) => createDraft(input),
		onSuccess: invalidate,
	});

	const update = useMutation({
		mutationFn: (vars: { id: string; input: ProjectInput }) =>
			updateProject(vars.id, vars.input),
		onSuccess: invalidate,
	});

	const submit = useMutation({
		mutationFn: (id: string) => submitProject(id),
		onSuccess: invalidate,
	});

	const resubmit = useMutation({
		mutationFn: (id: string) => resubmitProject(id),
		onSuccess: invalidate,
	});

	const withdraw = useMutation({
		mutationFn: (id: string) => withdrawProject(id),
		onSuccess: invalidate,
	});

	const remove = useMutation({
		mutationFn: (id: string) => deleteDraft(id),
		onSuccess: invalidate,
	});

	return { create, update, submit, resubmit, withdraw, remove };
}
