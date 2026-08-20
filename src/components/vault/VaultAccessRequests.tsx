import { useDecideVaultAccess } from "#/hooks/vault/useVaultAccess";
import type { VaultAccessRequest } from "#/lib/vault/model";

const STATUS_META: Record<
	VaultAccessRequest["status"],
	{ label: string; className: string }
> = {
	requested: {
		label: "Requested",
		className: "text-action bg-surface-tint border-info-bd",
	},
	approved: {
		label: "Approved · expires in 14d",
		className: "text-success bg-success-bg border-success-bd",
	},
	denied: {
		label: "Denied",
		className: "text-danger bg-danger-bg border-danger-bd",
	},
	revoked: {
		label: "Revoked",
		className: "text-content-soft bg-neutral-bg border-neutral-bd",
	},
};

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return parts
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");
}

/**
 * "Access requests" (STU-18) — a 1:1 port of the design-template STUDENT VAULTS right
 * column: pending requests get Deny/Approve (14-day grant, per the template's own
 * "Approve (14d)" button — not a guess); approved ones get Revoke.
 */
export function VaultAccessRequests({
	requests,
}: {
	requests: VaultAccessRequest[];
}) {
	const decide = useDecideVaultAccess();

	if (requests.length === 0) {
		return (
			<div className="card-surface p-8 text-center">
				<p className="text-content-heading">No access requests</p>
				<p className="mt-1.5 text-[14px] text-content-soft">
					Sponsor requests to your vaults will show up here.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3.5">
			{requests.map((r) => {
				const meta = STATUS_META[r.status];
				return (
					<div key={r.id} className="card-surface rounded-2xl p-[18px]">
						<div className="mb-3 flex items-center gap-3">
							<span className="flex size-[38px] flex-none items-center justify-center rounded-[11px] bg-action text-[12px] text-white">
								{initialsOf(r.sponsorName)}
							</span>
							<div className="min-w-0 flex-1">
								<div className="text-[15px] text-content-heading">
									{r.sponsorName}
								</div>
								<div className="font-mono text-[11.5px] text-content-faint">
									{r.sponsorKind} · wants {r.projectTitle} ·{" "}
									{r.requestedDaysAgo}d ago
								</div>
							</div>
						</div>
						<div className="flex items-center justify-between gap-2.5">
							<span
								className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${meta.className}`}
							>
								{meta.label}
							</span>
							<div className="flex gap-2">
								{r.status === "requested" ? (
									<>
										<button
											type="button"
											disabled={decide.isPending}
											onClick={() =>
												decide.mutate({ requestId: r.id, decision: "deny" })
											}
											className="h-[34px] rounded-[9px] border border-line bg-surface-card px-3.5 text-[12.5px] text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-60"
										>
											Deny
										</button>
										<button
											type="button"
											disabled={decide.isPending}
											onClick={() =>
												decide.mutate({ requestId: r.id, decision: "approve" })
											}
											className="btn btn-primary h-[34px] rounded-[9px] px-3.5 text-[12.5px] disabled:opacity-60"
										>
											Approve (14d)
										</button>
									</>
								) : null}
								{r.status === "approved" ? (
									<button
										type="button"
										disabled={decide.isPending}
										onClick={() =>
											decide.mutate({ requestId: r.id, decision: "revoke" })
										}
										className="h-[34px] rounded-[9px] border border-[#f0c9cb] bg-surface-card px-3.5 text-[12.5px] text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
									>
										Revoke
									</button>
								) : null}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
