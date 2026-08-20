import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useWatchlist } from "#/hooks/saved-search/useWatchlist";
import { useEntitlement } from "#/hooks/subscription/useEntitlement";
import { useMySubscription } from "#/hooks/subscription/useMySubscription";
import { useSubscriptionMutations } from "#/hooks/subscription/useSubscriptionMutations";
import { planInfo } from "#/lib/subscription/model";

/**
 * Sponsor rail — a 1:1 port of the design-template `SponsorRail.dc.html`: the sticky
 * left-column panel shown beside the Discover gallery (and deal-flow) **for sponsors
 * only** — width comes from `AppPageLayout`'s left track, not this component. Four
 * cards: go-live alerts + watchlist, the sponsor's subscriptions, suggested-to-follow, and
 * the current plan (links to `/sponsor/subscription`).
 *
 * **P5 reality check:** go-live alerts, watchlist count, and the plan card are now real
 * (`Subscription`/`useWatchlist`). "Your subscriptions"/"Suggested to follow" **stay mock**
 * — deliberately, not as an oversight. There is no "sponsor follows a builder" relationship
 * anywhere else in this app, and no story (SPN-12…16) asks for one; the design-template's
 * own SPONSOR DEAL-FLOW feed turned out to be decorative flavor text over real published
 * projects, not a real follow-and-post system either (see `sponsor/home.tsx`). Building a
 * real follow backend for this one rail panel would be scope with no story behind it.
 */

interface Follow {
	id: string;
	initials: string;
	cover: string;
	name: string;
	kind: string;
	sub: string;
}

const FOLLOWING: Follow[] = [
	{
		id: "aralbot",
		initials: "AB",
		cover: "#3a52a6",
		name: "AralBot",
		kind: "EdTech",
		sub: "UP Diliman",
	},
	{
		id: "tindalink",
		initials: "TL",
		cover: "#607ef2",
		name: "TindaLink",
		kind: "FinTech",
		sub: "DLSU",
	},
];

const SUGGESTED: Follow[] = [
	{
		id: "hirayahealth",
		initials: "HH",
		cover: "#3a52a6",
		name: "HirayaHealth",
		kind: "HealthTech",
		sub: "Ateneo de Manila",
	},
	{
		id: "animetrics",
		initials: "AM",
		cover: "#607ef2",
		name: "AniMetrics",
		kind: "AgriTech",
		sub: "USC Cebu",
	},
	{
		id: "wattwatch",
		initials: "WW",
		cover: "#1f2a52",
		name: "WattWatch",
		kind: "CleanTech",
		sub: "Mapúa",
	},
];

const cardCls = "rounded-2xl border border-line bg-surface-card p-[18px]";
const eyebrowCls =
	"mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60";

function FollowRow({
	f,
	following,
	onToggle,
}: {
	f: Follow;
	following: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex min-w-0 items-center gap-2.5">
				<span
					className="flex size-[38px] flex-none items-center justify-center rounded-[11px] text-[12px] text-white"
					style={{ background: f.cover }}
				>
					{f.initials}
				</span>
				<div className="min-w-0">
					<div className="truncate text-[13.5px] text-content-heading">
						{f.name}
					</div>
					<div className="font-mono text-[10.5px] text-content-faint">
						{f.kind} · {f.sub}
					</div>
				</div>
			</div>
			<button
				type="button"
				onClick={onToggle}
				className={`h-8 flex-none rounded-[9px] px-3 text-[12px] transition-colors ${
					following
						? "border border-line bg-surface-card text-content-muted hover:bg-surface-sunken"
						: "bg-action text-white hover:bg-action-hover"
				}`}
			>
				{following ? "Following" : "Follow"}
			</button>
		</div>
	);
}

export function SponsorRail() {
	// "Follow a builder" stays mock — see the header comment. Watchlist/alerts/plan are real.
	const [followed, setFollowed] = useState<Record<string, boolean>>({
		aralbot: true,
		tindalink: true,
	});
	const toggle = (id: string) => setFollowed((m) => ({ ...m, [id]: !m[id] }));

	const { data: subscription } = useMySubscription();
	const { data: watchIds = [] } = useWatchlist();
	const { setAlerts } = useSubscriptionMutations();
	const alertsEntitled = useEntitlement("savedSearchAlerts");
	const alertsOn = subscription?.alertsEnabled ?? false;
	const tier = subscription ? planInfo(subscription.tier) : null;

	return (
		<aside className="hidden w-full flex-col gap-4 lg:sticky lg:top-[88px] lg:flex">
			{/* Go-live alerts + watchlist */}
			<div className={cardCls}>
				<div className="mb-3.5 flex items-center justify-between">
					<div>
						<div className="text-[14.5px] text-content-heading">
							Go-live alerts
						</div>
						<div className="font-mono text-[11.5px] text-content-faint">
							{alertsEntitled ? (alertsOn ? "On" : "Off") : "Alpha+ only"}
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={alertsOn}
						aria-label="Go-live alerts"
						disabled={!alertsEntitled}
						onClick={() => setAlerts.mutate(!alertsOn)}
						className={`relative h-[26px] w-[46px] flex-none rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
							alertsOn ? "bg-action" : "bg-line"
						}`}
					>
						<span
							className={`absolute top-[3px] size-5 rounded-full bg-white shadow-sm transition-all ${
								alertsOn ? "left-[23px]" : "left-[3px]"
							}`}
						/>
					</button>
				</div>
				<div className="flex items-center justify-between border-[#eef1fa] border-t pt-[13px]">
					<span className="text-[13.5px] text-content-muted">Watchlist</span>
					<span className="text-[15px] text-action">{watchIds.length}</span>
				</div>
			</div>

			{/* Your subscriptions */}
			<div className={cardCls}>
				<div className={eyebrowCls}>Your subscriptions</div>
				<div className="flex flex-col gap-3.5">
					{FOLLOWING.map((f) => (
						<FollowRow
							key={f.id}
							f={f}
							following={followed[f.id] ?? false}
							onToggle={() => toggle(f.id)}
						/>
					))}
				</div>
			</div>

			{/* Suggested to follow */}
			<div className={cardCls}>
				<div className={eyebrowCls}>Suggested to follow</div>
				<div className="flex flex-col gap-3.5">
					{SUGGESTED.map((f) => (
						<FollowRow
							key={f.id}
							f={f}
							following={followed[f.id] ?? false}
							onToggle={() => toggle(f.id)}
						/>
					))}
				</div>
			</div>

			{/* Plan */}
			<Link
				to="/sponsor/subscription"
				className={`${cardCls} block transition-colors hover:border-action`}
			>
				<div className="mb-2 flex items-center justify-between">
					<span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60">
						Plan · {tier?.name ?? "…"}
					</span>
					<span className="text-[12px] text-action">Manage →</span>
				</div>
				<div className="mb-[3px] text-[14px] text-content-heading">
					{subscription
						? `${subscription.seats} seat${subscription.seats === 1 ? "" : "s"} billed`
						: "…"}
				</div>
				<div className="font-mono text-[12.5px] text-content-faint">
					{tier?.price ?? ""}
				</div>
			</Link>
		</aside>
	);
}
