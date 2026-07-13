import { createFileRoute, Link } from "@tanstack/react-router";
import { GrantDetailView } from "#/components/grant/GrantDetailView";
import { useSession } from "#/hooks/auth/useSession";
import { useGrant } from "#/hooks/grant/useGrants";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Grant detail + fund flow (SPN-10) — a 1:1 port of the design-template
 * GRANT DETAIL + FUND FLOW. Opened from a gallery card or the student dashboard's
 * "Grant payouts" row.
 */
export const Route = createFileRoute("/_app/grants/$grantId")({
	component: GrantDetail,
});

function GrantDetail() {
	const { grantId } = Route.useParams();
	const { role } = useSession();
	const { data: grant, isLoading, isError } = useGrant(grantId);

	if (isLoading) {
		return (
			<p className="py-10 text-center text-[14px] text-content-soft">
				Loading grant…
			</p>
		);
	}

	if (isError || !grant) {
		return (
			<div className="card-surface mx-auto max-w-md p-8 text-center">
				<p className="text-content-heading">Grant not found</p>
				<Link to="/grants" className="btn btn-secondary mt-4">
					Back to grants
				</Link>
			</div>
		);
	}

	return (
		<div>
			<Link
				to="/grants"
				className="mb-5 inline-block text-[14.5px] text-action"
			>
				← All grants
			</Link>
			<GrantDetailView grant={grant} isSponsor={role === AcademyRole.Sponsor} />
		</div>
	);
}
