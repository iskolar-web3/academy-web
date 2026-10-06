import { Plus } from "lucide-react";
import { LANDING_FAQS } from "#/lib/landing/content";

/** Native disclosures keep every answer in the initial HTML and work without JS. */
export function LandingFaq() {
	return (
		<section
			id="faq"
			aria-labelledby="faq-heading"
			className="scroll-mt-24 border-t border-line bg-surface-card"
		>
			<div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
				<div>
					<p className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-action">
						A little clarity
					</p>
					<h2
						id="faq-heading"
						className="mt-4 text-balance text-4xl leading-tight text-foreground sm:text-5xl"
					>
						Frequently asked questions
					</h2>
				</div>
				<div className="min-w-0 divide-y divide-line border-y border-line">
					{LANDING_FAQS.map((faq, index) => (
						<details
							key={faq.id}
							id={faq.id}
							open={index === 0}
							className="group scroll-mt-24 py-1"
						>
							<summary className="flex cursor-pointer list-none items-start justify-between gap-5 rounded py-5 text-lg leading-snug text-content-heading focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action [&::-webkit-details-marker]:hidden">
								<h3>{faq.question}</h3>
								<Plus
									aria-hidden="true"
									className="mt-0.5 size-5 shrink-0 text-action transition-transform group-open:rotate-45 motion-reduce:transition-none"
								/>
							</summary>
							<div className="pb-6 pr-5 text-base leading-relaxed text-content-soft sm:pr-10">
								<p>{faq.answer}</p>
								{"link" in faq && (
									<a
										href={faq.link.href}
										className="mt-3 inline-block rounded text-action underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
									>
										{faq.link.label}
									</a>
								)}
							</div>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
