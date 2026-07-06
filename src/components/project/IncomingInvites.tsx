import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useNotificationMutations } from "#/hooks/notification/useNotificationMutations";
import { useNotifications } from "#/hooks/notification/useNotifications";
import { hueFromString, projectCover } from "#/lib/project/helper";

/**
 * Membership invitations (STU-08) — where a credited member accepts or declines being shown
 * on someone else's project. Driven by unread `member_invite` notifications (the P3
 * notification model): `title` = project title, `actorName` = inviter, `body` = the
 * server-rendered invite line. Accept/decline post to the member sub-paths and the card
 * disappears as the notification resolves. Renders nothing when no invites are pending.
 */

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

export function IncomingInvites() {
	const { data } = useNotifications();
	const { accept, decline } = useNotificationMutations();

	const pending = (data ?? []).filter(
		(n) => n.type === "member_invite" && n.unread && n.projectId && n.memberId,
	);
	if (pending.length === 0) return null;

	const busy = accept.isPending || decline.isPending;

	const respond = (
		projectId: string,
		memberId: string,
		action: "accept" | "decline",
	) => {
		const vars = { projectId, memberId };
		const opts = {
			onSuccess: () =>
				toast.success(
					action === "accept" ? "Invitation accepted" : "Invitation declined",
				),
			onError: (err: Error) =>
				toast.error(err.message || "Something went wrong."),
		};
		if (action === "accept") accept.mutate(vars, opts);
		else decline.mutate(vars, opts);
	};

	return (
		<div className="mb-6 rounded-[18px] border border-line bg-surface-card p-[18px]">
			<div className="mb-3.5 flex items-center justify-between">
				<span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60">
					Membership invitations
				</span>
				<span className="font-mono text-[11.5px] text-content-faint">
					{pending.length} pending
				</span>
			</div>
			<div className="flex flex-col gap-3">
				{pending.map((inv) => (
					<div
						key={inv.id}
						className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#eef1fa] px-3.5 py-3"
					>
						<span
							className="flex size-[38px] flex-none items-center justify-center rounded-[11px] text-[12px] text-white"
							style={{ background: projectCover(hueFromString(inv.title)) }}
						>
							{initialsOf(inv.actorName ?? inv.title)}
						</span>
						<div className="min-w-0 flex-1">
							<div className="text-[15px] text-content-heading">
								{inv.title}
							</div>
							<div className="font-mono text-[11.5px] text-content-faint">
								{inv.body}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={busy}
								onClick={() =>
									respond(
										inv.projectId as string,
										inv.memberId as string,
										"decline",
									)
								}
								className="flex h-9 items-center gap-1.5 rounded-[9px] border border-line bg-surface-card px-3 text-[13px] text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-60"
							>
								<X className="size-4" aria-hidden /> Decline
							</button>
							<button
								type="button"
								disabled={busy}
								onClick={() =>
									respond(
										inv.projectId as string,
										inv.memberId as string,
										"accept",
									)
								}
								className="flex h-9 items-center gap-1.5 rounded-[9px] bg-action px-3 text-[13px] text-white transition-colors hover:bg-action-hover disabled:opacity-60"
							>
								<Check className="size-4" aria-hidden /> Accept
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
