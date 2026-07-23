import { createFileRoute, Link } from "@tanstack/react-router";
import { PlanTable } from "#/components/subscription/PlanTable";
import { SeatManager } from "#/components/subscription/SeatManager";
import { useMySubscription } from "#/hooks/subscription/useMySubscription";

/**
 * Subscription & billing (SPN-12) — a 1:1 port of the design-template
 * SUBSCRIPTION & BILLING: tier cards, seats, invoices. Real data from day one (P5) — the
 * plan is a real `subscription` row, not local component state; the simulated-checkout
 * pattern lives in `PlanTable`/`TierConfirmModal`. Invoices stay empty: no recurring
 * billing cycle runs in simulated mode (see `next-steps-lumen-p4-p5.md`) — that's the
 * PayMongo pass, not this phase.
 */
export const Route = createFileRoute("/sponsor/subscription")({
	component: Subscription,
});

function Subscription() {
	const { data: subscription, isLoading, isError } = useMySubscription();

	if (isLoading) {
		return (
			<p className="py-10 text-center text-[14px] text-content-soft">
				Loading plan…
			</p>
		);
	}

	if (isError || !subscription) {
		return (
			<p className="py-10 text-center text-[14px] text-danger">
				Couldn't load your subscription.
			</p>
		);
	}

	const paid = subscription.tier !== "scout";

	return (
		<main className="mx-auto max-w-[1100px]">
			<h1 className="mb-1.5 text-[30px] text-action">
				Subscription &amp; billing
			</h1>
			<p className="mb-7 max-w-[620px] text-[15px] leading-[1.55] text-content-muted">
				Students never pay. Sponsor tiers unlock deal-flow tooling; billing runs
				through PayMongo with every charge written to the ledger.
			</p>

			<PlanTable subscription={subscription} />

			{paid ? (
				<>
					<SeatManager subscription={subscription} />
					<div className="mb-3 text-[13px] text-content-heading">Invoices</div>
					<div className="rounded-2xl border border-line bg-surface-card p-6 text-center">
						<p className="text-[14px] text-content-soft">
							No invoices yet — billing starts once real payments are live.
						</p>
					</div>
				</>
			) : (
				<div className="rounded-2xl border border-line bg-surface-card p-6 text-center">
					<p className="text-[15px] text-content-heading">
						You're on the free Scout tier.
					</p>
					<p className="mt-1 text-[13.5px] text-content-soft">
						Upgrade any time to unlock deal-flow tooling — or{" "}
						<Link to="/sponsor/home" className="text-action">
							continue to Deal-flow →
						</Link>
					</p>
				</div>
			)}
		</main>
	);
}
