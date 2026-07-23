type PlaceholderAd =
	| {
			id: string;
			kind: "content";
			eyebrow: string;
			cover: string;
			heading: string;
			body: string;
			cta: string;
	  }
	| {
			id: string;
			kind: "image";
			src: string;
			alt: string;
	  };

/**
 * Hardcoded placeholder ad slots — no ad provider is wired up yet, this exists to test
 * the right-column visual once the sponsor/student rails moved to the left column. Swap
 * for a real ad-serving integration later; the slot shape (right column, sticky, this
 * width) stays the same. `kind: "image"` is a plain creative dropped straight into
 * `public/` — no eyebrow/heading/body/CTA chrome around it, just the image.
 */
const PLACEHOLDER_ADS: PlaceholderAd[] = [
	{
		id: "cloud-credits",
		kind: "content",
		eyebrow: "Sponsored",
		cover: "linear-gradient(135deg,#1f2a52,#3a52a6)",
		heading: "$5k in cloud credits for student MVPs",
		body: "Ship your thesis backend on us — no card required for the first year.",
		cta: "Claim credits",
	},
	{
		id: "founder-fellowship",
		kind: "content",
		eyebrow: "Sponsored",
		cover: "linear-gradient(135deg,#607ef2,#3a52a6)",
		heading: "Apply: Founder Fellowship 2026",
		body: "8-week program for student teams turning a thesis into a company.",
		cta: "See details",
	},
	{
		id: "bingo-plus",
		kind: "image",
		src: "/images.jpg",
		alt: "Sponsored",
	},
];

export function AdsPanel() {
	return (
		<aside className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
			{PLACEHOLDER_ADS.map((ad) =>
				ad.kind === "image" ? (
					<div
						key={ad.id}
						className="overflow-hidden rounded-2xl border border-dashed border-line"
					>
						<img src={ad.src} alt={ad.alt} className="w-full object-cover" />
					</div>
				) : (
					<div
						key={ad.id}
						className="overflow-hidden rounded-2xl border border-dashed border-line bg-surface-card"
					>
						<div className="h-[86px]" style={{ background: ad.cover }} />
						<div className="p-[18px]">
							<div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-content-ghost">
								{ad.eyebrow}
							</div>
							<div className="text-[14.5px] text-content-heading">
								{ad.heading}
							</div>
							<p className="mt-1.5 text-[12.5px] text-content-faint">
								{ad.body}
							</p>
							<button
								type="button"
								className="btn btn-secondary mt-3.5 h-9 w-full text-[13px]"
							>
								{ad.cta}
							</button>
						</div>
					</div>
				),
			)}
		</aside>
	);
}
