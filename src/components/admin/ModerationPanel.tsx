import { toast } from "sonner";
import { useGrantMutations } from "#/hooks/grant/useGrantMutations";
import { useReviewDecision } from "#/hooks/review/useReviewDecision";
import { formatPeso } from "#/lib/grant/helper";
import type { GrantRequest } from "#/lib/grant/model";
import { projectCover } from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";

/**
 * Moderation (ADM-05/ADM-02) — a 1:1 port of the design-template ADMIN › MODERATION: a
 * Published projects list (Flag / Unpublish) and an Open grant requests list (Cancel
 * request), every action logged server-side. A reason prompt for the cancel action is the
 * one interaction the static template doesn't depict (it just calls the handler directly) —
 * added because "cancel an abusive grant request" needs a reason for the audit log, mirroring
 * why `ReviewDecisionModal`'s return note exists.
 */

export function ModerationPanel({
	projects,
	isLoading,
	isError,
	grants,
	grantsLoading,
	grantsError,
}: {
	projects: Project[];
	isLoading: boolean;
	isError: boolean;
	grants: GrantRequest[];
	grantsLoading: boolean;
	grantsError: boolean;
}) {
	const { moderate } = useReviewDecision();
	const { cancel } = useGrantMutations();

	const act = (id: string, action: "unpublish" | "flag") =>
		moderate.mutate(
			{ id, input: { action } },
			{
				onSuccess: () =>
					toast.success(
						action === "flag" ? "Project flagged" : "Project unpublished",
					),
			},
		);

	const onCancelGrant = (id: string, title: string) => {
		const reason = window.prompt(
			`Reason for cancelling "${title}"? (logged with the action)`,
		);
		if (reason === null) return;
		cancel.mutate(
			{ id, reason },
			{ onSuccess: () => toast.success("Grant request cancelled") },
		);
	};

	return (
		<div>
			<p className="mb-6 text-[15px] text-content-soft">
				Unpublish or flag a published project, or cancel an abusive grant
				request. Every action is logged.
			</p>

			<div className="mb-3 text-[13px] text-content-heading">
				Published projects
			</div>
			{isLoading ? (
				<p className="text-[14px] text-content-soft">Loading…</p>
			) : isError ? (
				<p className="text-[14px] text-danger">
					Couldn’t load published projects.
				</p>
			) : projects.length === 0 ? (
				<p className="mb-8 text-[14px] text-content-soft">
					No published projects yet.
				</p>
			) : (
				<div className="mb-8 flex flex-col gap-3">
					{projects.map((p) => (
						<div
							key={p.id}
							className="flex items-center gap-3.5 rounded-[14px] border border-line bg-surface-card px-[18px] py-3.5"
						>
							<span
								className="size-10 flex-none rounded-[11px]"
								style={{ background: projectCover(p.hue) }}
							/>
							<div className="min-w-0 flex-1">
								<div className="text-[15.5px] text-content-heading">
									{p.title}
								</div>
								<div className="font-mono text-[12px] text-content-faint">
									{p.school || "iSkolar Academy"} ·{" "}
									{p.category || "Uncategorized"}
								</div>
							</div>
							<button
								type="button"
								disabled={moderate.isPending}
								onClick={() => act(p.id, "flag")}
								className="h-9 rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-60"
							>
								⚑ Flag
							</button>
							<button
								type="button"
								disabled={moderate.isPending}
								onClick={() => act(p.id, "unpublish")}
								className="h-9 rounded-[9px] border border-[#f0c9cb] bg-surface-card px-3.5 text-[13px] text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
							>
								Unpublish
							</button>
						</div>
					))}
				</div>
			)}

			<div className="mb-3 text-[13px] text-content-heading">
				Open grant requests
			</div>
			{grantsLoading ? (
				<p className="text-[14px] text-content-soft">Loading…</p>
			) : grantsError ? (
				<p className="text-[14px] text-danger">Couldn't load grant requests.</p>
			) : grants.length === 0 ? (
				<p className="text-[14px] text-content-soft">No open grant requests.</p>
			) : (
				<div className="flex flex-col gap-3">
					{grants.map((g) => (
						<div
							key={g.id}
							className="flex items-center gap-3.5 rounded-[14px] border border-line bg-surface-card px-[18px] py-3.5"
						>
							<div className="min-w-0 flex-1">
								<div className="text-[15.5px] text-content-heading">
									{g.title}
								</div>
								<div className="font-mono text-[12px] text-content-faint">
									{formatPeso(g.raised)} of {formatPeso(g.target)} raised
								</div>
							</div>
							<button
								type="button"
								disabled={cancel.isPending}
								onClick={() => onCancelGrant(g.id, g.title)}
								className="h-9 rounded-[9px] border border-[#f0c9cb] bg-surface-card px-3.5 text-[13px] text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
							>
								Cancel request
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
