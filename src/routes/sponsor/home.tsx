import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DealFlowCard } from "#/components/discover/DealFlowCard";
import { SponsorEvidenceRail } from "#/components/discover/SponsorEvidenceRail";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { publishedProjectsQuery } from "#/lib/discover/api";
import { CATEGORIES } from "#/lib/project/model";
import { projectMatchScore } from "#/lib/project/reviewChecks";

/**
 * Sponsor deal-flow (SPN-13). The page keeps the original feed shape, but splits discovery
 * into a fit-first stack and an all-approved stack so new, well-evidenced work can surface
 * before it has enough upvotes to win a pure popularity sort.
 */
export const Route = createFileRoute("/sponsor/home")({
	component: SponsorHome,
});

function SponsorHome() {
	const [focus, setFocus] = useState<string>("All");
	const {
		data: projects = [],
		isLoading,
		isError,
	} = useQuery(publishedProjectsQuery({ sort: "trending" }));
	const matchedProjects = [...projects]
		.sort((a, b) => {
			const aFocusBoost = focus !== "All" && a.category === focus ? 24 : 0;
			const bFocusBoost = focus !== "All" && b.category === focus ? 24 : 0;
			return (
				projectMatchScore(b) +
				bFocusBoost -
				(projectMatchScore(a) + aFocusBoost)
			);
		})
		.slice(0, 3);
	const matchedIds = new Set(matchedProjects.map((project) => project.id));
	const allProjects = projects
		.filter((project) => !matchedIds.has(project.id))
		.slice(0, 6);

	return (
		<AppPageLayout left={<SponsorEvidenceRail />} right={<AdsPanel />}>
			<div className="mb-5 rounded-[18px] border border-line bg-surface-card px-5 py-5 shadow-card">
				<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
					Sponsor deal-flow
				</div>
				<h1 className="mt-1 text-[26px] leading-tight text-content-heading">
					Matched first, open discovery after
				</h1>
				<p className="mt-1.5 text-[14.5px] leading-relaxed text-content-soft">
					The first stack favors verification evidence, freshness, and traction.
					The second keeps every approved project browsable.
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{["All", ...CATEGORIES].map((category) => (
						<button
							key={category}
							type="button"
							onClick={() => setFocus(category)}
							className={`h-8 rounded-[8px] border px-3 font-mono text-[12px] transition ${
								focus === category
									? "border-action bg-action text-white"
									: "border-line bg-surface-card text-content-muted hover:bg-surface-tint"
							}`}
						>
							{category}
						</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<p className="text-content-soft">Loading...</p>
			) : isError ? (
				<p className="text-danger">Couldn't load deal-flow.</p>
			) : projects.length === 0 ? (
				<div className="card-surface p-10 text-center">
					<p className="text-content-heading">Nothing published yet</p>
					<p className="mt-1.5 text-[14px] text-content-soft">
						Published student work will show up here as it ships.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-8">
					<section>
						<div className="mb-3.5">
							<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
								Matched to your focus
							</div>
							<p className="mt-1 text-[13.5px] text-content-soft">
								Prioritized by selected focus, readiness, verification, recency,
								and traction. School is not used as a match signal.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							{matchedProjects.map((project) => (
								<DealFlowCard key={project.id} project={project} />
							))}
						</div>
					</section>

					<section>
						<div className="mb-3.5 border-line border-t pt-6">
							<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
								All approved projects
							</div>
							<p className="mt-1 text-[13.5px] text-content-soft">
								Open gallery remains available so good work is never hidden by
								the match layer.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							{(allProjects.length ? allProjects : matchedProjects).map(
								(project) => (
									<DealFlowCard key={project.id} project={project} />
								),
							)}
						</div>
					</section>
				</div>
			)}
		</AppPageLayout>
	);
}
