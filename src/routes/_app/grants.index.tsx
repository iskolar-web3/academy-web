import { createFileRoute } from "@tanstack/react-router";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { SponsorRail } from "#/components/discover/SponsorRail";
import { GrantCard } from "#/components/grant/GrantCard";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { useProfilePanel } from "#/hooks/account/useProfilePanel";
import { useSession } from "#/hooks/auth/useSession";
import { useOpenGrants } from "#/hooks/grant/useGrants";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Grants gallery (SPN-09, P4) — a 1:1 port of the design-template GRANTS GALLERY: an intro
 * paragraph and the card grid (every grant regardless of status — open/funded/closed
 * alike, matching the template's unfiltered `GRANTS()` seed). Left column is `SponsorRail`
 * for sponsors or the profile panel for student/admin; right column is the ad slot. No
 * search/filter toolbar — the template doesn't have one on this screen.
 */
export const Route = createFileRoute("/_app/grants/")({
	component: Grants,
});

function Grants() {
	const { role } = useSession();
	const isSponsor = role === AcademyRole.Sponsor;
	const panel = useProfilePanel();
	const { data: grants = [], isLoading, isError } = useOpenGrants();

	return (
		<AppPageLayout
			left={
				isSponsor ? (
					<SponsorRail />
				) : panel ? (
					<StudentProfileCard profile={panel} />
				) : (
					<div className="h-64 animate-pulse rounded-[18px] bg-surface-card" />
				)
			}
			right={<AdsPanel />}
		>
			<p className="mb-[26px] max-w-[620px] text-[16px] text-content-soft">
				Back promising student work at the starting-thesis stage, before it has
				an MVP. Each request is self-declared with a scanned title proposal and
				goes live on submit; funds move securely through the platform toward its
				target.
			</p>

			{isLoading ? (
				<p className="text-content-soft">Loading grants…</p>
			) : isError ? (
				<p className="text-danger">Couldn't load grants.</p>
			) : grants.length === 0 ? (
				<div className="card-surface p-10 text-center">
					<p className="text-content-heading">No grants yet</p>
					<p className="mt-1.5 text-[14px] text-content-soft">
						Grant requests appear here the moment a student publishes one.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
					{grants.map((grant) => (
						<GrantCard key={grant.id} grant={grant} />
					))}
				</div>
			)}
		</AppPageLayout>
	);
}
