import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/auth";
import { ProfileView } from "#/components/account/ProfileView";
import { useProfile } from "#/hooks/account/useProfile";

/**
 * Public profile (STU-02 / SPN-02). Reads the real profile via `useProfile(userId)`
 * (→ `GET /accounts/:id/profile`). Under `_app` because viewing a profile is a
 * signed-in surface; `canEdit` is true only when the viewer is looking at themselves.
 */
export const Route = createFileRoute("/_app/u/$userId")({
	component: PublicProfile,
});

function PublicProfile() {
	const { userId } = Route.useParams();
	const { user } = useAuth();
	const { data, isLoading, isError } = useProfile(userId);

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
		<ProfileView profile={data} canEdit={user?.academyUserId === userId} />
	);
}
