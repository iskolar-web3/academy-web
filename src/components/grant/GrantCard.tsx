import { Link } from "@tanstack/react-router";
import { formatPeso, fundingPct, grantStatusMeta } from "#/lib/grant/helper";
import type { GrantRequest } from "#/lib/grant/model";

/**
 * Grants gallery card — a 1:1 port of the design-template GRANTS GALLERY card: title +
 * status badge, category/tech chips, purpose, funding progress bar, raised/target +
 * backers/age line, and a "View grant →" button. The whole card opens the grant detail
 * (funding itself happens there, not from the gallery).
 */
export function GrantCard({ grant }: { grant: GrantRequest }) {
	const status = grantStatusMeta(grant.status);
	const pct = fundingPct(grant.raised, grant.target);
	const barColor = grant.status === "funded" ? "bg-success" : "bg-action";

	return (
		<Link
			to="/grants/$grantId"
			params={{ grantId: grant.id }}
			className="card-surface flex flex-col rounded-[15px] p-[22px] transition-transform hover:-translate-y-1"
		>
			<div className="mb-3 flex items-start justify-between gap-3.5">
				<span className="text-[20px] leading-tight text-content-heading">
					{grant.title}
				</span>
				<span
					className={`flex-none rounded-[6px] border px-[9px] py-[3px] font-mono text-[11.5px] ${status.className}`}
				>
					{status.label}
				</span>
			</div>

			<div className="mb-3.5 flex flex-wrap gap-[7px]">
				{grant.category ? (
					<span className="chip chip--category">{grant.category}</span>
				) : null}
				{grant.tech.map((t) => (
					<span key={t} className="chip chip--tech">
						{t}
					</span>
				))}
			</div>

			<p className="mb-[18px] flex-1 text-[14px] leading-normal text-content-soft">
				{grant.purpose}
			</p>

			<div className="mb-[10px] h-[9px] overflow-hidden rounded-full bg-[#eef1fa]">
				<div
					className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<div className="mb-4 flex items-center justify-between">
				<span className="text-[15px] text-content-heading">
					<b>{formatPeso(grant.raised)}</b>{" "}
					<span className="text-[13px] text-content-faint">
						of {formatPeso(grant.target)}
					</span>
				</span>
				<span className="font-mono text-[12.5px] text-content-faint">
					{grant.backers} backers · posted {grant.createdDays}d ago
				</span>
			</div>

			<span className="btn btn-primary flex h-11 items-center justify-center rounded-[10px] text-[15px]">
				View grant →
			</span>
		</Link>
	);
}
