import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils";

/**
 * Upvote button — the canonical interaction from the design-template DESIGN SYSTEM page:
 * idle is an outlined "♥ Upvote! · N"; on activate it turns solid blue, the heart springs,
 * confetti bursts, and the count ticks. **Controlled** (PLT-08): `upvoted`/`count` come from
 * the server projection and `onToggle` runs the optimistic mutation. Two sizes from the
 * template: `sm` (34px card footer, `upStyle`) and `lg` (46px full-width detail rail,
 * `upStyleLg` — constant label, colors flip only).
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
	upvoted = false,
	onToggle,
	size = "sm",
	title,
}: {
	count: number;
	upvoted?: boolean;
	onToggle?: () => void;
	size?: "sm" | "lg";
	title?: string;
}) {
	const [burst, setBurst] = useState(false);

	function toggle() {
		if (!upvoted) {
			setBurst(true);
			window.setTimeout(() => setBurst(false), 750);
		}
		onToggle?.();
	}

	return (
		<button
			type="button"
			onClick={toggle}
			title={title}
			aria-pressed={upvoted}
			className={cn(
				"relative inline-flex items-center transition-[background-color,color,border-color] duration-200 active:scale-95",
				size === "lg"
					? "h-[46px] w-full justify-center gap-[7px] rounded-[10px] border text-[15px]"
					: "h-[34px] gap-1.5 rounded-[9px] border px-[13px] font-sans text-[13px]",
				upvoted
					? "border-action bg-action text-white"
					: "border-line bg-surface-card text-action hover:bg-surface-tint",
			)}
		>
			<motion.span
				className="inline-flex"
				animate={{ scale: burst ? 1.4 : 1 }}
				transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
			>
				<Heart
					className={size === "lg" ? "size-[17px]" : "size-[15px]"}
					fill={upvoted ? "currentColor" : "none"}
					aria-hidden
				/>
			</motion.span>
			{size === "sm" && upvoted ? (
				<span className="tabular-nums">{count}</span>
			) : (
				<>
					<span>Upvote!</span>
					<span className="tabular-nums">· {count}</span>
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
