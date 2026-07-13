import { Link } from "@tanstack/react-router";
import { GrantFundPanel } from "#/components/grant/GrantFundPanel";
import { grantProposalUrl } from "#/lib/grant/api";
import { formatPeso, fundingPct, grantStatusMeta } from "#/lib/grant/helper";
import type { GrantRequest } from "#/lib/grant/model";

/**
 * Grant detail + fund flow — a 1:1 port of the design-template GRANT DETAIL + FUND FLOW:
 * a two-column layout (grant info · sticky fund rail). `isSponsor` selects the rail's
 * content — the fund flow for sponsors, a read-only note for everyone else (the template's
 * `isReadOnlyGrant` has no distinct owner branch; the owning student sees the same
 * read-only state as any other non-sponsor viewer).
 */
export function GrantDetailView({
	grant,
	isSponsor,
}: {
	grant: GrantRequest;
	isSponsor: boolean;
}) {
	const status = grantStatusMeta(grant.status);
	const pct = fundingPct(grant.raised, grant.target);
	const barColor = grant.status === "funded" ? "bg-success" : "bg-action";

	return (
		<div className="grid grid-cols-1 items-start gap-[26px] lg:grid-cols-[1.3fr_1fr]">
			{/* left: grant info */}
			<div className="card-surface rounded-[16px] p-7">
				<div className="mb-3.5 flex items-start justify-between gap-3.5">
					<h1 className="text-[28px] leading-tight text-content-heading">
						{grant.title}
					</h1>
					<span
						className={`flex-none rounded-[6px] border px-[9px] py-[3px] font-mono text-[11.5px] ${status.className}`}
					>
						{status.label}
					</span>
				</div>
				<div className="mb-5 flex flex-wrap gap-[7px]">
					{grant.category ? (
						<span className="chip chip--category">{grant.category}</span>
					) : null}
					{grant.tech.map((t) => (
						<span key={t} className="chip chip--tech">
							{t}
						</span>
					))}
				</div>

				<div className="mb-2.5 flex items-center gap-2.5">
					<span className="h-0.5 w-[22px] bg-action/50" aria-hidden />
					<span className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-action/60">
						What it funds
					</span>
				</div>
				<p className="mb-6 text-[16px] leading-relaxed text-content-soft">
					{grant.purpose}
				</p>

				<div className="mb-3 flex items-center gap-2.5">
					<span className="h-0.5 w-[22px] bg-action/50" aria-hidden />
					<span className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-action/60">
						Title proposal
					</span>
				</div>
				{grant.proposalName ? (
					<a
						href={grantProposalUrl(grant.id)}
						target="_blank"
						rel="noreferrer"
						className="mb-2.5 flex items-center gap-3 rounded-[11px] border border-info-bd px-3.5 py-3 text-content-heading transition-colors hover:bg-surface-tint"
					>
						<span className="flex w-6 flex-none items-center justify-center text-[18px] text-action">
							▤
						</span>
						<div className="min-w-0 flex-1">
							<div className="truncate text-[14.5px]">{grant.proposalName}</div>
							<div className="mt-0.5 font-mono text-[11.5px] text-content-faint">
								🔒 Lumen document vault, signed-link access
							</div>
						</div>
						<span className="text-content-faint">↗</span>
					</a>
				) : null}
				<p className="font-mono text-[12.5px] leading-normal text-content-faint">
					Self-declared, no review gate. Contributions are captured through the
					platform and recorded against the target.
				</p>
			</div>

			{/* right: fund flow */}
			<aside className="card-surface sticky top-[84px] rounded-[16px] p-6">
				<div className="mb-[11px] h-[9px] overflow-hidden rounded-full bg-[#eef1fa]">
					<div
						className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
						style={{ width: `${pct}%` }}
					/>
				</div>
				<div className="mb-1 flex items-baseline justify-between">
					<span className="text-[24px] text-content-heading">
						<b>{formatPeso(grant.raised)}</b>
					</span>
					<span className="text-[13px] text-content-faint">{pct}%</span>
				</div>
				<div className="mb-[22px] font-mono text-[13px] text-content-faint">
					of {formatPeso(grant.target)} · {grant.backers} backers · posted{" "}
					{grant.createdDays}d ago
				</div>

				{isSponsor ? (
					<GrantFundPanel grant={grant} />
				) : (
					<div>
						<div className="mb-3.5 flex items-start gap-[11px] rounded-xl border border-info-bd bg-surface-tint p-3.5">
							<span className="flex-none text-[18px]">👁</span>
							<p className="text-[13px] leading-normal text-content-body">
								You're viewing this grant. Funding is handled by sponsors,
								students follow what it funds and track contributions here.
							</p>
						</div>
						<Link
							to="/grants"
							className="btn btn-secondary flex h-[46px] w-full items-center justify-center rounded-xl text-[15px]"
						>
							Back to grants
						</Link>
					</div>
				)}
			</aside>
		</div>
	);
}
