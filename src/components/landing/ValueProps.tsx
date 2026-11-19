import type { LucideIcon } from "lucide-react";
import { HandCoins, Rocket, Telescope } from "lucide-react";
import {
	type CSSProperties,
	Fragment,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

/** Start offset (after the column's own delay) for one scene element. */
function at(t: string) {
	return { "--t": t } as CSSProperties;
}

/** Browser window → screenshot block → "Live demo" tag. */
function MvpScene() {
	return (
		<>
			<rect
				className="d sc-paper"
				pathLength={1}
				x="24"
				y="10"
				width="208"
				height="108"
				rx="10"
			/>
			<path className="d" pathLength={1} d="M24 34h208" style={at("0.15s")} />
			<circle className="f sc-dot" cx="38" cy="22" r="2.5" style={at("0.4s")} />
			<circle className="f sc-dot" cx="49" cy="22" r="2.5" style={at("0.5s")} />
			<circle className="f sc-dot" cx="60" cy="22" r="2.5" style={at("0.6s")} />
			<rect
				className="d"
				pathLength={1}
				x="76"
				y="16"
				width="120"
				height="12"
				rx="6"
				style={at("0.3s")}
			/>
			<rect
				className="f sc-tint sc-bare"
				x="40"
				y="44"
				width="176"
				height="60"
				rx="6"
				style={at("0.9s")}
			/>
			<path className="f" d="M54 58h70M54 70h46" style={at("1.1s")} />
			<g className="pop" style={at("1.5s")}>
				<rect
					className="sc-accent sc-bare"
					x="132"
					y="88"
					width="108"
					height="26"
					rx="13"
				/>
				<text className="sc-on-accent" x="146" y="105.5">
					Live demo
				</text>
				<path className="sc-arrow" d="M220 106l7-7M221.5 99h5.5v5.5" />
			</g>
		</>
	);
}

/** Document with a folded corner, then a funding bar filling. */
function ThesisScene() {
	return (
		<>
			<path
				className="d sc-paper"
				pathLength={1}
				d="M98 6h40l26 26v36a6 6 0 0 1-6 6H98a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z"
			/>
			<path
				className="d"
				pathLength={1}
				d="M138 6v20a6 6 0 0 0 6 6h20"
				style={at("0.2s")}
			/>
			<path className="d" pathLength={1} d="M104 44h40" style={at("0.4s")} />
			<path className="d" pathLength={1} d="M104 54h48" style={at("0.5s")} />
			<path className="d" pathLength={1} d="M104 64h32" style={at("0.6s")} />
			<rect
				className="d sc-paper"
				pathLength={1}
				x="78"
				y="90"
				width="100"
				height="8"
				rx="4"
				style={at("0.9s")}
			/>
			<rect
				className="bar sc-accent sc-bare"
				x="78"
				y="90"
				width="72"
				height="8"
				rx="4"
				style={at("1.4s")}
			/>
			<text
				className="sc-text f"
				x="128"
				y="116"
				textAnchor="middle"
				style={at("1.6s")}
			>
				Funding target
			</text>
		</>
	);
}

/** Bell that rings, then a "Sponsor interested" chip with an indicator dot. */
function DiscoverScene() {
	return (
		<>
			<g transform="translate(20 22) scale(2.6)">
				<g className="ring">
					<path
						className="d sc-paper sc-thin"
						pathLength={1}
						d="M10.268 21a2 2 0 0 0 3.464 0"
					/>
					<path
						className="d sc-paper sc-thin"
						pathLength={1}
						d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
					/>
				</g>
			</g>
			<g className="slide" style={at("1.1s")}>
				<rect
					className="sc-paper"
					x="84"
					y="40"
					width="168"
					height="42"
					rx="10"
				/>
				<text className="sc-text" x="98" y="66">
					Sponsor interested
				</text>
				<circle
					className="pop sc-accent sc-bare"
					cx="242"
					cy="40"
					r="7"
					style={at("1.4s")}
				/>
			</g>
		</>
	);
}

interface ValueProp {
	Icon: LucideIcon;
	title: string;
	body: string;
	scene: ReactNode;
}

const PROPS: ValueProp[] = [
	{
		Icon: Rocket,
		title: "Showcase your MVP",
		body: "Submit your live demo and public repository for review. A video walkthrough is optional.",
		scene: <MvpScene />,
	},
	{
		Icon: HandCoins,
		title: "Share a thesis proposal",
		body: "Post a proposal PDF and funding target with no application fee.",
		scene: <ThesisScene />,
	},
	{
		Icon: Telescope,
		title: "Get discovered",
		body: "Receive sponsor-interest notifications and view sponsor profiles. You choose whether to follow up.",
		scene: <DiscoverScene />,
	},
];

/**
 * One column. It draws its icon and scene in once it scrolls into view; hovering replays
 * both by remounting them, which restarts their CSS animations from the first frame.
 */
function ValueColumn({ prop, column }: { prop: ValueProp; column: number }) {
	const { Icon, title, body, scene } = prop;
	const ref = useRef<HTMLLIElement>(null);
	const [seen, setSeen] = useState(false);
	const [replay, setReplay] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		// Draws in each time the column scrolls back into view; it resets only once fully off
		// screen, so a small scroll never restarts it mid-way.
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.intersectionRatio >= 0.35) {
					setSeen(true);
				} else if (!entry.isIntersecting) {
					setSeen(false);
				}
			},
			{ threshold: [0, 0.35] },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<li
			ref={ref}
			data-seen={seen || undefined}
			style={{ "--col": column } as CSSProperties}
			onPointerEnter={() => seen && setReplay((n) => n + 1)}
		>
			<Fragment key={`icon-${replay}`}>
				<Icon className="why-icon" aria-hidden="true" />
			</Fragment>
			<h3 className="reveal" style={{ "--i": column } as CSSProperties}>
				{title}
			</h3>
			<p>{body}</p>
			<svg
				key={`scene-${replay}`}
				className="why-scene"
				viewBox="0 0 256 128"
				aria-hidden="true"
				focusable="false"
			>
				{scene}
			</svg>
		</li>
	);
}

/** Display label column + three column-ruled claims, each with a drawn icon and scene. */
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
					{PROPS.map((prop, i) => (
						<ValueColumn key={prop.title} prop={prop} column={i} />
					))}
				</ul>
			</div>
		</section>
	);
}
