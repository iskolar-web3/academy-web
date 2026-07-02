import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "#/components/project/ProjectCard";
import { RECENT_PROJECT_CARDS } from "#/lib/discover/mock";

/**
 * Sponsor home — placeholder. Discovery, saved searches, and deal-flow land in P3/P5.
 */
export const Route = createFileRoute("/sponsor/home")({
	component: SponsorHome,
});

function SponsorHome() {
	return (
		<div>
			<p className="eyebrow mb-2">Scout & back</p>
			<h1 className="text-3xl text-content-heading">Discover student work</h1>
			<p className="mt-2 text-content-soft">
				Browse, filter, and express interest here (P3). Grants and deal-flow in
				P4 · P5.
			</p>

			<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{RECENT_PROJECT_CARDS.slice(0, 3).map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	);
}
