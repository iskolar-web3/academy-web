import type { CSSProperties } from "react";
import { PARTNER_GROUPS, type Partner } from "#/lib/landing/content";
import { cn } from "#/lib/utils";

function PartnerLogo({ partner }: { partner: Partner }) {
	const sizing = partner.round
		? undefined
		: ({
				"--ar": partner.aspect,
				"--nw": partner.nativeWidth,
			} as CSSProperties);
	return (
		<li>
			<a href={partner.href} target="_blank" rel="noopener noreferrer">
				<img
					className={cn(
						"p-logo",
						partner.round && "round",
						partner.invert && "inv",
					)}
					data-hover-colour={partner.hoverColour}
					style={sizing}
					src={partner.logo}
					alt={partner.name}
					loading="lazy"
					decoding="async"
				/>
			</a>
		</li>
	);
}

/**
 * Static partner rows on the navy band: group label left, column-ruled logo track right.
 * Logos are sized to equal visual area (width = sqrt(area x aspect)), not equal height.
 */
export function PartnerWall() {
	return (
		<section
			className="section compact lp-navy"
			aria-labelledby="partners-title"
		>
			<div className="wrap">
				{PARTNER_GROUPS.map((group, index) => {
					const Heading = index === 0 ? "h2" : "h3";
					return (
						<div className="p-group" key={group.id}>
							<div className="p-label head">
								<span className="rule reveal" />
								<Heading
									id={index === 0 ? "partners-title" : undefined}
									className="reveal"
								>
									{group.title}
								</Heading>
							</div>
							<ul className="p-logos">
								{group.partners.map((partner) => (
									<PartnerLogo key={partner.name} partner={partner} />
								))}
							</ul>
						</div>
					);
				})}
			</div>
		</section>
	);
}
