import { ArrowRight } from "lucide-react";
import { Reveal } from "#/components/landing/Reveal";
import { SectionHeading } from "#/components/landing/spine";
import { ProjectCard } from "#/components/project/ProjectCard";
import { RECENT_PROJECT_CARDS } from "#/lib/discover/mock";

/** Top-3 most-recent teaser. Mock data now (lib/discover/mock); real query in P3. */
const SAMPLE = RECENT_PROJECT_CARDS.slice(0, 3);

export function RecentProjectsPreview() {
	return (
		<section className="container-page py-16">
			<SectionHeading
				label="Fresh from the showcase"
				title="Recently published"
			/>

			<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{SAMPLE.map((project, i) => (
					<Reveal key={project.id} delay={i * 0.08}>
						<ProjectCard project={project} teaser />
					</Reveal>
				))}
			</div>

			<p className="mt-10 flex flex-col items-center justify-center gap-1 text-center text-base text-content-soft sm:flex-row sm:gap-2">
				Sign in to browse every published project, search, and filter.
				<span className="inline-flex items-center gap-1 text-action">
					Sign in <ArrowRight className="size-4" aria-hidden />
				</span>
			</p>
		</section>
	);
}
