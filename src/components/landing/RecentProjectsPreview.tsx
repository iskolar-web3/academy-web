import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Reveal } from "#/components/landing/Reveal";
import { SectionHeading } from "#/components/landing/spine";
import { ProjectCard } from "#/components/project/ProjectCard";
import { publicTeaserQuery } from "#/lib/discover/api";
import { toProjectCardData } from "#/lib/discover/model";

/**
 * Top-3 most-recent teaser (PLT-06) — the visitor's capped preview, read from the public
 * `GET /discover/teaser` endpoint (card only; the full gallery stays behind sign-in).
 * SSR-safe: the first render (server and client alike) shows the section shell; cards
 * fill in when the query resolves.
 */
export function RecentProjectsPreview() {
	const { data } = useQuery(publicTeaserQuery());
	const cards = (data ?? []).slice(0, 3).map(toProjectCardData);

	return (
		<section className="container-page py-16">
			<SectionHeading
				label="Fresh from the showcase"
				title="Recently published"
			/>

			{cards.length > 0 ? (
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{cards.map((project, i) => (
						<Reveal key={project.id} delay={i * 0.08}>
							<ProjectCard project={project} teaser />
						</Reveal>
					))}
				</div>
			) : null}

			<p className="mt-10 flex flex-col items-center justify-center gap-1 text-center text-base text-content-soft sm:flex-row sm:gap-2">
				Sign in to browse every published project, search, and filter.
				<span className="inline-flex items-center gap-1 text-action">
					Sign in <ArrowRight className="size-4" aria-hidden />
				</span>
			</p>
		</section>
	);
}
