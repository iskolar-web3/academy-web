import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type {
	AcademyNotification,
	NotificationTone,
} from "#/lib/notification/model";
import { cn } from "#/lib/utils";

/**
 * Per-type notification renderer — the design-template NOTIFICATIONS PAGE row (42px icon
 * tile · title + unread dot · body · when) and the compact header-dropdown row share this
 * meta map. Glyphs/tones/tile fills are the template's own per-type pairs; the link target
 * mirrors the template's `go` map (a sponsor-interest opens the sponsor's profile — that IS
 * the STU-13 reveal; invites land on the dashboard invites card).
 */

const ICONS: Record<AcademyNotification["type"], string> = {
	sponsor_interest: "»",
	review_decision: "✓", // danger-tone decisions (returned/rejected) render "!" below
	member_invite: "＋",
	upvote_milestone: "♥",
	grant_funded: "₱",
	vault_request: "🔒",
};

const TONE_CLS: Record<NotificationTone, string> = {
	action: "text-action bg-[#eaf0ff]",
	highlight: "text-highlight bg-[#eef3ff]",
	success: "text-success bg-success-bg",
	danger: "text-danger bg-danger-bg",
};

function glyphOf(n: AcademyNotification): string {
	if (n.type === "review_decision" && n.tone === "danger") return "!";
	return ICONS[n.type];
}

/** Template `go` map → route target. Falls back to the notifications page itself. */
function linkOf(n: AcademyNotification): { to: string; params?: object } {
	switch (n.type) {
		case "sponsor_interest":
			return n.actorUserId
				? { to: "/u/$userId", params: { userId: n.actorUserId } }
				: { to: "/student/home" };
		case "upvote_milestone":
			return n.projectId
				? {
						to: "/student/projects/$projectId",
						params: { projectId: n.projectId },
					}
				: { to: "/student/home" };
		case "grant_funded":
			// The template seed links to the specific grant's detail; without a grantId
			// field on the notification, the dashboard's "Grant payouts" list is the next
			// best real target (P4 correction — see the phase doc's Open Items).
			return { to: "/student/home" };
		case "vault_request":
			// Matches the template's own seed exactly: go:{ screen: 'vaults' } (P5).
			return { to: "/student/vaults" };
		case "member_invite":
		case "review_decision":
			return { to: "/student/home" };
	}
}

export function NotificationItem({
	notification: n,
	compact,
	onActivate,
}: {
	notification: AcademyNotification;
	/** Compact = the header-dropdown row (icon · title · when, no body/tile). */
	compact?: boolean;
	onActivate?: () => void;
}) {
	const link = linkOf(n);

	if (compact) {
		return (
			<Link
				to={link.to}
				params={link.params}
				onClick={onActivate}
				className="flex gap-[11px] rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface-sunken"
			>
				<span
					className={cn(
						"flex w-[26px] flex-none justify-center text-[17px] leading-snug",
						TONE_CLS[n.tone].split(" ")[0],
					)}
				>
					{glyphOf(n)}
				</span>
				<div className="min-w-0">
					<div className="text-[13.5px] text-content-strong leading-snug">
						{n.title}
					</div>
					<div className="mt-0.5 font-mono text-[11px] text-content-ghost">
						{n.ageLabel}
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link
			to={link.to}
			params={link.params}
			onClick={onActivate}
			className={cn(
				"flex items-start gap-3.5 border-[#eef1fa] border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-[#f7faff]",
				n.unread && "bg-[#fbfdff]",
			)}
		>
			<span
				className={cn(
					"flex size-[42px] flex-none items-center justify-center rounded-[12px] text-[20px]",
					TONE_CLS[n.tone],
				)}
			>
				{glyphOf(n)}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-[9px]">
					<span className="text-[15.5px] text-content">{n.title}</span>
					{n.unread ? (
						<>
							<span
								className="size-2 flex-none rounded-full bg-action"
								aria-hidden
							/>
							<span className="sr-only">Unread</span>
						</>
					) : null}
				</div>
				<div className="mt-[3px] text-[13.5px] text-content-soft leading-normal">
					{n.body}
				</div>
			</div>
			<span className="flex-none whitespace-nowrap font-mono text-[11.5px] text-content-ghost">
				{n.ageLabel}
			</span>
		</Link>
	);
}

/** Shared empty state for the page + dropdown. */
export function NotificationsEmpty({ children }: { children?: ReactNode }) {
	return (
		<div className="px-5 py-8 text-center text-[13.5px] text-content-soft">
			{children ?? "You're all caught up."}
		</div>
	);
}
