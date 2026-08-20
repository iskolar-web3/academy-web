import {
	type MotionValue,
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef } from "react";
import { SectionHeading } from "#/components/landing/spine";

interface Step {
	n: string;
	title: string;
	body: string;
}

const STEPS: Step[] = [
	{
		n: "01",
		title: "Build & submit",
		body: "Publish with a live demo, repo, and video. Credit your teammates — they confirm before they're shown.",
	},
	{
		n: "02",
		title: "Pass review",
		body: "The Academy team confirms the MVP runs and the purpose is clear. Pass or fail, no scores.",
	},
	{
		n: "03",
		title: "Get seen & funded",
		body: "Published work reaches sponsors to back; starting theses raise grants from the title-proposal stage.",
	},
];

/** Fill window (of the pinned scroll) for each node — the line draws in the gaps between. */
const WINDOW: [number, number][] = [
	[0.08, 0.22],
	[0.38, 0.54],
	[0.68, 0.82],
];

/**
 * A number fills solid over its window; once it's completely full it pops (scale),
 * and only then does a ripple ring expand out — sequenced by scroll position.
 */
function StepNode({
	progress,
	index,
	n,
}: {
	progress: MotionValue<number>;
	index: number;
	n: string;
}) {
	const [start, end] = WINDOW[index];
	const fill = useTransform(progress, [start, end], [0, 1]);
	const fillH = useTransform(fill, (v) => `${v * 100}%`);
	// After the fill completes (at `end`): first pop, then ripple.
	const scale = useTransform(
		progress,
		[end, end + 0.03, end + 0.075],
		[1, 1.2, 1],
	);
	const rippleOpacity = useTransform(
		progress,
		[end + 0.06, end + 0.11, end + 0.18],
		[0, 0.6, 0],
	);
	const rippleScale = useTransform(
		progress,
		[end + 0.06, end + 0.18],
		[1, 2.4],
	);

	return (
		<motion.span className="relative inline-flex" style={{ scale }}>
			<motion.span
				aria-hidden
				className="absolute -inset-1 rounded-full border-2 border-action"
				style={{ opacity: rippleOpacity, scale: rippleScale }}
			/>
			<span className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-action bg-surface-card shadow-[0_6px_18px_rgb(58_82_166/0.16)]">
				<motion.span
					aria-hidden
					className="absolute inset-x-0 bottom-0 bg-action"
					style={{ height: fillH }}
				/>
				<span className="absolute inset-0 z-10 flex items-center justify-center font-mono text-3xl font-semibold text-action/40">
					{n}
				</span>
				<motion.span
					aria-hidden
					className="absolute inset-x-0 bottom-0 z-20 overflow-hidden"
					style={{ height: fillH }}
				>
					<span className="absolute inset-x-0 bottom-0 flex h-24 items-center justify-center font-mono text-3xl font-semibold text-white">
						{n}
					</span>
				</motion.span>
			</span>
		</motion.span>
	);
}

/**
 * Scroll-pinned horizontal timeline. Pins center-screen over a medium track; scrolling
 * fills 01→02→03 (solid) with the connector line advancing to each node in turn.
 */
export function HowItWorks() {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"],
	});
	// Stepped: draw to node 02 (0.5) after 01 fills, hold while 02 fills, then draw to 03.
	const lineFill = useTransform(
		scrollYProgress,
		[0.22, 0.38, 0.54, 0.68],
		[0, 0.5, 0.5, 1],
	);

	return (
		<section ref={ref} className="relative h-auto lg:h-[180vh]">
			<div className="flex items-center py-16 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:py-0">
				<div className="container-page w-full">
					<SectionHeading label="How it works" />
					<div className="relative mt-20">
						{/* Terminal rails — run from each edge into the outer nodes, fading at the ends. */}
						<div
							aria-hidden
							className="absolute top-12 left-0 right-[83.4%] hidden h-0.5 -translate-y-1/2 bg-gradient-to-l from-line to-transparent sm:block"
						/>
						<div
							aria-hidden
							className="absolute top-12 left-[83.4%] right-0 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-line to-transparent sm:block"
						/>
						<div
							aria-hidden
							className="absolute top-12 left-[16.6%] right-[16.6%] hidden h-0.5 -translate-y-1/2 bg-line sm:block"
						/>
						<motion.div
							aria-hidden
							style={{ scaleX: lineFill }}
							className="absolute top-12 left-[16.6%] right-[16.6%] hidden h-0.5 -translate-y-1/2 origin-left bg-action sm:block"
						/>
						<div className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-10">
							{STEPS.map((step, i) => (
								<div
									key={step.n}
									className="flex flex-col items-center text-center"
								>
									{/* Mobile: static filled node (no pinned scroll to drive the fill). */}
									<span className="flex size-24 items-center justify-center rounded-full bg-action font-mono font-semibold text-3xl text-white lg:hidden">
										{step.n}
									</span>
									{/* Desktop: scroll-filled animated node. */}
									<div className="hidden lg:block">
										<StepNode progress={scrollYProgress} index={i} n={step.n} />
									</div>
									<h3 className="mt-8 mb-3 text-3xl text-foreground">
										{step.title}
									</h3>
									<p className="max-w-sm text-lg leading-relaxed text-content-soft">
										{step.body}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
