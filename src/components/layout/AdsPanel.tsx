interface SponsoredNote {
	id: string;
	label: string;
	heading: string;
	body: string;
	cta: string;
}

const SPONSORED_NOTES: SponsoredNote[] = [
	{
		id: "cloud-credits",
		label: "Sponsored",
		heading: "Cloud credits for student MVPs",
		body: "Apply for hosting credits once your demo and repository are ready.",
		cta: "View offer",
	},
	{
		id: "founder-fellowship",
		label: "Program",
		heading: "Founder Fellowship 2026",
		body: "Eight weeks for student teams turning a thesis into a company.",
		cta: "See details",
	},
];

export function AdsPanel() {
	return (
		<aside className="hidden flex-col gap-3 lg:sticky lg:top-[88px] lg:flex">
			<div className="border-line border-b pb-3">
				<div className="font-mono text-[10.5px] uppercase text-content-faint">
					Opportunities
				</div>
			</div>
			{SPONSORED_NOTES.map((ad) => (
				<div
					key={ad.id}
					className="rounded-[14px] border border-line bg-surface-card p-4 shadow-card"
				>
					<div className="mb-2 font-mono text-[10.5px] uppercase text-content-faint">
						{ad.label}
					</div>
					<div className="text-[14.5px] leading-snug text-content-heading">
						{ad.heading}
					</div>
					<p className="mt-1.5 text-[12.5px] leading-relaxed text-content-soft">
						{ad.body}
					</p>
					<button
						type="button"
						className="mt-3 inline-flex h-8 items-center rounded-[8px] border border-line bg-surface-card px-3 text-[12.5px] text-action transition-colors hover:bg-surface-tint"
					>
						{ad.cta}
					</button>
				</div>
			))}
		</aside>
	);
}
