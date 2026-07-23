import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { ProfileView } from "#/components/account/ProfileView";
import { myProfileQuery, profileQuery } from "#/lib/account/api";
import { publishedProjectsQuery } from "#/lib/discover/api";

/**
 * Public profile (STU-02 / SPN-02). Viewing your own profile fetches the richer
 * `GET /accounts/me/profile` (adds the onboarding-only fields — gender/birthDate/phone/
 * educationLevel — rendered as a "Your details" panel only you can see); viewing anyone
 * else's fetches the public `GET /accounts/:id/profile`, which never returns those PII
 * fields. Plus the user's published showcase work (STU-02, `GET /discover/projects?owner=…`).
 * Under `_app` because viewing a profile is a signed-in surface.
 */
export const Route = createFileRoute("/_app/u/$userId")({
	component: PublicProfile,
});

function PublicProfile() {
	const { userId } = Route.useParams();
	const { user } = useAuth();
	const canEdit = user?.academyUserId === userId;

	const own = useQuery({ ...myProfileQuery(), enabled: canEdit });
	const other = useQuery({ ...profileQuery(userId), enabled: !canEdit });
	const { data, isLoading, isError } = canEdit ? own : other;

	const isStudent = data?.role === "student";
	const work = useQuery({
		...publishedProjectsQuery({ owner: userId }),
		enabled: isStudent,
	});

	if (isLoading) {
		return (
			<div className="mx-auto flex max-w-3xl items-center justify-center py-24">
				<span className="size-8 animate-spin-ds rounded-full border-2 border-line border-t-action" />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="mx-auto max-w-3xl py-24 text-center">
				<p className="text-lg text-content-heading">Profile not found</p>
				<p className="mt-2 text-sm text-content-soft">
					This profile couldn't be loaded. It may not exist yet.
				</p>
			</div>
		);
	}

	return (
		<ProfileView
			profile={data}
			canEdit={canEdit}
			own={canEdit ? own.data : null}
			work={isStudent ? (work.data ?? []) : undefined}
		/>
	);
}
