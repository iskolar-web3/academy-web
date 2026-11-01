import { useState } from "react";
import { ConfirmActionDialog } from "#/components/ui/ConfirmActionDialog";
import { useAdminGrants } from "#/hooks/grant/useAdminGrants";
import { useGrantMutations } from "#/hooks/grant/useGrantMutations";
import { formatPeso, fundingPct, grantStatusMeta } from "#/lib/grant/helper";
import type { AdminGrant } from "#/lib/grant/model";
import { toast } from "#/lib/toast";
import { cn } from "#/lib/utils";

/**
 * Admin grant list: every grant with its status and funding volume, plus totals. Cancel
 * needs a reason (ConfirmActionDialog blocks a blank one; the server enforces it too) and
 * marks the grant cancelled. Nothing is deleted. Student identity is name + school only.
 */
export function AdminGrantsPanel() {
	const list = useAdminGrants();
	const { cancel } = useGrantMutations();
	const [toCancel, setToCancel] = useState<AdminGrant | null>(null);

	const onCancel = (reason: string) => {
		if (!toCancel) {
			return;
		}
		cancel.mutate(
			{ id: toCancel.id, reason },
			{
				onSuccess: () => {
					toast.success("Grant cancelled");
					setToCancel(null);
				},
				onError: (error) => toast.error(error.message),
			},
		);
	};

	if (list.isLoading) {
		return <p className="text-[14px] text-content-soft">Loading…</p>;
	}
	if (list.isError || !list.data) {
		return <p className="text-[14px] text-danger">Couldn't load grants.</p>;
	}

	const { grants, totals } = list.data;

	return (
		<div>
			<div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Grants", value: totals.count.toLocaleString("en-US") },
					{
						label: "Open",
						value: totals.byStatus.open.toLocaleString("en-US"),
					},
					{ label: "Goal total", value: formatPeso(totals.targetTotal) },
					{ label: "Raised total", value: formatPeso(totals.raisedTotal) },
				].map((s) => (
					<div
						key={s.label}
						className="rounded-[14px] border border-line bg-surface-card px-4 py-3"
					>
						<div className="font-mono text-[11px] uppercase tracking-[0.14em] text-content-faint">
							{s.label}
						</div>
						<div className="mt-1 text-[18px] text-content-heading">
							{s.value}
						</div>
					</div>
				))}
			</div>

			{grants.length === 0 ? (
				<p className="text-[14px] text-content-soft">No grants yet.</p>
			) : (
				<div className="flex flex-col gap-3">
					{grants.map((g) => {
						const meta = grantStatusMeta(g.status);
						return (
							<div
								key={g.id}
								className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface-card px-[18px] py-3.5 sm:flex-row sm:items-center"
							>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-[15.5px] text-content-heading">
											{g.title}
										</span>
										<span
											className={cn(
												"rounded-[6px] border px-2 py-0.5 font-mono text-[11px]",
												meta.className,
											)}
										>
											{meta.label}
										</span>
										{g.createdByAdmin ? (
											<span className="rounded-[6px] border border-line px-2 py-0.5 font-mono text-[11px] text-content-faint">
												Admin-created
											</span>
										) : null}
									</div>
									<div className="font-mono text-[12px] text-content-faint">
										{g.studentName || "Unnamed student"}
										{g.school ? `, ${g.school}` : ""}
									</div>
									<div className="mt-1 font-mono text-[12px] text-content-muted">
										{formatPeso(g.raised)} of {formatPeso(g.target)} (
										{fundingPct(g.raised, g.target)}%), {g.backers}{" "}
										{g.backers === 1 ? "backer" : "backers"}
									</div>
									{g.adminNote ? (
										<div className="mt-1.5 text-[12.5px] text-content-soft">
											<span className="font-mono text-[11px] uppercase tracking-[0.12em] text-content-faint">
												Internal note:
											</span>{" "}
											{g.adminNote}
										</div>
									) : null}
									{g.status === "cancelled" && g.cancelReason ? (
										<div className="mt-1.5 text-[12.5px] text-danger">
											Cancelled: {g.cancelReason}
										</div>
									) : null}
								</div>
								{g.status === "open" ? (
									<button
										type="button"
										disabled={cancel.isPending}
										onClick={() => setToCancel(g)}
										className="h-9 flex-none rounded-[9px] border border-[#f0c9cb] bg-surface-card px-3.5 text-[13px] text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
									>
										Cancel
									</button>
								) : null}
							</div>
						);
					})}
				</div>
			)}

			<ConfirmActionDialog
				open={toCancel !== null}
				onClose={() => setToCancel(null)}
				title="Cancel grant"
				description={`Cancel “${toCancel?.title ?? ""}”? It stays on record as cancelled, and the reason is written to the audit log.`}
				reasonLabel="Reason for cancellation"
				confirmLabel="Cancel grant"
				busy={cancel.isPending}
				onConfirm={onCancel}
			/>
		</div>
	);
}
