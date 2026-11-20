import { type CSSProperties, useRef } from "react";
import { useActive } from "#/components/landing/useActive";
import { LAUNCH_PARTNERS, type Partner } from "#/lib/landing/content";
import { cn } from "#/lib/utils";

/** Rough per-logo width, used only to size how often a short row repeats. */
const ITEM_WIDTH_ESTIMATE = 220;
/** One half of a marquee track must be wider than any screen so the loop never shows a gap. */
const MIN_HALF_WIDTH = 2200;

const WORDMARKS = LAUNCH_PARTNERS.filter((partner) => partner.wordmark);
const BADGES = LAUNCH_PARTNERS.filter((partner) => !partner.wordmark);

function PartnerLogo({ partner, copy }: { partner: Partner; copy: boolean }) {
	const className = cn(
		"p-mark",
		partner.wordmark ? "p-wordmark" : "p-badge",
		partner.tonal && "p-tonal",
		partner.round && "p-round",
	);
	return (
		<li aria-hidden={copy || undefined}>
			<div
				className={className}
				data-hover-colour={partner.hoverColour !== false}
			>
				<span className="p-logo">
					<img
						src={partner.logo}
						alt={copy ? "" : partner.name}
						width={partner.width}
						height={partner.height}
						loading="lazy"
						decoding="async"
					/>
				</span>
			</div>
		</li>
	);
}

/**
 * A scrolling logo row. The track holds the partners repeated until one half is wide
 * enough, then an identical copy, so `translateX(-50%)` loops seamlessly. Everything
 * after the first pass is aria-hidden duplicate content.
 */
function MarqueeRow({
	partners,
	direction,
	seconds,
	label,
}: {
	partners: Partner[];
	direction: "left" | "right";
	seconds: number;
	label: string;
}) {
	const repeats = Math.max(
		1,
		Math.ceil(MIN_HALF_WIDTH / (partners.length * ITEM_WIDTH_ESTIMATE)),
	);
	const track = Array.from({ length: repeats * 2 }, (_, pass) =>
		partners.map((partner) => (
			<PartnerLogo
				// biome-ignore lint/suspicious/noArrayIndexKey: the track is static and never reordered; `pass` tells copies apart.
				key={`${pass}-${partner.logo}`}
				partner={partner}
				copy={pass > 0}
			/>
		)),
	);

	return (
		<div className="p-row" data-direction={direction}>
			<ul
				className="p-track"
				aria-label={label}
				style={{ "--seconds": `${seconds}s` } as CSSProperties}
			>
				{track}
			</ul>
		</div>
	);
}

/** Launch partners on the shared blue panel: wordmarks drift left, badges drift right. */
export function PartnerWall() {
	const sectionRef = useRef<HTMLElement>(null);
	const active = useActive(sectionRef);

	return (
		<section
			ref={sectionRef}
			className="section compact partners ground-canvas ground-dots"
			aria-labelledby="partners-title"
			data-active={active}
		>
			<div className="wrap">
				<div className="lp-panel">
					<div className="p-label head">
						<span className="rule reveal" />
						<h2 id="partners-title" className="reveal">
							Our Launch Partners
						</h2>
					</div>
					<div className="p-rows">
						<MarqueeRow
							partners={WORDMARKS}
							direction="left"
							seconds={45}
							label="Launch partners, wordmarks"
						/>
						<MarqueeRow
							partners={BADGES}
							direction="right"
							seconds={55}
							label="Launch partners, community badges"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
