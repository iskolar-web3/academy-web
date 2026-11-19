import { motion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { CtaStage } from "#/components/landing/CtaScenes";
import { SignInPopover } from "#/components/landing/SignInPopover";
import { useActive, useMediaMatch } from "#/components/landing/useActive";

const WORDS = ["opportunity", "sponsor", "grant"] as const;
/** Long enough for a scene (about 2.5s) to finish and hold before the next word. */
const ROTATE_MS = 4800;
/** The button starts leaning toward the pointer this close to its edge, in px (4rem). */
const MAGNET_REACH = 64;
const MAGNET_PULL = 0.3;

/** Leans toward the pointer within reach, springing back on leave. Off for touch and reduced motion. */
function MagneticButton({ enabled }: { enabled: boolean }) {
	const ref = useRef<HTMLSpanElement>(null);
	const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
	const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

	useEffect(() => {
		const el = ref.current;
		if (!enabled || !el) {
			return;
		}
		const maxShift =
			0.5 *
			Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		const lean = (value: number) =>
			Math.max(-maxShift, Math.min(maxShift, value * MAGNET_PULL));
		const rest = () => {
			x.set(0);
			y.set(0);
		};
		const onMove = (event: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			// The wrapper is itself displaced, so measure from its resting centre.
			const dx = event.clientX - (rect.left + rect.width / 2 - x.get());
			const dy = event.clientY - (rect.top + rect.height / 2 - y.get());
			const near =
				Math.abs(dx) < rect.width / 2 + MAGNET_REACH &&
				Math.abs(dy) < rect.height / 2 + MAGNET_REACH;
			if (near) {
				x.set(lean(dx));
				y.set(lean(dy));
			} else {
				rest();
			}
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		document.documentElement.addEventListener("pointerleave", rest);
		return () => {
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", rest);
			rest();
		};
	}, [enabled, x, y]);

	return (
		<motion.span className="cta-magnet" ref={ref} style={{ x, y }}>
			<SignInPopover>
				<button type="button" className="lp-btn lp-btn-light">
					Get started
					<ArrowRight className="arr" size={18} aria-hidden="true" />
				</button>
			</SignInPopover>
		</motion.span>
	);
}

/**
 * Closing call to action on the shared blue panel. The headline's last word rolls through
 * opportunity / sponsor / grant while the matching line-art scene plays on the right. The rotation runs only on screen in a visible tab; with reduced
 * motion it stays on "opportunity".
 */
export function LandingCta() {
	const sectionRef = useRef<HTMLElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);
	const active = useActive(sectionRef);
	const reduceMotion = useMediaMatch("(prefers-reduced-motion: reduce)");
	const coarsePointer = useMediaMatch("(pointer: coarse)");
	const [tick, setTick] = useState(0);
	const [widths, setWidths] = useState<number[]>([]);
	const shown = reduceMotion ? 0 : tick % WORDS.length;

	useEffect(() => {
		if (reduceMotion || !active) {
			return;
		}
		const id = window.setInterval(() => setTick((t) => t + 1), ROTATE_MS);
		return () => window.clearInterval(id);
	}, [reduceMotion, active]);

	// The slot animates its width to the current word, so every word is measured once the
	// web font is in and again if the headline's font size changes.
	useEffect(() => {
		const measure = measureRef.current;
		if (!measure) {
			return;
		}
		const read = () =>
			setWidths(
				Array.from(
					measure.children,
					// Rounded up so a fractional glyph edge is never clipped.
					(word) => Math.ceil(word.getBoundingClientRect().width),
				),
			);
		read();
		void document.fonts.ready.then(read);
		const ro = new ResizeObserver(read);
		ro.observe(measure);
		return () => ro.disconnect();
	}, []);

	return (
		<section
			ref={sectionRef}
			className="section compact cta ground-canvas"
			aria-labelledby="cta-title"
		>
			<div className="wrap">
				<div className="lp-panel cta-panel">
					<div className="cta-copy">
						<h2 id="cta-title">
							<span className="sr-only">
								Find your next opportunity on Academy
							</span>
							<span className="cta-line" aria-hidden="true">
								Find your next
							</span>
							<span className="cta-line" aria-hidden="true">
								<span
									className="cta-slot"
									style={
										{
											"--w": widths[shown] ? `${widths[shown]}px` : undefined,
										} as CSSProperties
									}
								>
									{WORDS.map((word, k) => (
										<span
											key={word}
											className="cta-word"
											data-pos={(k - shown + WORDS.length) % WORDS.length}
										>
											{word}
										</span>
									))}
									<span key={shown} className="cta-underline" />
								</span>
								<span className="cta-measure" ref={measureRef}>
									{WORDS.map((word) => (
										<span key={word}>{word}</span>
									))}
								</span>
							</span>
							<span className="cta-line" aria-hidden="true">
								on Academy
							</span>
						</h2>
						<p>
							Showcase a project, share a thesis grant proposal, or discover
							student talent.
						</p>
						<MagneticButton
							enabled={active && !reduceMotion && !coarsePointer}
						/>
					</div>
					<CtaStage shown={shown} tick={tick} paused={!active} />
				</div>
			</div>
		</section>
	);
}
