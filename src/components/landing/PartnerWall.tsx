import type { CSSProperties } from "react";
import { LAUNCH_PARTNERS, type Partner } from "#/lib/landing/content";
import { cn } from "#/lib/utils";

function PartnerLogo({ partner }: { partner: Partner }) {
	const sizing = {
		"--ar": partner.width / partner.height,
	} as CSSProperties;
	const artwork = (
		<span className="p-logo" style={sizing}>
			<img
				src={partner.logo}
				alt={partner.name}
				width={partner.width}
				height={partner.height}
				loading="lazy"
				decoding="async"
			/>
		</span>
	);
	const className = cn(
		"p-mark",
		partner.wordmark && "p-wordmark",
		partner.tonal && "p-tonal",
		partner.round && "p-round",
	);

	return (
		<li>
			{partner.href ? (
				<a
					className={className}
					data-hover-colour={partner.hoverColour !== false}
					href={partner.href}
					target="_blank"
					rel="noopener noreferrer"
				>
					{artwork}
				</a>
			) : (
				<div
					className={className}
					data-hover-colour={partner.hoverColour !== false}
				>
					{artwork}
				</div>
			)}
		</li>
	);
}

/** One static, responsive wall: every launch partner shares the same hierarchy. */
export function PartnerWall() {
	return (
		<section
			className="section compact lp-navy p-section"
			aria-labelledby="partners-title"
		>
			<div className="wrap">
				<div className="p-group">
					<div className="p-label head">
						<span className="rule reveal" />
						<h2 id="partners-title" className="reveal">
							Our Launch Partners
						</h2>
					</div>
					<ul className="p-logos">
						{LAUNCH_PARTNERS.map((partner) => (
							<PartnerLogo key={partner.logo} partner={partner} />
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
