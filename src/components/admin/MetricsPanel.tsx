import { usePlatformMetrics } from "#/hooks/metrics/usePlatformMetrics";

/**
 * Platform metrics (ADM-06) — a 1:1 port of the design-template ADMIN › METRICS: a row of
 * count cards (label · value · 7-day delta) over two bar charts (Grants funded · Sponsor MRR).
 * The count cards are **live** (`GET /admin/metrics`, counts only — FR-AD5). The two charts
 * are **illustrative** until P4 (grants funded) and P5 (sponsor MRR) supply real series.
 */

/** Illustrative chart data — replaced by live series in P4 (funding) / P5 (MRR). */
const FUNDING_BARS = [
	{ m: "Feb", vLabel: "₱42", h: 40 },
	{ m: "Mar", vLabel: "₱58", h: 55 },
	{ m: "Apr", vLabel: "₱71", h: 68 },
	{ m: "May", vLabel: "₱64", h: 61 },
	{ m: "Jun", vLabel: "₱96", h: 92 },
	{ m: "Jul", vLabel: "₱88", h: 84 },
] as const;

const MRR_BARS = [
	{ t: "Scout", vLabel: "₱0", h: 8 },
	{ t: "Alpha", vLabel: "₱144", h: 82 },
	{ t: "Venture", vLabel: "₱210", h: 100 },
] as const;

export function MetricsPanel() {
	const { data, isLoading, isError } = usePlatformMetrics();
	const cards = data?.cards ?? [];

	return (
		<div>
			{isLoading ? (
				<p className="mb-7 text-[14px] text-content-soft">Loading metrics…</p>
			) : isError ? (
				<p className="mb-7 text-[14px] text-danger">Couldn’t load metrics.</p>
			) : (
				<div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
					{cards.map((m) => (
						<div
							key={m.label}
							className="rounded-[14px] border border-line bg-surface-card p-[18px]"
						>
							<div className="mb-2.5 font-mono text-[12.5px] text-content-faint">
								{m.label}
							</div>
							<div className="flex items-baseline gap-2.5">
								<span className="text-[28px] text-content-heading">
									{m.value}
								</span>
								{m.delta ? (
									<span className="text-[13px] text-success">{m.delta}</span>
								) : null}
							</div>
						</div>
					))}
				</div>
			)}

			<div className="grid gap-[18px] lg:grid-cols-[1.4fr_1fr]">
				{/* Grants funded (illustrative → P4) */}
				<div className="rounded-[14px] border border-line bg-surface-card p-5">
					<div className="mb-1 text-[15px] text-content-heading">
						Grants funded
					</div>
					<div className="mb-5 font-mono text-[12.5px] text-content-faint">
						monthly, ₱ thousands
					</div>
					<div className="flex h-40 items-end gap-3.5">
						{FUNDING_BARS.map((b) => (
							<div
								key={b.m}
								className="flex h-full flex-1 flex-col items-center justify-end gap-2"
							>
								<span className="font-mono text-[11px] text-content-muted">
									{b.vLabel}
								</span>
								<div
									className="w-full rounded-t-[7px] bg-[linear-gradient(180deg,#607EF2,#3a52a6)]"
									style={{ height: `${b.h}%` }}
								/>
								<span className="font-mono text-[11.5px] text-content-faint">
									{b.m}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Sponsor MRR by tier (illustrative → P5) */}
				<div className="rounded-[14px] border border-line bg-surface-card p-5">
					<div className="mb-1 text-[15px] text-content-heading">
						Sponsor MRR by tier
					</div>
					<div className="mb-5 font-mono text-[12.5px] text-content-faint">
						₱ thousands / mo
					</div>
					<div className="flex h-40 items-end justify-center gap-5">
						{MRR_BARS.map((b) => (
							<div
								key={b.t}
								className="flex h-full w-[62px] flex-col items-center justify-end gap-2"
							>
								<span className="font-mono text-[11px] text-content-muted">
									{b.vLabel}
								</span>
								<div
									className="w-full rounded-t-[7px] bg-[linear-gradient(180deg,#7d93ee,#3a52a6)]"
									style={{ height: `${b.h}%` }}
								/>
								<span className="font-mono text-[11.5px] text-content-faint">
									{b.t}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
