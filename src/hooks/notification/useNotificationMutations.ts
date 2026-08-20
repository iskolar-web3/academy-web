import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	acceptInvite,
	declineInvite,
	markAllRead,
	markRead,
} from "#/lib/notification/api";

/**
 * Notification mutations — read-state (PLT-07) and invite responses (STU-08). Invite
 * responses also invalidate the project cache: accepting flips the member's consent on
 * the owning project.
 */
export function useNotificationMutations() {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: ["notification"] });

	const read = useMutation({
		mutationFn: (id: string) => markRead(id),
		onSuccess: invalidate,
	});

	const readAll = useMutation({
		mutationFn: () => markAllRead(),
		onSuccess: invalidate,
	});

	const accept = useMutation({
		mutationFn: (vars: { projectId: string; memberId: string }) =>
			acceptInvite(vars.projectId, vars.memberId),
		onSuccess: () => {
			invalidate();
			qc.invalidateQueries({ queryKey: ["project"] });
		},
	});

	const decline = useMutation({
		mutationFn: (vars: { projectId: string; memberId: string }) =>
			declineInvite(vars.projectId, vars.memberId),
		onSuccess: () => {
			invalidate();
			qc.invalidateQueries({ queryKey: ["project"] });
		},
	});

	return { read, readAll, accept, decline };
}
