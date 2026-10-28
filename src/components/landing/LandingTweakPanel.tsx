import { type RefObject, useId, useState } from "react";

/**
 * DEV ONLY. Port of the template's `?dev` tweak panel: sliders/pickers that write the
 * landing's CSS variables (on the `.lp` root; scrollbar ones on <html>) and a few
 * data-attribute switches. Loaded through an `import.meta.env.DEV`-guarded lazy import
 * in the landing route, so production bundles never contain or render it.
 */

type Tweak =
	| {
			type: "range";
			v: string;
			label: string;
			min: number;
			max: number;
			step?: number;
			unit?: string;
	  }
	| { type: "color"; v: string; label: string }
	| { type: "select"; v: string; label: string; options: [string, string][] }
	| { type: "attr"; attr: string; label: string; options: [string, string][] };

const TWEAKS: Tweak[] = [
	{
		type: "range",
		v: "--hero-dot",
		label: "Hero dot size (radius px; footer stays 1px)",
		min: 0.5,
		max: 4,
		step: 0.25,
		unit: "px",
	},
	{
		type: "range",
		v: "--card-tint",
		label: "Hero card tint (blue strength)",
		min: 0.04,
		max: 0.35,
		step: 0.01,
	},
	{
		type: "range",
		v: "--sb-w",
		label: "Scrollbar width (px; thumb = width - 2)",
		min: 3,
		max: 12,
		unit: "px",
	},
	{ type: "color", v: "--sb-color", label: "Scrollbar thumb colour" },
	{
		type: "range",
		v: "--sb-alpha",
		label: "Scrollbar thumb strength",
		min: 0.1,
		max: 0.6,
		step: 0.02,
	},
	{
		type: "range",
		v: "--card-side-1440",
		label: "Card area each side of A at 1440 (px)",
		min: 40,
		max: 400,
		step: 5,
	},
	{
		type: "range",
		v: "--card-side-1920",
		label: "Card area each side of A at 1920 (px)",
		min: 40,
		max: 500,
		step: 5,
	},
	{
		type: "range",
		v: "--drift-gap",
		label: "Min gap between text and carousel (px)",
		min: 0,
		max: 120,
		step: 2,
		unit: "px",
	},
	{
		type: "range",
		v: "--drift-fade",
		label: "Carousel left-edge fade (px)",
		min: 0,
		max: 200,
		step: 4,
		unit: "px",
	},
	{
		type: "range",
		v: "--drift-blur",
		label: "Hero drift blur (px)",
		min: 0,
		max: 6,
		step: 0.5,
		unit: "px",
	},
	{
		type: "range",
		v: "--drift-speed",
		label: "Hero drift loop (s)",
		min: 20,
		max: 160,
		step: 5,
		unit: "s",
	},
	{
		type: "range",
		v: "--drift-tilt",
		label: "Hero drift tilt (deg)",
		min: -15,
		max: 15,
		step: 0.5,
		unit: "deg",
	},
	{
		type: "attr",
		attr: "driftrows",
		label: "Hero drift rows",
		options: [
			["5", "5"],
			["3", "3"],
			["1", "1"],
		],
	},
	{
		type: "range",
		v: "--dot-alpha",
		label: "Dot grid strength (hero + footer)",
		min: 0,
		max: 0.5,
		step: 0.01,
	},
	{
		type: "range",
		v: "--wordmark-alpha",
		label: "Footer wordmark strength",
		min: 0,
		max: 0.2,
		step: 0.005,
	},
	{
		type: "range",
		v: "--hero-vw",
		label: "Headline fluid size (vw)",
		min: 3,
		max: 7,
		step: 0.1,
	},
	{
		type: "range",
		v: "--hero-max",
		label: "Headline ceiling (rem)",
		min: 3,
		max: 7,
		step: 0.25,
		unit: "rem",
	},
	{
		type: "range",
		v: "--mark-size",
		label: "A mark height (svh)",
		min: 20,
		max: 70,
		unit: "svh",
	},
	{ type: "color", v: "--accent", label: "Accent colour" },
	{ type: "color", v: "--canvas", label: "Canvas ground" },
	{ type: "color", v: "--paper", label: "White ground" },
	{ type: "color", v: "--navy", label: "Navy ground (partners, CTA)" },
	{
		type: "range",
		v: "--section-min",
		label: "Section min-height (svh, desktop)",
		min: 0,
		max: 120,
		unit: "svh",
	},
	{
		type: "range",
		v: "--section-min-compact",
		label: "Compact section min-height (svh, desktop: partners, why)",
		min: 0,
		max: 100,
		unit: "svh",
	},
	{
		type: "range",
		v: "--section-pad",
		label: "Section padding (px)",
		min: 48,
		max: 200,
		step: 4,
		unit: "px",
	},
	{ type: "color", v: "--panel-tint", label: "Partner CTA panel tint" },
	{ type: "color", v: "--panel-border", label: "Partner CTA panel border" },
	{
		type: "range",
		v: "--panel-border-w",
		label: "Partner CTA border width (px)",
		min: 0,
		max: 4,
		unit: "px",
	},
	{
		type: "range",
		v: "--icon-size",
		label: "Why icon size (px)",
		min: 16,
		max: 64,
		unit: "px",
	},
	{
		type: "range",
		v: "--icon-stroke",
		label: "Why icon stroke",
		min: 0.75,
		max: 2.5,
		step: 0.05,
	},
	{ type: "color", v: "--icon-color", label: "Why icon colour" },
	{
		type: "range",
		v: "--logo-area",
		label: "Logo target area (px squared)",
		min: 4000,
		max: 20000,
		step: 250,
	},
	{
		type: "range",
		v: "--disc",
		label: "Round logo disc (px)",
		min: 72,
		max: 140,
		step: 2,
		unit: "px",
	},
	{
		type: "range",
		v: "--logo-opacity",
		label: "Logo resting opacity",
		min: 0.5,
		max: 1,
		step: 0.02,
	},
	{
		type: "range",
		v: "--step-dim",
		label: "Inactive step opacity",
		min: 0.1,
		max: 1,
		step: 0.02,
	},
	{
		type: "range",
		v: "--word-dim",
		label: "CTA word start opacity",
		min: 0.1,
		max: 1,
		step: 0.02,
	},
	{
		type: "range",
		v: "--dur-reveal",
		label: "Reveal duration (ms)",
		min: 0,
		max: 1400,
		step: 20,
		unit: "ms",
	},
	{
		type: "range",
		v: "--dur-rule",
		label: "Rule draw duration (ms)",
		min: 0,
		max: 2000,
		step: 20,
		unit: "ms",
	},
	{
		type: "range",
		v: "--dur-hover",
		label: "Hover duration (ms), elaya: >= 200",
		min: 0,
		max: 600,
		step: 10,
		unit: "ms",
	},
	{
		type: "range",
		v: "--stagger",
		label: "Stagger step (ms)",
		min: 0,
		max: 200,
		step: 5,
		unit: "ms",
	},
	{
		type: "range",
		v: "--reveal-distance",
		label: "Reveal travel (px), elaya 32",
		min: 0,
		max: 64,
		unit: "px",
	},
	{
		type: "attr",
		attr: "revealexit",
		label: "Reveal on exit",
		options: [
			["on (two-way)", "on"],
			["off (reveal once)", "off"],
		],
	},
	{
		type: "range",
		v: "--reveal-blur",
		label: "Reveal blur (px), editorial bans blur",
		min: 0,
		max: 12,
		step: 0.5,
		unit: "px",
	},
	{
		type: "select",
		v: "--ease-out",
		label: "Easing",
		options: [
			["elaya base", "cubic-bezier(0.22, 1, 0.36, 1)"],
			["strong ease-out (emil)", "cubic-bezier(0.23, 1, 0.32, 1)"],
			["drawer (Ionic)", "cubic-bezier(0.32, 0.72, 0, 1)"],
			["brand pill", "cubic-bezier(0.2, 0.8, 0.25, 1)"],
		],
	},
];

/** Scrollbar variables style the page scrollbar, so they live on <html>. */
function targetOf(root: HTMLElement, v: string): HTMLElement {
	return v.startsWith("--sb-") ? document.documentElement : root;
}

function readVar(root: HTMLElement, v: string): string {
	return getComputedStyle(targetOf(root, v)).getPropertyValue(v).trim();
}

function initialValue(tweak: Tweak, root: HTMLElement): string {
	if (tweak.type === "attr") {
		return root.dataset[tweak.attr] ?? tweak.options[0][1];
	}
	const current = readVar(root, tweak.v);
	if (tweak.type === "range") {
		return String(Number.parseFloat(current) || tweak.min);
	}
	return current;
}

function TweakRow({ tweak, root }: { tweak: Tweak; root: HTMLElement }) {
	const [value, setValue] = useState(() => initialValue(tweak, root));
	const id = useId();

	const apply = (next: string) => {
		setValue(next);
		if (tweak.type === "attr") {
			root.dataset[tweak.attr] = next;
			return;
		}
		const css = tweak.type === "range" ? `${next}${tweak.unit ?? ""}` : next;
		targetOf(root, tweak.v).style.setProperty(tweak.v, css);
	};

	return (
		<div className="tw-row">
			<label htmlFor={id}>{tweak.label}</label>
			{tweak.type === "range" ? (
				<>
					<input
						id={id}
						type="range"
						min={tweak.min}
						max={tweak.max}
						step={tweak.step ?? 1}
						value={value}
						onChange={(e) => apply(e.target.value)}
					/>
					<output htmlFor={id}>
						{value}
						{tweak.unit}
					</output>
				</>
			) : tweak.type === "color" ? (
				<input
					id={id}
					type="color"
					value={value || "#000000"}
					onChange={(e) => apply(e.target.value)}
				/>
			) : (
				<select id={id} value={value} onChange={(e) => apply(e.target.value)}>
					{tweak.options.map(([name, optionValue]) => (
						<option key={optionValue} value={optionValue}>
							{name}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

export default function LandingTweakPanel({
	rootRef,
}: {
	rootRef: RefObject<HTMLElement | null>;
}) {
	const [open, setOpen] = useState(true);
	const [copied, setCopied] = useState(false);
	const root = rootRef.current;
	if (!open || !root) {
		return null;
	}

	const copyCss = () => {
		const lines = TWEAKS.flatMap((t) =>
			t.type === "attr" ? [] : [`\t${t.v}: ${readVar(root, t.v)};`],
		);
		navigator.clipboard?.writeText(`.lp {\n${lines.join("\n")}\n}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 1200);
	};

	return (
		<aside className="lp-tweaks" aria-label="Design tweaks (dev only)">
			<header>
				<strong>Tweaks</strong>
				<span>dev only</span>
				<button type="button" onClick={copyCss}>
					{copied ? "Copied" : "Copy CSS"}
				</button>
				<button
					type="button"
					aria-label="Hide panel"
					onClick={() => setOpen(false)}
				>
					×
				</button>
			</header>
			<div className="tw-body">
				{TWEAKS.map((tweak) => (
					<TweakRow
						key={tweak.type === "attr" ? tweak.attr : tweak.v}
						tweak={tweak}
						root={root}
					/>
				))}
			</div>
		</aside>
	);
}
