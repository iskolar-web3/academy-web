import { Check, X } from "lucide-react";
import { useNotificationMutations } from "#/hooks/notification/useNotificationMutations";
import { useNotifications } from "#/hooks/notification/useNotifications";
import { isPendingInvite } from "#/lib/notification/model";
import { hueFromString, projectCover } from "#/lib/project/helper";
import { toast } from "#/lib/toast";

/**
 * Membership invitations (STU-08) — where a credited member accepts or declines being shown
 * on someone else's project. Driven by `member_invite` notifications whose member is still
 * `pending` (`isPendingInvite` — NOT the read flag, so opening the notification keeps the
 * invite answerable): `title` = project title, `actorName` = inviter, `body` = the
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

/**
 * Accept / Decline buttons for one invite — shared by the dashboard card and the
 * notification rows (header dropdown + notifications page), so an invite is answerable
 * wherever the invitee sees it.
 */
export function InviteActions({
	projectId,
	memberId,
	size = "md",
}: {
	projectId: string;
	memberId: string;
	size?: "sm" | "md";
}) {
	const { accept, decline } = useNotificationMutations();
	const busy = accept.isPending || decline.isPending;

	const respond = (action: "accept" | "decline") => {
		const vars = { projectId, memberId };
		const opts = {
			onSuccess: () =>
				toast.success(
					action === "accept" ? "Invitation accepted" : "Invitation declined",
				),
			onError: (err: Error) =>
				toast.error(err.message || "Something went wrong."),
		};
		if (action === "accept") {
			accept.mutate(vars, opts);
		} else {
			decline.mutate(vars, opts);
		}
	};

	const h = size === "sm" ? "h-8 text-[12.5px]" : "h-9 text-[13px]";

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				disabled={busy}
				onClick={() => respond("decline")}
				className={`flex ${h} items-center gap-1.5 rounded-[9px] border border-line bg-surface-card px-3 text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-60`}
			>
				<X className="size-4" aria-hidden /> Decline
			</button>
			<button
				type="button"
				disabled={busy}
				onClick={() => respond("accept")}
				className={`flex ${h} items-center gap-1.5 rounded-[9px] bg-action px-3 text-white transition-colors hover:bg-action-hover disabled:opacity-60`}
			>
				<Check className="size-4" aria-hidden /> Accept
			</button>
		</div>
	);
}

export function IncomingInvites() {
	const { data } = useNotifications();

	// One card per member row (a resend may leave an older notification behind).
	const seen = new Set<string>();
	const pending = (data ?? []).filter(isPendingInvite).filter((n) => {
		if (seen.has(n.memberId)) {
			return false;
		}
		seen.add(n.memberId);
		return true;
	});
	if (pending.length === 0) {
		return null;
	}

	return (
		<div
			id="invites"
			className="mb-6 scroll-mt-24 rounded-[18px] border border-line bg-surface-card p-[18px]"
		>
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
						<InviteActions projectId={inv.projectId} memberId={inv.memberId} />
					</div>
				))}
			</div>
		</div>
	);
}
