import type { LucideIcon } from "lucide-react";
import { HandCoins, Rocket, Telescope } from "lucide-react";
import { useState } from "react";
import { Reveal } from "#/components/landing/Reveal";
import { SectionHeading } from "#/components/landing/spine";

interface ValueProp {
	Icon: LucideIcon;
	title: string;
	body: string;
}

const PROPS: ValueProp[] = [
	{
		Icon: Rocket,
		title: "Showcase real, working MVPs",
		body: "Every published project clears a working-MVP gate — live demo, repo, and video — then an independent review. No vaporware.",
	},
	{
		Icon: HandCoins,
		title: "Fund a thesis from day one",
		body: "Grants back theses at the title-proposal stage. Backers fund the work on-platform. Students never pay a peso.",
	},
	{
		Icon: Telescope,
		title: "Get scouted by investors",
		body: "Investors, recruiters, and employers find your project and the people behind it, then signal interest — your contact stays yours.",
	},
];

/** Centered 3-up; large icons. Hovering one highlights it and dims the others. */
export function ValueProps() {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<section className="container-page py-16">
			<SectionHeading label="Why Academy" />
			<div className="mt-12 grid gap-10 md:grid-cols-3">
				{PROPS.map(({ Icon, title, body }, i) => {
					const active = hovered === i;
					const dim = hovered !== null && !active;
					return (
						<Reveal key={title} delay={i * 0.08}>
							<button
								type="button"
								onMouseEnter={() => setHovered(i)}
								onMouseLeave={() => setHovered(null)}
								onFocus={() => setHovered(i)}
								onBlur={() => setHovered(null)}
								className={`flex w-full flex-col items-center text-center transition-opacity duration-300 ${
									dim ? "opacity-40" : "opacity-100"
								}`}
							>
								<span
									className={`mb-6 inline-flex size-24 items-center justify-center rounded-full transition-all duration-300 ${
										active
											? "scale-105 bg-action text-white shadow-[0_10px_28px_rgb(58_82_166/0.3)]"
											: "bg-surface-tint text-action"
									}`}
								>
									<Icon className="size-12" strokeWidth={1.5} aria-hidden />
								</span>
								<h3
									className={`mb-3 text-2xl transition-colors duration-300 ${
										active ? "text-action" : "text-foreground"
									}`}
								>
									{title}
								</h3>
								<p className="max-w-xs text-base leading-relaxed text-content-soft">
									{body}
								</p>
							</button>
						</Reveal>
					);
				})}
			</div>
		</section>
	);
}
