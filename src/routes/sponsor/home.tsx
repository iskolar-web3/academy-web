import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "#/components/project/ProjectCard";
import { publicTeaserQuery } from "#/lib/discover/api";
import { toProjectCardData } from "#/lib/discover/model";

/**
 * Sponsor home — placeholder until the P5 deal-flow screen. Shows the latest published
 * teaser cards from the live showcase; full browse/filter/interest lives on /discover.
 */
export const Route = createFileRoute("/sponsor/home")({
	component: SponsorHome,
});

function SponsorHome() {
	const { data } = useQuery(publicTeaserQuery());
	const cards = (data ?? []).slice(0, 3).map(toProjectCardData);

	return (
		<div>
			<p className="eyebrow mb-2">Scout & back</p>
			<h1 className="text-3xl text-content-heading">Discover student work</h1>
			<p className="mt-2 text-content-soft">
				Browse, filter, and express interest on Discover. Grants and deal-flow
				arrive in P4 · P5.
			</p>

			<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{cards.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	);
}
