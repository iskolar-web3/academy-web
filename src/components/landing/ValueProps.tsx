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
		body: "Submit your live demo and public repository for review. A video walkthrough is optional.",
	},
	{
		Icon: HandCoins,
		title: "Share a thesis proposal",
		body: "Post a proposal PDF and funding target with no application fee.",
	},
	{
		Icon: Telescope,
		title: "Get discovered",
		body: "Receive sponsor-interest notifications and view sponsor profiles. You choose whether to follow up.",
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
								<span className="mb-6 inline-flex size-24 items-center justify-center text-action">
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
