import { Link } from "@tanstack/react-router";
import { useWatchlist } from "#/hooks/saved-search/useWatchlist";
import { useMySubscription } from "#/hooks/subscription/useMySubscription";
import { planInfo } from "#/lib/subscription/model";

const cardCls = "rounded-2xl border border-line bg-surface-card p-[18px]";
const eyebrowCls =
	"mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60";

const REVIEW_SIGNALS = [
	"Live demo opens and explains the product",
	"Public repository has clear project context",
	"Ownership and team credits are declared",
	"Recent work has a clear next step",
];

/** Sponsor sidebar with real account data and evidence-based review guidance. */
export function SponsorEvidenceRail() {
	const { data: subscription } = useMySubscription();
	const { data: watchIds = [] } = useWatchlist();
	const tier = subscription ? planInfo(subscription.tier) : null;

	return (
		<aside className="hidden w-full flex-col gap-4 lg:sticky lg:top-[88px] lg:flex">
			<div className={cardCls}>
				<div className="flex items-center justify-between">
					<span className="text-[13.5px] text-content-muted">Watchlist</span>
					<span className="text-[15px] text-action">{watchIds.length}</span>
				</div>
			</div>

			<div className={cardCls}>
				<div className={eyebrowCls}>Review signals</div>
				<p className="mb-3 text-[13px] leading-relaxed text-content-soft">
					Start with evidence, then decide whether the project is a fit.
				</p>
				<div className="flex flex-col gap-2">
					{REVIEW_SIGNALS.map((signal) => (
						<div
							key={signal}
							className="border-line border-b pb-2 text-[12.5px] leading-snug text-content-muted last:border-b-0 last:pb-0"
						>
							{signal}
						</div>
					))}
				</div>
			</div>

			<Link
				to="/sponsor/subscription"
				className={`${cardCls} block transition-colors hover:border-action`}
			>
				<div className="mb-2 flex items-center justify-between">
					<span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60">
						Plan - {tier?.name ?? "..."}
					</span>
					<span className="text-[12px] text-action">Manage</span>
				</div>
				<div className="text-[14px] text-content-heading">
					{tier?.tagline ?? ""}
				</div>
			</Link>
		</aside>
	);
}
