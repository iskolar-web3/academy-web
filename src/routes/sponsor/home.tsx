import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DealFlowCard } from "#/components/discover/DealFlowCard";
import { SponsorRail } from "#/components/discover/SponsorRail";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { publishedProjectsQuery } from "#/lib/discover/api";

/**
 * Sponsor deal-flow (SPN-13) — a 1:1 port of the design-template SPONSOR DEAL-FLOW's
 * layout (feed + SponsorRail, now `AppPageLayout`'s left column, with the right-column
 * ad slot), reusing P3's real published-project data (trending sort) instead of the
 * template's decorative "posts by followed builders" framing — see `DealFlowCard`'s
 * docstring for why. No entitlement gate on the board itself (deal-flow scouting is
 * available at every tier per the template; watchlisting specific projects is the
 * Alpha+ gated action, enforced per-card).
 */
export const Route = createFileRoute("/sponsor/home")({
	component: SponsorHome,
});

function SponsorHome() {
	const {
		data: projects = [],
		isLoading,
		isError,
	} = useQuery(publishedProjectsQuery({ sort: "trending" }));

	return (
		<AppPageLayout left={<SponsorRail />} right={<AdsPanel />}>
			<p className="mb-5 text-[14px] text-content-faint">
				Updates from published student work, ranked by community traction.
			</p>
			<div className="flex flex-col gap-4">
				{isLoading ? (
					<p className="text-content-soft">Loading…</p>
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
					projects
						.slice(0, 6)
						.map((project) => (
							<DealFlowCard key={project.id} project={project} />
						))
				)}
			</div>
		</AppPageLayout>
	);
}
