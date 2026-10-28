import { LANDING_FAQS } from "#/lib/landing/content";

/** Native disclosures keep every answer in the initial HTML and work without JS. */
export function LandingFaq() {
	return (
		<section
			className="section ground-canvas"
			id="faq"
			aria-labelledby="faq-title"
		>
			<div className="wrap faq-grid">
				<div className="faq-aside head">
					<span className="rule reveal" />
					<p className="kicker reveal">A little clarity</p>
					<h2 id="faq-title" className="display reveal">
						Frequently asked questions
					</h2>
				</div>
				<div className="faq-list">
					{LANDING_FAQS.map((faq) => (
						<details key={faq.id} id={faq.id}>
							<summary>
								<h3>{faq.question}</h3>
								<span className="plus" aria-hidden="true" />
							</summary>
							<div className="ans">
								<p>{faq.answer}</p>
								{"link" in faq && <a href={faq.link.href}>{faq.link.label}</a>}
							</div>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
