import type { LucideIcon } from "lucide-react";
import { HandCoins, Rocket, Telescope } from "lucide-react";
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
		title: "Showcase your MVP",
		body: "Share a working demo, code, and video. Academy reviews each project before publication.",
	},
	{
		Icon: HandCoins,
		title: "Fund your thesis",
		body: "Apply for a grant from the proposal stage. Students do not pay to apply.",
	},
	{
		Icon: Telescope,
		title: "Get discovered",
		body: "Help sponsors and recruiters find your work. You choose when to connect.",
	},
];

/** Centered three-column overview of Academy's main benefits. */
export function ValueProps() {
	return (
		<section className="container-page py-20">
			<SectionHeading label="Why Academy" />
			<div className="mt-14 grid gap-12 md:grid-cols-3">
				{PROPS.map(({ Icon, title, body }, i) => {
					return (
						<Reveal key={title} delay={i * 0.08}>
							<article className="flex w-full flex-col items-center text-center">
								<span className="mb-6 inline-flex size-24 items-center justify-center rounded-full bg-surface-tint text-action">
									<Icon className="size-12" strokeWidth={1.5} aria-hidden />
								</span>
								<h3 className="mb-3 text-2xl text-foreground">{title}</h3>
								<p className="max-w-xs text-base leading-relaxed text-content-soft">
									{body}
								</p>
							</article>
						</Reveal>
					);
				})}
			</div>
		</section>
	);
}
