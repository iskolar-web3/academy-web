import { usePlatformMetrics } from "#/hooks/metrics/usePlatformMetrics";

/** Live count cards from `GET /admin/metrics`. */

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
		</div>
	);
}
