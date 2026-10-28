import { useEffect, useRef } from "react";

/** Replica of the iskolar.io footer (links read from the live site, made absolute). */
const LINK_COLUMNS = [
	{
		title: "Home",
		links: [
			{ label: "Home", href: "https://iskolar.io/#home" },
			{ label: "Products", href: "https://iskolar.io/#products" },
			{ label: "Ecosystem", href: "https://iskolar.io/#ecosystem" },
			{ label: "In the News", href: "https://iskolar.io/#in-the-news" },
			{ label: "FAQs", href: "https://iskolar.io/#faqs" },
		],
	},
	{
		title: "Products",
		links: [
			{ label: "PathFinder", href: "https://iskolar.io/#pathfinder" },
			{ label: "Review", href: "https://iskolar.io/#review" },
			{ label: "iSkolar", href: "https://iskolar.io/#iskolar" },
			{ label: "Academy", href: "https://academy.iskolar.io" },
			{ label: "Vocation", href: "https://iskolar.io/#vocation" },
			{ label: "Verity", href: "https://iskolar.io/#verity" },
		],
	},
	{
		title: "About",
		links: [
			{
				label: "Company Overview",
				href: "https://iskolar.io/about#company-overview",
			},
			{
				label: "Mission & Vision",
				href: "https://iskolar.io/about#mission-vision",
			},
			{ label: "Partnerships", href: "https://iskolar.io/about#partnerships" },
			{ label: "Our Team", href: "https://iskolar.io/about#team" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy Policy", href: "https://iskolar.io/privacy-policy" },
			{
				label: "Terms & Conditions",
				href: "https://iskolar.io/terms-conditions",
			},
		],
	},
];

const SVG_PROPS = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.75,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

function MailIcon() {
	return (
		<svg {...SVG_PROPS} aria-hidden="true">
			<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
			<rect x="2" y="4" width="20" height="16" rx="2" />
		</svg>
	);
}

const SOCIALS = [
	{
		label: "Facebook",
		href: "https://www.facebook.com/profile.php?id=61575967087555",
		icon: (
			<svg {...SVG_PROPS} aria-hidden="true">
				<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
			</svg>
		),
	},
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/company/107364901",
		icon: (
			<svg {...SVG_PROPS} aria-hidden="true">
				<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
				<rect width="4" height="12" x="2" y="9" />
				<circle cx="4" cy="4" r="2" />
			</svg>
		),
	},
	{
		label: "Instagram",
		href: "https://www.instagram.com/iskolar_web3?igsh=NDNvZmkwNmxwbDl2",
		icon: (
			<svg {...SVG_PROPS} aria-hidden="true">
				<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
				<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
				<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
			</svg>
		),
	},
];

/** Fixed back-to-top button; shows once the hero has left the viewport. */
function BackToTop() {
	const ref = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		const button = ref.current;
		const hero = document.getElementById("hero");
		if (!button || !hero) {
			return;
		}
		const io = new IntersectionObserver(([entry]) => {
			button.classList.toggle("show", !entry.isIntersecting);
		});
		io.observe(hero);
		return () => io.disconnect();
	}, []);

	return (
		<a ref={ref} className="to-top" href="#main">
			<span className="sr-only">Back to top</span>
			<svg {...SVG_PROPS} aria-hidden="true">
				<path d="m5 12 7-7 7 7" />
				<path d="M12 19V5" />
			</svg>
		</a>
	);
}

export function LandingFooter() {
	return (
		<>
			<footer className="site-footer">
				<div className="wrap">
					<div className="f-grid">
						<div className="f-brand">
							<a href="https://iskolar.io/" aria-label="iSkolar home">
								<img
									src="/iskolar-logo.png"
									alt="iSkolar"
									width={136}
									height={56}
								/>
							</a>
							<p>
								Tools for every step of a Filipino student's journey, from
								choosing a course to proving a diploma.
							</p>
							<div className="f-social">
								{SOCIALS.map((social) => (
									<a
										key={social.label}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
									>
										{social.icon}
									</a>
								))}
							</div>
						</div>
						{LINK_COLUMNS.map((column) => (
							<nav
								key={column.title}
								className="f-col"
								aria-label={column.title}
							>
								<h3>{column.title}</h3>
								<ul>
									{column.links.map((link) => (
										<li key={link.label}>
											<a href={link.href}>{link.label}</a>
										</li>
									))}
								</ul>
							</nav>
						))}
						<div className="f-col">
							<h3>Contact Us</h3>
							<a className="f-mail" href="mailto:hello@iskolar.io">
								<MailIcon />
								hello@iskolar.io
							</a>
						</div>
					</div>
					<div className="f-bottom">
						<p>© 2026 iSkolar. All rights reserved.</p>
						<p>Built For Students, Built By Students.</p>
					</div>
				</div>
				<div className="f-mark" aria-hidden="true">
					<span>iSkolar</span>
				</div>
			</footer>
			<BackToTop />
		</>
	);
}
