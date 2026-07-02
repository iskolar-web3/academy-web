import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

/**
 * Upvote button — the canonical interaction from the design-template DESIGN SYSTEM page:
 * idle is an outlined "♥ Upvote! · N"; on activate it turns solid blue, the heart springs,
 * confetti bursts, the count ticks, and the "Upvote!" label collapses to just the count.
 * Local-only for now (resets on reload); real persistence lands in P3.
 */

/** Fixed confetti offsets (px) so SSR and client agree — no Math.random in render. */
const CONFETTI = [
	{ x: 0, y: -34 },
	{ x: 24, y: -26 },
	{ x: 34, y: -4 },
	{ x: 26, y: 22 },
	{ x: 2, y: 34 },
	{ x: -24, y: 24 },
	{ x: -34, y: 2 },
	{ x: -24, y: -24 },
	{ x: 14, y: -30 },
	{ x: 30, y: 10 },
	{ x: -14, y: 30 },
	{ x: -30, y: -10 },
];
const CONFETTI_COLORS = [
	"#3a52a6",
	"#607ef2",
	"#0fa888",
	"#3f58b2",
	"#1f2a52",
	"#7d93ee",
];

export function UpvoteButton({
	count,
	title,
}: {
	count: number;
	title?: string;
}) {
	const [upvoted, setUpvoted] = useState(false);
	const [burst, setBurst] = useState(false);
	const total = count + (upvoted ? 1 : 0);

	function toggle() {
		const next = !upvoted;
		setUpvoted(next);
		if (next) {
			setBurst(true);
			window.setTimeout(() => setBurst(false), 750);
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			title={title}
			aria-pressed={upvoted}
			className={`relative inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border px-[13px] font-sans text-[13px] transition-[background-color,color,border-color] duration-200 active:scale-95 ${
				upvoted
					? "border-action bg-action text-white"
					: "border-line bg-surface-card text-action hover:bg-surface-tint"
			}`}
		>
			<motion.span
				className="inline-flex"
				animate={{ scale: burst ? 1.4 : 1 }}
				transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
			>
				<Heart
					className="size-[15px]"
					fill={upvoted ? "currentColor" : "none"}
					aria-hidden
				/>
			</motion.span>
			{upvoted ? (
				<span className="tabular-nums">{total}</span>
			) : (
				<>
					<span>Upvote!</span>
					<span className="tabular-nums">· {total}</span>
				</>
			)}

			<AnimatePresence>
				{burst
					? CONFETTI.map((c, i) => (
							<motion.span
								key={`${c.x}:${c.y}`}
								className="pointer-events-none absolute top-1/2 left-[18px] size-1.5 rounded-[2px]"
								style={{
									background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
								}}
								initial={{ opacity: 1, x: 0, y: 0 }}
								animate={{ opacity: 0, x: c.x, y: c.y }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
							/>
						))
					: null}
			</AnimatePresence>
		</button>
	);
}
