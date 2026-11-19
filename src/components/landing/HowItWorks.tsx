import {
	animate,
	type MotionValue,
	motion,
	useMotionValue,
} from "framer-motion";
import { Check, Grab, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	AVATAR_COUNT,
	type CardRefs,
	type CardView,
	DEMO_URL,
	JourneyCard,
	REPO_URL,
} from "#/components/landing/JourneyCard";
import { useActive, useMediaMatch } from "#/components/landing/useActive";

interface Step {
	n: string;
	title: string;
	body: string;
}

const STEPS: Step[] = [
	{
		n: "01",
		title: "Submit your work",
		body: "Add a live demo, public repository, and project details. Declare ownership and attach any required supporting document.",
	},
	{
		n: "02",
		title: "Get reviewed",
		body: "Academy reviews your demo, repository, and project details. If changes are requested, update and resubmit.",
	},
	{
		n: "03",
		title: "Reach supporters",
		body: "Approved projects appear in Discover, where signed-in sponsors can explore your work and express interest.",
	},
];

/** The animated journey needs room and motion; everything else gets the static cards. */
const LIVE_QUERY =
	"(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const EASE = [0.22, 1, 0.36, 1] as const;
const TYPE_MS = 55;
const CANCELLED = Symbol("cancelled");

interface Scene extends CardView {
	/** Stops that show a check (0–3). */
	nodes: number;
	grab: boolean;
	/** The cursor is mid-click (dipped). */
	click: boolean;
	cursor: boolean;
	fade: boolean;
	/** The sequence has finished and holds its final state. */
	done: boolean;
}

const BLANK: Scene = {
	stage: 0,
	checks: 0,
	stamp: false,
	avatars: 0,
	toast: false,
	pressed: false,
	submitted: false,
	nodes: 0,
	grab: false,
	click: false,
	cursor: false,
	fade: false,
	done: false,
};

/** The final frame of each step, shown by the static cards. */
const END_SCENES: Scene[] = [
	{ ...BLANK, nodes: 1 },
	{ ...BLANK, stage: 1, checks: 3, stamp: true, submitted: true, nodes: 2 },
	{
		...BLANK,
		stage: 2,
		avatars: AVATAR_COUNT,
		toast: true,
		submitted: true,
		nodes: 3,
	},
];

interface Point {
	x: number;
	y: number;
}

interface StageElements {
	stage: HTMLElement;
	mover: HTMLElement;
	demoField: HTMLElement;
	demoText: HTMLElement;
	repoField: HTMLElement;
	repoText: HTMLElement;
	submit: HTMLElement;
}

interface StageMotion {
	/** Card x (px, stage space). */
	x: MotionValue<number>;
	/** Cursor position (px, stage space). */
	cx: MotionValue<number>;
	cy: MotionValue<number>;
	/** Track fill, 0 → 1 across the two segments. */
	fill: MotionValue<number>;
}

interface Journey {
	stop: () => void;
	/** Play the sequence once and hold its final state. */
	start: () => void;
}

/**
 * Builds the one-shot cursor sequence for the stage. Every wait goes through `sleep` or
 * `play`, which reject once the run is cancelled, so a resize, a replay or leaving the
 * screen ends the sequence mid-step with nothing left running.
 */
function createJourney(
	els: StageElements,
	mv: StageMotion,
	setScene: (patch: Partial<Scene>) => void,
): Journey {
	let abort: Promise<never>;
	let cancel: () => void = () => {};
	const playing = new Set<{ stop: () => void }>();

	const newRun = () => {
		abort = new Promise<never>((_, reject) => {
			cancel = () => reject(CANCELLED);
		});
		abort.catch(() => {});
	};
	newRun();

	const stop = () => {
		cancel();
		for (const controls of playing) {
			controls.stop();
		}
		playing.clear();
		newRun();
	};
	const until = <T,>(work: PromiseLike<T>) =>
		Promise.race([work, abort]) as Promise<T>;
	const sleep = (ms: number) =>
		until(new Promise<void>((resolve) => setTimeout(resolve, ms)));
	const play = (value: MotionValue<number>, to: number, seconds: number) => {
		const controls = animate(value, to, { duration: seconds, ease: EASE });
		playing.add(controls);
		return until(
			new Promise<void>((resolve) => controls.then(() => resolve())),
		);
	};

	// Re-measured at the start of every run, once the card is back in its form state.
	let stageSize = { width: 0, height: 0 };
	let moverWidth = 0;
	let moverTop = 0;
	let stops: number[] = [0, 0, 0];
	const measure = () => {
		const stage = els.stage.getBoundingClientRect();
		const mover = els.mover.getBoundingClientRect();
		stageSize = { width: stage.width, height: stage.height };
		moverWidth = mover.width;
		moverTop = mover.top - stage.top;
		stops = [0, 1, 2].map(
			(i) => (stage.width * (2 * i + 1)) / 6 - mover.width / 2,
		);
	};
	measure();

	/** A point inside `el`, in stage space, from fresh rects. */
	const pointIn = (el: HTMLElement, at: Point): Point => {
		const stage = els.stage.getBoundingClientRect();
		const rect = el.getBoundingClientRect();
		return {
			x: rect.left - stage.left + rect.width * at.x,
			y: rect.top - stage.top + rect.height * at.y,
		};
	};
	const fieldAt = { x: 0.35, y: 0.72 };
	const demoPoint = () => pointIn(els.demoField, fieldAt);
	const repoPoint = () => pointIn(els.repoField, fieldAt);
	const submitPoint = () => pointIn(els.submit, { x: 0.5, y: 0.5 });
	const grabPoint = (at: number): Point => ({
		x: stops[at] + moverWidth * 0.5,
		y: moverTop + 44,
	});

	const fillTexts = (filled: boolean) => {
		els.demoText.textContent = filled ? DEMO_URL : "";
		els.repoText.textContent = filled ? REPO_URL : "";
	};
	const placeCursor = (point: Point) => {
		mv.cx.set(point.x);
		mv.cy.set(point.y);
	};
	const moveCursor = (point: Point, seconds: number) =>
		Promise.all([play(mv.cx, point.x, seconds), play(mv.cy, point.y, seconds)]);

	const typeInto = async (
		field: HTMLElement,
		text: HTMLElement,
		value: string,
	) => {
		field.toggleAttribute("data-typing", true);
		for (let i = 1; i <= value.length; i++) {
			text.textContent = value.slice(0, i);
			await sleep(TYPE_MS);
		}
		field.toggleAttribute("data-typing", false);
	};

	/** Press the card, then carry it to the next stop with the track filling alongside. */
	const drag = async (from: 0 | 1) => {
		const to = from + 1;
		await moveCursor(grabPoint(from), 0.6);
		setScene({ grab: true });
		await sleep(220);
		await Promise.all([
			play(mv.x, stops[to], 1.1),
			play(mv.cx, mv.cx.get() + stops[to] - stops[from], 1.1),
			play(mv.fill, to / 2, 1.1),
		]);
		setScene({ grab: false, stage: to as 1 | 2 });
		await sleep(350);
	};

	const draft = async () => {
		await sleep(500);
		await moveCursor(demoPoint(), 0.8);
		await typeInto(els.demoField, els.demoText, DEMO_URL);
		await moveCursor(repoPoint(), 0.5);
		await typeInto(els.repoField, els.repoText, REPO_URL);
		await moveCursor(submitPoint(), 0.6);
		await sleep(200);
		// The click: the cursor dips and the button presses, then confirms.
		setScene({ click: true, pressed: true });
		await sleep(120);
		setScene({ click: false });
		await sleep(100);
		setScene({ pressed: false, submitted: true, nodes: 1 });
		await sleep(800);
		await drag(0);
	};

	const review = async () => {
		await sleep(300);
		for (const checks of [1, 2, 3]) {
			setScene({ checks });
			await sleep(650);
		}
		await sleep(150);
		setScene({ stamp: true });
		await sleep(750);
		setScene({ nodes: 2 });
		await sleep(600);
		// The checks stay behind (they would hang off the card's edge at the last stop), and the
		// stamp lifts before the drag so it never sits over the card while it turns into the preview.
		setScene({ checks: 0, stamp: false });
		await sleep(300);
		await drag(1);
	};

	const publish = async () => {
		setScene({ cursor: false });
		await sleep(450);
		for (let avatars = 1; avatars <= AVATAR_COUNT; avatars++) {
			setScene({ avatars });
			await sleep(170);
		}
		await sleep(200);
		setScene({ toast: true });
		await sleep(600);
		setScene({ nodes: 3 });
		await sleep(500);
		setScene({ done: true });
	};

	/** The reset: hidden, form state, then measured and revealed. */
	const prepare = async () => {
		setScene({ ...BLANK, fade: true });
		fillTexts(false);
		mv.x.set(stops[0]);
		mv.fill.set(0);
		placeCursor({ x: stageSize.width * 0.5, y: stageSize.height * 0.95 });
		await sleep(120);
		measure();
		mv.x.set(stops[0]);
		placeCursor({ x: stageSize.width * 0.5, y: stageSize.height * 0.95 });
		setScene({ ...BLANK, cursor: true });
	};

	const run = async () => {
		try {
			await prepare();
			await draft();
			await review();
			await publish();
		} catch (reason) {
			if (reason !== CANCELLED) {
				throw reason;
			}
		}
	};

	return {
		stop,
		start() {
			stop();
			void run();
		},
	};
}

/**
 * "Project journey": a mini project card travels along a three-stop track while a guided
 * cursor fills the form, submits, drags it through review and into Discover. It plays
 * once, holds the published state, and restarts when it re-enters the screen or when the
 * replay button is pressed. Below 1024px, or with reduced motion, each step shows its own
 * static card instead (CSS swaps the two).
 */
export function HowItWorks() {
	const rootRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const moverRef = useRef<HTMLDivElement>(null);
	const demoField = useRef<HTMLDivElement>(null);
	const demoText = useRef<HTMLSpanElement>(null);
	const repoField = useRef<HTMLDivElement>(null);
	const repoText = useRef<HTMLSpanElement>(null);
	const submit = useRef<HTMLSpanElement>(null);
	const journeyRef = useRef<Journey | null>(null);
	const replayRef = useRef<(() => void) | null>(null);

	const x = useMotionValue(0);
	const cx = useMotionValue(0);
	const cy = useMotionValue(0);
	const fill = useMotionValue(0);

	const [scene, setSceneState] = useState<Scene>(BLANK);
	const live = useMediaMatch(LIVE_QUERY);
	const active = useActive(rootRef);

	useEffect(() => {
		const stage = stageRef.current;
		const mover = moverRef.current;
		const els =
			stage &&
			mover &&
			demoField.current &&
			demoText.current &&
			repoField.current &&
			repoText.current &&
			submit.current
				? {
						stage,
						mover,
						demoField: demoField.current,
						demoText: demoText.current,
						repoField: repoField.current,
						repoText: repoText.current,
						submit: submit.current,
					}
				: null;
		if (!live || !active || !els) {
			return;
		}
		const setScene = (patch: Partial<Scene>) =>
			setSceneState((current) => ({ ...current, ...patch }));
		let replayTimer = 0;
		const begin = () => {
			journeyRef.current?.stop();
			const journey = createJourney(els, { x, cx, cy, fill }, setScene);
			journeyRef.current = journey;
			journey.start();
		};
		begin();
		// Fade the finished scene out first so the reset isn't seen.
		replayRef.current = () => {
			setScene({ done: false, fade: true });
			window.clearTimeout(replayTimer);
			replayTimer = window.setTimeout(begin, 500);
		};

		let resizeTimer = 0;
		let measured = false;
		const ro = new ResizeObserver(() => {
			// The first callback only reports the initial size.
			if (!measured) {
				measured = true;
				return;
			}
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(begin, 150);
		});
		ro.observe(els.stage);

		return () => {
			ro.disconnect();
			window.clearTimeout(resizeTimer);
			window.clearTimeout(replayTimer);
			replayRef.current = null;
			journeyRef.current?.stop();
			journeyRef.current = null;
			setSceneState(BLANK);
		};
	}, [live, active, x, cx, cy, fill]);

	const refs: CardRefs = {
		demoField,
		demoText,
		repoField,
		repoText,
		submit,
	};

	return (
		<section
			className="section ground-paper ground-dots"
			id="how"
			aria-labelledby="how-title"
		>
			<div className="wrap">
				<div className="head">
					<span className="rule reveal" />
					<h2 id="how-title" className="display reveal">
						How projects get published
					</h2>
				</div>
				<div
					className="hj"
					ref={rootRef}
					data-live={live}
					data-fade={scene.fade}
				>
					<div className="hj-stage" ref={stageRef} aria-hidden="true">
						<motion.div className="hj-mover" ref={moverRef} style={{ x }}>
							<JourneyCard view={scene} refs={refs} />
						</motion.div>
						<motion.div
							className="hj-cursor"
							style={{ x: cx, y: cy }}
							data-on={scene.cursor}
							data-grab={scene.grab}
							data-click={scene.click}
						>
							<svg
								className="hj-arrow"
								viewBox="0 0 24 24"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M3 2l16 7.5-6.5 2.2L9.5 19z" />
							</svg>
							<Grab className="hj-grab" />
							<span className="hj-chip">You</span>
						</motion.div>
					</div>
					{live ? (
						<button
							type="button"
							className="hj-replay"
							data-on={scene.done}
							aria-label="Replay animation"
							onClick={() => replayRef.current?.()}
						>
							<RotateCcw aria-hidden="true" />
						</button>
					) : null}
					<div className="hj-track" aria-hidden="true">
						<span className="hj-line" />
						<motion.span className="hj-fill" style={{ scaleX: fill }} />
						{STEPS.map((step, i) => (
							<span
								key={step.n}
								className="hj-node"
								style={{ left: `${((2 * i + 1) / 6) * 100}%` }}
								data-done={scene.nodes > i}
								data-active={live && scene.stage === i}
							>
								<Check strokeWidth={3} />
							</span>
						))}
					</div>
					<ol className="hj-steps">
						{STEPS.map((step, i) => (
							<li
								key={step.n}
								className="hj-step"
								data-active={!live || scene.stage === i}
							>
								<div className="hj-static" aria-hidden="true">
									<JourneyCard view={END_SCENES[i]} />
								</div>
								<span className="num" aria-hidden="true">
									{step.n}
								</span>
								<h3>{step.title}</h3>
								<p>{step.body}</p>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
