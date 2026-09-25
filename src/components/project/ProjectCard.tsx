import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

export interface ProjectCardData {
	id: string;
	title: string;
	category: string;
	pitch: string;
	school: string;
	upvotes: number;
	verified?: boolean;
	/** CSS background value for the cover band (gradient or color). */
	cover: string;
}

interface ProjectCardProps {
	project: ProjectCardData;
	/** Teaser cards (visitor landing) let you *feel* the upvote, then nudge to sign in. */
	teaser?: boolean;
}

/** Confetti burst offsets (px) — fixed so SSR and client agree (no Math.random). */
const CONFETTI = [
	{ x: -20, y: -26 },
	{ x: 16, y: -30 },
	{ x: 28, y: -8 },
	{ x: 22, y: 18 },
	{ x: -6, y: 28 },
	{ x: -26, y: 14 },
	{ x: -30, y: -6 },
];
const CONFETTI_COLORS = ["#3a52a6", "#607ef2", "#0fa888", "#7d93ee"];

/**
 * The all-in-one project card atom. Reused across the showcase gallery, profiles,
 * and the landing teaser. In `teaser` mode the upvote is interactive but local-only
 * (resets on reload) — the tooltip points to sign-in, honoring the visitor access rule.
 */
export function ProjectCard({ project, teaser = false }: ProjectCardProps) {
	const reduce = useReducedMotion();
	const [upvoted, setUpvoted] = useState(false);
	const [burst, setBurst] = useState(false);
	const count = project.upvotes + (upvoted ? 1 : 0);

	function toggleUpvote() {
		const next = !upvoted;
		setUpvoted(next);
		if (next && !reduce) {
			setBurst(true);
			window.setTimeout(() => setBurst(false), 700);
		}
	}

	return (
		<div className="h-full">
			<article className="card-surface flex h-full flex-col overflow-hidden transition-colors hover:border-action">
				<div
					className="relative flex h-32 items-start justify-between p-4"
					style={{ background: project.cover }}
				>
					<span className="chip relative bg-[rgba(17,24,39,0.32)] text-white">
						{project.category}
					</span>
				</div>

				<div className="flex flex-1 flex-col p-5">
					<h3 className="mb-2 text-xl leading-tight text-foreground">
						{project.title}
					</h3>

					<p className="mb-4 flex-1 text-base leading-relaxed text-content-soft">
						{project.pitch}
					</p>

					<div className="ruled-line mb-3" />

					<div className="flex items-center justify-between">
						<span className="font-mono text-xs text-content-faint">
							{project.school}
						</span>
						{teaser ? (
							<div className="relative">
								<button
									type="button"
									onClick={toggleUpvote}
									aria-pressed={upvoted}
									title="Sign in to upvote for real"
									className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
										upvoted
											? "border-action bg-action text-on-action"
											: "border-line bg-surface-card text-action hover:bg-surface-tint"
									}`}
								>
									<motion.span
										className="inline-flex"
										animate={upvoted ? { scale: [1, 1.4, 1] } : { scale: 1 }}
										transition={{ duration: 0.3 }}
									>
										<Heart
											className="size-3.5"
											fill={upvoted ? "currentColor" : "none"}
											aria-hidden
										/>
									</motion.span>
									<span className="tabular-nums">{count}</span>
								</button>
								<AnimatePresence>
									{burst &&
										CONFETTI.map((c, i) => (
											<motion.span
												key={`${c.x}:${c.y}`}
												className="pointer-events-none absolute left-3 top-1/2 size-1.5 rounded-full"
												style={{
													background:
														CONFETTI_COLORS[i % CONFETTI_COLORS.length],
												}}
												initial={{ opacity: 1, x: 0, y: 0 }}
												animate={{ opacity: 0, x: c.x, y: c.y }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.7, ease: [0.2, 0.7, 0.3, 1] }}
											/>
										))}
								</AnimatePresence>
							</div>
						) : (
							<button
								type="button"
								className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-card px-3 py-1 font-mono text-xs text-action transition-colors hover:bg-surface-tint"
							>
								<Heart className="size-3.5" aria-hidden /> Upvote! ·{" "}
								{project.upvotes}
							</button>
						)}
					</div>
				</div>
			</article>
		</div>
	);
}
