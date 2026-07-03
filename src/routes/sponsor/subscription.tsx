import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";

/**
 * Subscription & billing (design-template SUBSCRIPTION & BILLING) — the sponsor tier
 * picker + payment page, and the destination of sponsor onboarding (a sponsor lands here
 * after confirming their role). Students never pay; sponsors start on the free Scout tier
 * and upgrade. PayMongo checkout is stubbed until P5 — selecting a paid tier opens a
 * placeholder payment panel.
 */
export const Route = createFileRoute("/sponsor/subscription")({
	component: Subscription,
});

type PlanKey = "scout" | "alpha" | "venture";

interface Plan {
	key: PlanKey;
	name: string;
	price: string;
	tagline: string;
	features: string[];
	/** false → a contact-sales tier (no self-serve checkout). */
	selfServe: boolean;
}

const PLANS: Plan[] = [
	{
		key: "scout",
		name: "Scout",
		price: "Free",
		tagline: "Browse, filter, express interest",
		features: [
			"Full showcase + grants browse",
			"Sector / region filters",
			"Express interest",
		],
		selfServe: true,
	},
	{
		key: "alpha",
		name: "Alpha",
		price: "₱12,000 / mo",
		tagline: "Pro deal-flow, seat-based",
		features: [
			"Everything in Scout",
			"Vault access requests",
			"Saved-search go-live alerts",
			"Private watchlists",
		],
		selfServe: true,
	},
	{
		key: "venture",
		name: "Venture Partner",
		price: "Custom",
		tagline: "Enterprise scouting",
		features: [
			"Everything in Alpha",
			"Promoted placement (labeled)",
			"Incubation campaigns",
			"CRM / Notion / Airtable export",
		],
		selfServe: false,
	},
];

const INVOICES = [
	{ date: "Jun 1, 2026", desc: "Alpha · 5 seats", amount: "₱12,000" },
	{ date: "May 1, 2026", desc: "Alpha · 5 seats", amount: "₱12,000" },
	{ date: "Apr 1, 2026", desc: "Alpha · 3 seats", amount: "₱7,200" },
];

function Subscription() {
	// New sponsors start on the free Scout tier; upgrading is the payment path.
	const [plan, setPlan] = useState<PlanKey>("scout");
	const [pendingUpgrade, setPendingUpgrade] = useState<Plan | null>(null);

	const onCta = (p: Plan) => {
		if (p.key === plan) return; // already current
		if (!p.selfServe) {
			setPendingUpgrade(null);
			return; // contact-sales — no checkout
		}
		if (p.price === "Free") {
			setPlan(p.key);
			setPendingUpgrade(null);
			return;
		}
		setPendingUpgrade(p); // open the payment panel
	};

	const ctaLabel = (p: Plan): string => {
		if (p.key === plan) return "Current plan";
		if (!p.selfServe) return "Contact sales";
		if (p.price === "Free") return "Switch to Scout";
		return `Upgrade to ${p.name}`;
	};

	const paid = plan !== "scout";

	return (
		<main className="mx-auto max-w-[1100px]">
			<h1 className="mb-1.5 text-[30px] text-action">
				Subscription &amp; billing
			</h1>
			<p className="mb-7 max-w-[620px] text-[15px] leading-[1.55] text-content-muted">
				Students never pay. Sponsor tiers unlock deal-flow tooling; billing runs
				through PayMongo with every charge written to the ledger.
			</p>

			<div className="mb-[30px] grid gap-[18px] md:grid-cols-3">
				{PLANS.map((p) => {
					const current = p.key === plan;
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
										<Check
											className="mt-0.5 size-4 flex-none text-success"
											aria-hidden
										/>
										{f}
									</div>
								))}
							</div>
							<button
								type="button"
								disabled={current}
								onClick={() => onCta(p)}
								className={`h-[42px] w-full rounded-[11px] text-[14px] transition-colors ${
									current
										? "cursor-default border border-line bg-surface-card text-content-ghost"
										: "bg-action text-white hover:bg-action-hover"
								}`}
							>
								{ctaLabel(p)}
							</button>
						</div>
					);
				})}
			</div>

			{pendingUpgrade ? (
				<div className="mb-6 rounded-2xl border border-action bg-surface-sunken p-[22px]">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<div className="text-[16px] text-content-heading">
								Upgrade to {pendingUpgrade.name} — {pendingUpgrade.price}
							</div>
							<div className="mt-0.5 font-mono text-[12.5px] text-content-faint">
								Secure checkout via PayMongo (card · GCash · Maya)
							</div>
						</div>
						<div className="flex items-center gap-2.5">
							<button
								type="button"
								onClick={() => setPendingUpgrade(null)}
								className="btn btn-secondary h-11"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => {
									// TODO(P5): open the PayMongo checkout session; on success set the plan.
									setPlan(pendingUpgrade.key);
									setPendingUpgrade(null);
								}}
								className="btn btn-primary h-11"
							>
								Pay with PayMongo
							</button>
						</div>
					</div>
					<p className="mt-3 font-mono text-[11.5px] text-content-faint">
						Payment integration lands in P5 — this confirms the plan locally for
						now.
					</p>
				</div>
			) : null}

			{paid ? (
				<>
					<div className="mb-6 rounded-2xl border border-line bg-surface-card p-[22px]">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<div className="text-[16px] text-content-heading">Seats</div>
								<div className="mt-0.5 font-mono text-[13px] text-content-faint">
									3 of 5 used on {PLANS.find((p) => p.key === plan)?.name}
								</div>
							</div>
							<button type="button" className="btn btn-secondary h-10">
								Manage seats
							</button>
						</div>
					</div>

					<div className="mb-3 text-[13px] text-content-heading">Invoices</div>
					<div className="overflow-hidden rounded-2xl border border-line bg-surface-card">
						{INVOICES.map((inv) => (
							<div
								key={inv.date}
								className="flex items-center justify-between border-[#eef1fa] border-b px-5 py-[15px] last:border-b-0"
							>
								<div>
									<div className="text-[14.5px] text-content-heading">
										{inv.desc}
									</div>
									<div className="font-mono text-[11.5px] text-content-faint">
										{inv.date}
									</div>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-[15px] text-content-heading">
										{inv.amount}
									</span>
									<span className="status-pill status-pill--success">
										✓ Paid
									</span>
								</div>
							</div>
						))}
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
