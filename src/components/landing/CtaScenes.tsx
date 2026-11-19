import {
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
} from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

/** The tick at which scene `k` last became the shown one; a new key restarts its animation. */
function playKey(tick: number, k: number, count: number) {
	return tick - ((((tick - k) % count) + count) % count);
}

interface SceneProps {
	name: string;
	on: boolean;
	run: number;
	children: ReactNode;
}

/** One stacked scene: it fades with `on`, and a new `run` remounts the drawing so it replays. */
function Scene({ name, on, run, children }: SceneProps) {
	return (
		<svg
			className={`cta-scene${on ? " on" : ""}`}
			viewBox="0 0 220 220"
			aria-hidden="true"
			data-scene={name}
		>
			<g key={run}>{children}</g>
		</svg>
	);
}

const PILL = { x: 55, y: 93.75, width: 110, height: 32.5, rx: 16.25 };

/** Cursor arrow glides in and clicks a "Connect" pill, which fills and reads "Connected". */
function OpportunityScene(_: { on: boolean }) {
	return (
		<>
			<g className="op-btn">
				<rect className="op-tint" {...PILL} />
				<rect className="op-solid" {...PILL} />
				<rect className="op-outline" {...PILL} pathLength={1} />
				<g className="op-before">
					<g className="op-icon" transform="translate(70 102.8) scale(0.6)">
						<path d="M2 21a8 8 0 0 1 13.292-6" />
						<circle cx="10" cy="8" r="5" />
						<path d="M19 16v6" />
						<path d="M22 19h-6" />
					</g>
					<text className="op-label" x="92" y="114">
						Connect
					</text>
				</g>
				<g className="op-after">
					<g className="op-icon" transform="translate(70 102.8) scale(0.6)">
						<path d="M20 6 9 17l-5-5" />
					</g>
					<text className="op-label" x="92" y="114">
						Connected
					</text>
				</g>
			</g>
			<rect className="op-ripple" {...PILL} />
			<g transform="translate(158 118)">
				<g className="op-cur-x">
					<g className="op-cur-y">
						<g className="op-cur-dip">
							<path
								className="op-cursor"
								d="M0 0V17L4.5 13L7.5 19.5L10 18.4L7 12H12.5Z"
							/>
						</g>
					</g>
				</g>
			</g>
		</>
	);
}

const HAND = "translate(40 40) scale(5.8333)";
/** Where each hand starts, in viewBox units and degrees. */
const APART = { x: 80, y: 10, rotate: 18 };

type HandshakePhase = "apart" | "solid" | "spark";

/**
 * Lucide's Handshake, split by side. The fly-in runs on framer-motion (JS-driven, like the How
 * it works cursor), then each later step starts only when the one before has finished: the
 * outlined hands glide together and meet, a closed outline traced from the icon slowly fills
 * white beneath them, and finally the handshake squeezes and three sparks pop above.
 */
function SponsorScene({ on }: { on: boolean }) {
	const reduceMotion = useReducedMotion();
	const leftX = useMotionValue(-APART.x);
	const leftY = useMotionValue(APART.y);
	const leftRotate = useMotionValue(-APART.rotate);
	const rightX = useMotionValue(APART.x);
	const rightY = useMotionValue(-APART.y);
	const rightRotate = useMotionValue(APART.rotate);
	const [phase, setPhase] = useState<HandshakePhase>("apart");

	useEffect(() => {
		const values = [leftX, leftY, leftRotate, rightX, rightY, rightRotate];
		if (reduceMotion) {
			for (const value of values) {
				value.set(0);
			}
			setPhase("solid");
			return;
		}
		if (!on) {
			return;
		}
		let cancelled = false;
		const timers: number[] = [];
		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				timers.push(window.setTimeout(resolve, ms));
			});
		const glide = { duration: 1.3, ease: [0.45, 0, 0.2, 1] as const };
		const controls = [] as ReturnType<typeof animate>[];

		const run = async () => {
			await wait(450);
			if (cancelled) {
				return;
			}
			controls.push(...values.map((value) => animate(value, 0, glide)));
			await Promise.all(controls);
			if (cancelled) {
				return;
			}
			setPhase("solid");
			await wait(1100);
			if (!cancelled) {
				setPhase("spark");
			}
		};
		void run();
		return () => {
			cancelled = true;
			for (const id of timers) {
				window.clearTimeout(id);
			}
			for (const control of controls) {
				control.stop();
			}
		};
	}, [on, reduceMotion, leftX, leftY, leftRotate, rightX, rightY, rightRotate]);

	return (
		<g className="sp-squeeze" data-phase={phase}>
			<path
				className="sp-solid"
				transform={HAND}
				d="M3 4H11L10.31 4.69A5.79 5.79 0 0 1 17.37 3.82L17.84 4.1A2 2 0 0 0 19.26 4.35L21 4L21 3L22 14H20L19.5 13.5A2.12 2.12 0 1 1 16.5 16.5L16 16A2.12 2.12 0 1 1 13 19L11.5 17.5A2.12 2.12 0 1 1 8.5 20.5L2 14L3 3Z"
			/>
			<motion.g style={{ x: leftX, y: leftY, rotate: leftRotate }}>
				<g className="sp-icon" transform={HAND}>
					<path d="m11 17 2 2a1 1 0 1 0 3-3" />
					<path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
					<path d="M3 4h8" />
				</g>
			</motion.g>
			<motion.g style={{ x: rightX, y: rightY, rotate: rightRotate }}>
				<g className="sp-icon" transform={HAND}>
					<path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
					<path d="m21 3 1 11h-2" />
				</g>
			</motion.g>
			{/* Above the hands: over the solid white shape they would be invisible. */}
			<path className="sp-spark" d="M114 46V30" pathLength={1} />
			<path className="sp-spark" d="M96 50L86 38" pathLength={1} />
			<path className="sp-spark" d="M132 50L142 38" pathLength={1} />
		</g>
	);
}

const SHORT_STACK = [0, 1, 2];
const TALL_STACK = [0, 1, 2, 3, 4];
const COIN_STEP = 8;
const COIN_BASE_Y = 170;

interface CoinProps {
	cx: number;
	level: number;
	/** Position in the drop order, for the stagger. */
	order: number;
}

/** A flat cylinder seen from the side: a band under an ellipse top with an inner rim. */
function Coin({ cx, level, order }: CoinProps) {
	const y = COIN_BASE_Y - level * COIN_STEP;
	return (
		<g className="gr-coin" style={{ "--n": order } as CSSProperties}>
			<path
				className="gr-face"
				d={`M${cx - 22} ${y}v${COIN_STEP}a22 7 0 0 0 44 0v-${COIN_STEP}`}
			/>
			<ellipse className="gr-face" cx={cx} cy={y} rx="22" ry="7" />
			<ellipse className="gr-rim" cx={cx} cy={y} rx="14" ry="4.2" />
		</g>
	);
}

/** Two coin stacks drop in, then a sprout grows from the taller one and sways. */
function GrantScene(_: { on: boolean }) {
	return (
		<>
			{SHORT_STACK.map((level) => (
				<Coin key={`s${level}`} cx={72} level={level} order={level} />
			))}
			{TALL_STACK.map((level) => (
				<Coin
					key={`t${level}`}
					cx={148}
					level={level}
					order={SHORT_STACK.length + level}
				/>
			))}
			<path
				className="gr-stem"
				d="M148 138C148 124 146 112 148 98"
				pathLength={1}
			/>
			<g className="gr-sway">
				<path
					className="gr-leaf gr-leaf-1"
					d="M148 100C136 100 126 92 124 80C136 80 146 88 148 100Z"
				/>
				<path
					className="gr-leaf gr-leaf-2"
					d="M148 98C160 98 170 90 172 78C160 78 150 86 148 98Z"
				/>
			</g>
		</>
	);
}

interface CtaStageProps {
	/** Index of the scene to show. */
	shown: number;
	/** Count of rotations so far; a scene replays each time it comes back. */
	tick: number;
	/** Freeze every animation (off screen or hidden tab). */
	paused: boolean;
}

const SCENES = [
	{ name: "opportunity", Drawing: OpportunityScene },
	{ name: "sponsor", Drawing: SponsorScene },
	{ name: "grant", Drawing: GrantScene },
];

/** The CTA's right side: one line-art scene per headline word, only the current one visible. */
export function CtaStage({ shown, tick, paused }: CtaStageProps) {
	return (
		<div className={`cta-stage${paused ? " paused" : ""}`} aria-hidden="true">
			{SCENES.map(({ name, Drawing }, k) => (
				<Scene
					key={name}
					name={name}
					on={k === shown}
					run={playKey(tick, k, SCENES.length)}
				>
					<Drawing on={k === shown} />
				</Scene>
			))}
		</div>
	);
}
