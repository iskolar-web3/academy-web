import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { SponsorRail } from "#/components/discover/SponsorRail";
import { GrantDetailView } from "#/components/grant/GrantDetailView";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { useProfilePanel } from "#/hooks/account/useProfilePanel";
import { useSession } from "#/hooks/auth/useSession";
import { useGrant } from "#/hooks/grant/useGrants";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Grant detail + fund flow (SPN-10) — a 1:1 port of the design-template
 * GRANT DETAIL + FUND FLOW, now inside the shared 3-column `AppPageLayout`. Opened from
 * a gallery card or the student dashboard's "Grant payouts" row.
 */
export const Route = createFileRoute("/_app/grants/$grantId")({
	component: GrantDetail,
});

function GrantDetail() {
	const { grantId } = Route.useParams();
	const { role } = useSession();
	const isSponsor = role === AcademyRole.Sponsor;
	const panel = useProfilePanel();
	const { data: grant, isLoading, isError } = useGrant(grantId);

	const left = isSponsor ? (
		<SponsorRail />
	) : panel ? (
		<StudentProfileCard profile={panel} />
	) : (
		<div className="h-64 animate-pulse rounded-[18px] bg-surface-card" />
	);

	if (isLoading) {
		return (
			<AppPageLayout left={left} right={<AdsPanel />}>
				<p className="py-10 text-center text-[14px] text-content-soft">
					Loading grant…
				</p>
			</AppPageLayout>
		);
	}

	if (isError || !grant) {
		return (
			<AppPageLayout left={left} right={<AdsPanel />}>
				<div className="card-surface mx-auto max-w-md p-8 text-center">
					<p className="text-content-heading">Grant not found</p>
					<Link to="/grants" className="btn btn-secondary mt-4">
						Back to grants
					</Link>
				</div>
			</AppPageLayout>
		);
	}

	return (
		<AppPageLayout left={left} right={<AdsPanel />}>
			<Link
				to="/grants"
				className="mb-5 inline-block text-[14.5px] text-action"
			>
				← All grants
			</Link>
			<GrantDetailView grant={grant} isSponsor={isSponsor} />
		</AppPageLayout>
	);
}
