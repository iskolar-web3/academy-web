import { motion } from "framer-motion";
import type { ReactNode } from "react";

type From = "up" | "left" | "right";

const OFFSET: Record<From, { x?: number; y?: number }> = {
	up: { y: 28 },
	left: { x: -44 },
	right: { x: 44 },
};

interface RevealProps {
	children: ReactNode;
	className?: string;
	/** Stagger offset in seconds. */
	delay?: number;
	/** Entry direction. */
	from?: From;
}

/**
 * Zooms + fades a block in whenever it scrolls ~30% into view, and back out when it
 * leaves (re-triggers every pass — no `once`). Movement is suppressed for
 * reduced-motion users via the page-level <MotionConfig reducedMotion="user">.
 */
export function Reveal({
	children,
	className,
	delay = 0,
	from = "up",
}: RevealProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, scale: 0.9, ...OFFSET[from] }}
			whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
			viewport={{ amount: 0.3 }}
			transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}
