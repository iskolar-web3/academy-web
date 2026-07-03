import { Check, X } from "lucide-react";
import { useState } from "react";

/**
 * Membership invitations (STU-08) — where a credited member accepts or declines being shown
 * on someone else's project. This is the FE surface; the real invite feed rides the
 * **notification model (P3)**, so the list here is a static mock and Accept/Decline resolve
 * locally. Renders nothing once there are no pending invites. Static seed → SSR-safe.
 */

interface Invite {
	id: string;
	project: string;
	inviter: string;
	contribution: string;
	cover: string;
}

const SEED: Invite[] = [
	{
		id: "inv1",
		project: "NoteMesh: shared lecture notes",
		inviter: "Marco Dizon",
		contribution: "Backend · Sync engine",
		cover: "#3a52a6",
	},
	{
		id: "inv2",
		project: "CampusRide: student carpool",
		inviter: "Ella Marquez",
		contribution: "ML · Route matching",
		cover: "#607ef2",
	},
];

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

type Status = "pending" | "accepted" | "declined";

export function IncomingInvites() {
	const [status, setStatus] = useState<Record<string, Status>>({});

	const pending = SEED.filter((i) => (status[i.id] ?? "pending") === "pending");
	if (pending.length === 0) return null;

	const respond = (id: string, next: Status) =>
		setStatus((s) => ({ ...s, [id]: next }));

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
							style={{ background: inv.cover }}
						>
							{initialsOf(inv.inviter)}
						</span>
						<div className="min-w-0 flex-1">
							<div className="text-[15px] text-content-heading">
								{inv.project}
							</div>
							<div className="font-mono text-[11.5px] text-content-faint">
								{inv.inviter} invited you · {inv.contribution}
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => respond(inv.id, "declined")}
								className="flex h-9 items-center gap-1.5 rounded-[9px] border border-line bg-surface-card px-3 text-[13px] text-content-muted transition-colors hover:bg-surface-sunken"
							>
								<X className="size-4" aria-hidden /> Decline
							</button>
							<button
								type="button"
								onClick={() => respond(inv.id, "accepted")}
								className="flex h-9 items-center gap-1.5 rounded-[9px] bg-action px-3 text-[13px] text-white transition-colors hover:bg-action-hover"
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
