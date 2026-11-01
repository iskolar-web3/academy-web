import type { LucideIcon } from "lucide-react";
import { HandCoins, Rocket, Telescope } from "lucide-react";
import type { CSSProperties } from "react";

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

/** Display label column + three column-ruled claims with thin-line lucide icons. */
export function ValueProps() {
	return (
		<section
			className="section compact ground-canvas"
			aria-labelledby="why-title"
		>
			<div className="wrap why-grid">
				<div className="head">
					<span className="rule reveal" />
					<h2 id="why-title" className="display reveal">
						Why Academy
					</h2>
				</div>
				<ul className="why-list">
					{PROPS.map(({ Icon, title, body }, i) => (
						<li key={title}>
							<Icon className="why-icon reveal" aria-hidden="true" />
							<h3 className="reveal" style={{ "--i": i } as CSSProperties}>
								{title}
							</h3>
							<p>{body}</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
