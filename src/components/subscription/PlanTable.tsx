import { useState } from "react";
import { toast } from "sonner";
import { TierConfirmModal } from "#/components/subscription/TierConfirmModal";
import { useSubscriptionMutations } from "#/hooks/subscription/useSubscriptionMutations";
import {
	PLANS,
	type PlanInfo,
	type Subscription,
} from "#/lib/subscription/model";

/**
 * Tier comparison + subscribe (SPN-12) — a 1:1 port of the design-template
 * SUBSCRIPTION & BILLING tier cards. Free (Scout) switches are direct, no checkout
 * ceremony; paid tiers (Alpha) open `TierConfirmModal`'s simulated checkout; the
 * contact-sales tier (Venture Partner) has no self-serve action at all.
 */
export function PlanTable({ subscription }: { subscription: Subscription }) {
	const [confirming, setConfirming] = useState<PlanInfo | null>(null);
	const { subscribe } = useSubscriptionMutations();

	const onCta = (p: PlanInfo) => {
		if (p.key === subscription.tier) return;
		if (!p.selfServe) {
			toast.success(`Sales will reach out about ${p.name}.`);
			return;
		}
		if (p.price === "Free") {
			subscribe.mutate(p.key, {
				onSuccess: () => toast.success(`Switched to ${p.name}`),
			});
			return;
		}
		setConfirming(p);
	};

	const ctaLabel = (p: PlanInfo): string => {
		if (p.key === subscription.tier) return "Current plan";
		if (!p.selfServe) return "Contact sales";
		if (p.price === "Free") return "Switch to Scout";
		return `Upgrade to ${p.name}`;
	};

	return (
		<>
			<div className="mb-[30px] grid gap-[18px] md:grid-cols-3">
				{PLANS.map((p) => {
					const current = p.key === subscription.tier;
					return (
						<div
							key={p.key}
							className={`rounded-2xl border bg-surface-card p-[22px] ${
								current ? "border-action shadow-card" : "border-line"
							}`}
						>
							{current ? (
								<span className="mb-3 inline-block rounded-full bg-action px-2.5 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.12em] text-white">
									Current plan
								</span>
							) : null}
							<div className="text-[20px] text-content-heading">{p.name}</div>
							<div className="mt-0.5 mb-1 text-[13px] text-content-faint">
								{p.tagline}
							</div>
							<div className="my-2.5 font-mono text-[22px] text-action">
								{p.price}
							</div>
							<div className="mb-[18px] flex flex-col gap-2.5">
								{p.features.map((f) => (
									<div
										key={f}
										className="flex items-start gap-2 text-[13px] text-content-strong"
									>
										<span className="mt-0.5 text-success">✓</span>
										{f}
									</div>
								))}
							</div>
							<button
								type="button"
								disabled={current || subscribe.isPending}
								onClick={() => onCta(p)}
								className={`h-[42px] w-full rounded-[11px] text-[14px] transition-colors ${
									current
										? "cursor-default border border-line bg-surface-card text-content-ghost"
										: "bg-action text-white hover:bg-action-hover disabled:opacity-60"
								}`}
							>
								{ctaLabel(p)}
							</button>
						</div>
					);
				})}
			</div>

			{confirming ? (
				<TierConfirmModal
					plan={confirming}
					onClose={() => setConfirming(null)}
				/>
			) : null}
		</>
	);
}
