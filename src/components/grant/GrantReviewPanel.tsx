import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	type LucideIcon,
} from "lucide-react";
import type { GrantRequest } from "#/lib/grant/model";
import {
	buildGrantChecks,
	type GrantCheck,
	type GrantCheckStatus,
	summarizeGrantChecks,
} from "#/lib/grant/reviewChecks";

const STATUS_META: Record<
	GrantCheckStatus,
	{
		Icon: LucideIcon;
		label: string;
		rowClass: string;
		iconClass: string;
		pillClass: string;
	}
> = {
	pass: {
		Icon: CheckCircle2,
		label: "Accepted",
		rowClass: "border-success-bd bg-success-bg/55",
		iconClass: "text-success",
		pillClass: "status-pill--success",
	},
	pending: {
		Icon: Clock3,
		label: "Awaiting review",
		rowClass: "border-info-bd bg-info-bg/65",
		iconClass: "text-action",
		pillClass: "status-pill--info",
	},
	attention: {
		Icon: AlertTriangle,
		label: "Needs action",
		rowClass: "border-warning-bd bg-warning-bg/70",
		iconClass: "text-warning",
		pillClass: "status-pill--warning",
	},
};

function GrantCheckRow({ check }: { check: GrantCheck }) {
	const meta = STATUS_META[check.status];
	const Icon = meta.Icon;

	return (
		<div
			className={`flex items-start gap-2.5 rounded-[10px] border px-3 py-2.5 ${meta.rowClass}`}
		>
			<Icon className={`mt-0.5 size-4 flex-none ${meta.iconClass}`} />
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-[13.5px] text-content-heading">
						{check.label}
					</span>
					<span
						className={`status-pill px-2 py-[2px] text-[10.5px] ${meta.pillClass}`}
					>
						{meta.label}
					</span>
				</div>
				<p className="mt-1 text-[12.5px] leading-snug text-content-soft">
					{check.evidence}
				</p>
			</div>
		</div>
	);
}

export function GrantReviewPanel({
	grant,
	limit,
	title = "Research checks",
}: {
	grant: GrantRequest;
	limit?: number;
	title?: string;
}) {
	const checks = buildGrantChecks(grant);
	const summary = summarizeGrantChecks(checks);
	const visibleChecks =
		typeof limit === "number" ? checks.slice(0, limit) : checks;

	return (
		<div className="rounded-[13px] border border-line bg-surface-sunken/60 p-3.5">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div>
					<div className="font-mono text-[11px] uppercase tracking-[0.16em] text-action/60">
						{title}
					</div>
					<div className="mt-1 text-[13px] text-content-soft">
						{summary.pass} accepted / {summary.pending} awaiting review /{" "}
						{summary.attention} needs action
					</div>
				</div>
				<span
					className={`status-pill text-[11px] ${
						summary.attention
							? "status-pill--warning"
							: summary.pending
								? "status-pill--info"
								: "status-pill--success"
					}`}
				>
					{summary.label}
				</span>
			</div>
			<div className="grid gap-2">
				{visibleChecks.map((check) => (
					<GrantCheckRow key={check.id} check={check} />
				))}
			</div>
			<p className="mt-3 text-[11.5px] leading-relaxed text-content-faint">
				These are document signals and routing notes. They are not automatic
				funding decisions.
			</p>
		</div>
	);
}

export function GrantEvidenceChips({
	grant,
	max = 3,
}: {
	grant: GrantRequest;
	max?: number;
}) {
	const checks = buildGrantChecks(grant)
		.filter((check) =>
			["proposal", "structure", "institution", "citations", "ethics"].includes(
				check.id,
			),
		)
		.slice(0, max);

	return (
		<div className="flex flex-wrap gap-1.5">
			{checks.map((check) => {
				const meta = STATUS_META[check.status];
				const Icon = meta.Icon;
				return (
					<span
						key={check.id}
						title={check.evidence}
						className={`status-pill px-2.5 py-[3px] text-[10.5px] ${meta.pillClass}`}
					>
						<Icon className="size-3.5" aria-hidden />
						{check.label}
					</span>
				);
			})}
		</div>
	);
}
