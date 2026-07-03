import { Link } from "@tanstack/react-router";
import { useState } from "react";

/**
 * Sponsor rail — a 1:1 port of the design-template `SponsorRail.dc.html`: the 320px sticky
 * sidebar shown beside the Discover gallery (and deal-flow) **for sponsors only**. Four
 * cards: go-live alerts + watchlist, the sponsor's subscriptions, suggested-to-follow, and
 * the current plan (links to `/sponsor/subscription`). Mock data until the follow/watch
 * model lands (P3/P5); static → SSR-safe.
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
	const [alerts, setAlerts] = useState(true);
	const [followed, setFollowed] = useState<Record<string, boolean>>({
		aralbot: true,
		tindalink: true,
	});

	const toggle = (id: string) => setFollowed((m) => ({ ...m, [id]: !m[id] }));
	const watchCount = Object.values(followed).filter(Boolean).length;

	return (
		<aside className="hidden w-[320px] flex-none flex-col gap-4 lg:sticky lg:top-[88px] lg:flex">
			{/* Go-live alerts + watchlist */}
			<div className={cardCls}>
				<div className="mb-3.5 flex items-center justify-between">
					<div>
						<div className="text-[14.5px] text-content-heading">
							Go-live alerts
						</div>
						<div className="font-mono text-[11.5px] text-content-faint">
							{alerts ? "On" : "Off"}
						</div>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={alerts}
						aria-label="Go-live alerts"
						onClick={() => setAlerts((a) => !a)}
						className={`relative h-[26px] w-[46px] flex-none rounded-full transition-colors ${
							alerts ? "bg-action" : "bg-line"
						}`}
					>
						<span
							className={`absolute top-[3px] size-5 rounded-full bg-white shadow-sm transition-all ${
								alerts ? "left-[23px]" : "left-[3px]"
							}`}
						/>
					</button>
				</div>
				<div className="flex items-center justify-between border-[#eef1fa] border-t pt-[13px]">
					<span className="text-[13.5px] text-content-muted">Watchlist</span>
					<span className="text-[15px] text-action">{watchCount}</span>
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
						Plan · Alpha
					</span>
					<span className="text-[12px] text-action">Manage →</span>
				</div>
				<div className="mb-[3px] text-[14px] text-content-heading">
					3 of 5 seats used
				</div>
				<div className="font-mono text-[12.5px] text-content-faint">
					₱12,000 / mo
				</div>
			</Link>
		</aside>
	);
}
