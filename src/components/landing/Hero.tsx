import { Link } from "@tanstack/react-router";
import {
	type MotionValue,
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "framer-motion";
import {
	BookOpen,
	GraduationCap,
	Lightbulb,
	type LucideIcon,
} from "lucide-react";

interface Glyph {
	Icon: LucideIcon;
	className: string;
	size: number;
	/** Parallax travel in px; sign sets direction. */
	depth: number;
}

const BACKDROP: Glyph[] = [
	{ Icon: GraduationCap, className: "left-[6%] top-24", size: 54, depth: 26 },
	{ Icon: Lightbulb, className: "right-[8%] top-32", size: 44, depth: -22 },
	{ Icon: BookOpen, className: "left-[16%] top-72", size: 46, depth: 20 },
];

function ParallaxGlyph({
	mx,
	my,
	glyph,
	index,
}: {
	mx: MotionValue<number>;
	my: MotionValue<number>;
	glyph: Glyph;
	index: number;
}) {
	const x = useTransform(mx, (v) => v * glyph.depth);
	const y = useTransform(my, (v) => v * glyph.depth * 0.6);
	const { Icon } = glyph;
	return (
		<motion.span
			style={{ x, y, animationDelay: `${-index * 1.4}s` }}
			className={`absolute animate-float text-action/10 ${glyph.className}`}
		>
			<Icon
				style={{ width: glyph.size, height: glyph.size }}
				strokeWidth={1.3}
			/>
		</motion.span>
	);
}

export function Hero() {
	const reduce = useReducedMotion();
	const mxRaw = useMotionValue(0);
	const myRaw = useMotionValue(0);
	const mx = useSpring(mxRaw, { stiffness: 90, damping: 20 });
	const my = useSpring(myRaw, { stiffness: 90, damping: 20 });

	// Kinetic headline (motion.zajno.com feel): each line shears/leans with the cursor,
	// in opposite directions, so the type "waves" as you move the mouse.
	const skewTop = useTransform(mx, [-0.5, 0.5], [6, -6]);
	const skewBottom = useTransform(mx, [-0.5, 0.5], [-6, 6]);
	const shiftTopX = useTransform(mx, [-0.5, 0.5], [-18, 18]);
	const shiftBottomX = useTransform(mx, [-0.5, 0.5], [18, -18]);
	const shiftTopY = useTransform(my, [-0.5, 0.5], [-10, 10]);
	const shiftBottomY = useTransform(my, [-0.5, 0.5], [10, -10]);

	function onMove(e: React.MouseEvent<HTMLElement>) {
		if (reduce) return;
		mxRaw.set(e.clientX / window.innerWidth - 0.5);
		myRaw.set(e.clientY / window.innerHeight - 0.5);
	}

	function onLeave() {
		mxRaw.set(0);
		myRaw.set(0);
	}

	return (
		<section
			className="relative overflow-hidden"
			onMouseMove={onMove}
			onMouseLeave={onLeave}
		>
			<div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
				{BACKDROP.map((glyph, i) => (
					<ParallaxGlyph
						key={glyph.className}
						mx={mx}
						my={my}
						glyph={glyph}
						index={i}
					/>
				))}
			</div>

			<div className="container-page relative z-10 grid items-center gap-12 pt-16 pb-14 sm:pt-24 lg:grid-cols-[1.05fr_.95fr]">
				<div className="order-2 animate-fade-up lg:order-1">
					<div className="mb-5 flex items-center gap-4">
						<span className="h-[3px] w-14 rounded-full bg-content-faint" />
						<span className="font-mono text-lg font-semibold uppercase tracking-[0.22em] text-content-faint">
							A subsidiary of iSkolar
						</span>
					</div>

					<h1 className="text-balance text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[5.25rem]">
						<motion.span
							className="block origin-left will-change-transform"
							style={{ skewX: skewTop, x: shiftTopX, y: shiftTopY }}
						>
							<span className="block overflow-hidden pb-[0.08em]">
								<span className="mask-reveal block">Student work, built</span>
							</span>
						</motion.span>
						<motion.span
							className="block origin-left will-change-transform"
							style={{ skewX: skewBottom, x: shiftBottomX, y: shiftBottomY }}
						>
							<span className="block overflow-hidden pb-[0.08em]">
								<span className="mask-reveal mask-reveal-2 block">
									to be{" "}
									<span className="relative inline-block whitespace-nowrap px-3 text-on-action">
										<motion.span
											className="absolute inset-0 origin-left rounded-lg bg-action"
											initial={{ scaleX: 0, rotate: -1.5 }}
											animate={{ scaleX: 1, rotate: -1.5 }}
											transition={{
												duration: 0.5,
												delay: 0.6,
												ease: [0.2, 0.8, 0.25, 1],
											}}
										/>
										<span className="relative">seen</span>
									</span>{" "}
									&amp; funded.
								</span>
							</span>
						</motion.span>
					</h1>

					<p className="mt-8 max-w-2xl text-lg leading-relaxed text-content-strong sm:text-2xl">
						Showcase your built MVPs, fund starting theses with grants, and
						connect with investors who scout real student projects — on the
						platform that runs with academic integrity.
					</p>

					<div className="mt-10 flex flex-wrap items-center gap-4">
						<Link to="/login" className="btn btn-primary h-14 px-9 text-lg">
							Sign in with iSkolar
						</Link>
						<button
							type="button"
							className="btn btn-secondary h-14 px-9 text-lg"
						>
							Browse the showcase
						</button>
					</div>
				</div>

				<div className="order-1 relative flex animate-fade-up flex-col items-center justify-center lg:order-2">
					<div className="absolute top-0 size-64 rounded-full bg-[radial-gradient(circle,rgba(96,121,232,0.18),transparent_68%)] sm:size-[26rem]" />
					<img
						src="/logo-academy.png"
						alt="iSkolar Academy"
						className="relative max-h-64 w-auto animate-float sm:max-h-[26rem]"
					/>
					<div className="relative mt-3 flex items-center gap-3.5">
						<span className="h-0.5 w-12 bg-action/40" />
						<span className="text-xl uppercase tracking-[0.42em] text-action">
							Academy
						</span>
						<span className="h-0.5 w-12 bg-action/40" />
					</div>
				</div>
			</div>
		</section>
	);
}
