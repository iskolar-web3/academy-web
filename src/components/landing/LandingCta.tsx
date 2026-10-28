import { SignInPopover } from "#/components/landing/SignInPopover";

const TAGLINE = "Find your next opportunity on Academy";

/** Navy tagline band; the headline brightens word by word as it scrolls in (CSS). */
export function LandingCta() {
	const words = TAGLINE.split(" ");
	return (
		<section className="cta section lp-navy" aria-labelledby="cta-title">
			<div className="wrap">
				<span className="rule reveal" style={{ marginBottom: "2.5rem" }} />
				<div className="cta-grid">
					<h2 id="cta-title">
						{words.map((word, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static copy, never reordered.
							<span key={i}>
								<span className="w">{word}</span>
								{i < words.length - 1 ? " " : null}
							</span>
						))}
					</h2>
					<div>
						<p>
							Showcase a project, share a thesis grant proposal, or discover
							student talent.
						</p>
						<SignInPopover>
							<button type="button" className="lp-btn lp-btn-light">
								Get started
							</button>
						</SignInPopover>
					</div>
				</div>
			</div>
		</section>
	);
}
