import { createFileRoute } from "@tanstack/react-router";
import { useMySubscription } from "#/hooks/subscription/useMySubscription";
import { planInfo } from "#/lib/subscription/model";

/** Read-only view of the sponsor's current plan. */
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

	const plan = planInfo(subscription.tier);

	return (
		<main className="mx-auto max-w-[1100px]">
			<h1 className="mb-6 text-[30px] text-action">Sponsor plan</h1>
			<div className="rounded-2xl border border-line bg-surface-card p-6">
				<div className="text-[20px] text-content-heading">{plan.name}</div>
				<p className="mt-1 text-[14px] text-content-soft">{plan.tagline}</p>
			</div>
		</main>
	);
}
