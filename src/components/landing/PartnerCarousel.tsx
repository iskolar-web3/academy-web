const BLUE_TINT =
	"brightness(0) saturate(100%) invert(27%) sepia(46%) saturate(1066%) hue-rotate(196deg) brightness(91%) contrast(88%)";
const BLUE_DUOTONE =
	"grayscale(1) sepia(1) hue-rotate(190deg) saturate(2.2) brightness(0.95)";

const partners = [
	{
		name: "BYC Ventures",
		logo: "/partnerships/byc-ventures.png",
		filter: BLUE_TINT,
	},
	{
		name: "QBO Innovation Hub",
		logo: "/partnerships/qbo-innovation.png",
		filter: BLUE_DUOTONE,
	},
	{
		name: "Tutorials Dojo",
		logo: "/partnerships/tutorials-dojo.png",
		filter: BLUE_TINT,
	},
	{
		name: "CTIED",
		logo: "/partnerships/ctied.png",
		filter: BLUE_DUOTONE,
	},
	{
		name: "Jia Talent Vault",
		logo: "/partnerships/jia-whitecloak.png",
		filter: BLUE_TINT,
	},
	{
		name: "Cryptita Plays",
		logo: "/partnerships/cryptita-plays.png",
		filter: BLUE_TINT,
	},
	{
		name: "AWS Learning Club Heron",
		logo: "/partnerships/aws-learning-club-heron.png",
		filter: BLUE_DUOTONE,
	},
	{
		name: "Tech Kubo",
		logo: "/partnerships/tech-kubo.png",
		filter: BLUE_DUOTONE,
	},
];

export function PartnerCarousel() {
	return (
		<div className="container-page relative z-10 pb-16 sm:pb-20">
			<section
				className="partner-carousel-viewport"
				aria-label="iSkolar partners"
			>
				<div className="partner-carousel-track">
					{[false, true].map((duplicate) => (
						<div
							key={String(duplicate)}
							className="partner-carousel-group"
							aria-hidden={duplicate ? true : undefined}
						>
							{partners.map((partner) => (
								<div className="partner-carousel-logo" key={partner.name}>
									<img
										src={partner.logo}
										alt={partner.name}
										loading="lazy"
										style={{ filter: partner.filter }}
									/>
								</div>
							))}
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
