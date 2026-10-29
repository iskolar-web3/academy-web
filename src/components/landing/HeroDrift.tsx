import { usePublicTeaser } from "#/hooks/discover/usePublicTeaser";
import { BACKEND_URL } from "#/lib/api";
import type { ProjectCardData } from "#/lib/discover/model";

const ROWS = 5;
/** Unique cards per loop; each track renders them twice so translateX(-50%) loops seamlessly. */
const CARDS_PER_LOOP = 6;

function SkeletonCard() {
	return (
		<div className="drift-card">
			<div className="drift-shot" />
			<span className="sk sk-1" />
			<span className="sk sk-2" />
		</div>
	);
}

function ProjectCard({ project }: { project: ProjectCardData }) {
	return (
		<div className="drift-card">
			{project.imageUrl ? (
				<img
					className="drift-shot"
					src={`${BACKEND_URL}${project.imageUrl}`}
					alt=""
					width={200}
					height={125}
					loading="lazy"
					decoding="async"
					fetchPriority="low"
				/>
			) : (
				<div className="drift-shot" />
			)}
			<span className="drift-title">{project.title}</span>
			<span className="drift-school">{project.school}</span>
		</div>
	);
}

/** One loop of a row: the published projects repeated to fill it, offset per row. */
function rowLoop(cards: ProjectCardData[], row: number): ProjectCardData[] {
	return Array.from(
		{ length: CARDS_PER_LOOP },
		(_, i) => cards[(i + row * 2) % cards.length],
	);
}

/**
 * Decorative tilted rows of published projects behind the hero, right of the text column
 * only. Uses the shared teaser (repeating what it has); while loading, on error or with
 * nothing published it renders nameless skeleton cards. Paused off-screen (Hero.tsx),
 * static under reduced motion (CSS).
 */
export function HeroDrift() {
	const { cards } = usePublicTeaser();
	return (
		<div className="hero-drift" aria-hidden="true">
			<div className="drift-plane">
				{Array.from({ length: ROWS }, (_, row) => {
					const loop = cards.length > 0 ? rowLoop(cards, row) : null;
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative rows.
						<div className="drift-row" key={row}>
							<div className="drift-track">
								{Array.from({ length: CARDS_PER_LOOP * 2 }, (_, i) => {
									const project = loop?.[i % CARDS_PER_LOOP];
									return project ? (
										<ProjectCard
											// biome-ignore lint/suspicious/noArrayIndexKey: cards repeat by design.
											key={i}
											project={project}
										/>
									) : (
										// biome-ignore lint/suspicious/noArrayIndexKey: identical skeletons.
										<SkeletonCard key={i} />
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
