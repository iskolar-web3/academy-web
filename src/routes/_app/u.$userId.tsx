import { createFileRoute } from "@tanstack/react-router";
import {
	ProfileView,
	type ProfileViewModel,
} from "#/components/account/ProfileView";
import { MOCK_PROJECTS } from "#/lib/discover/mock";

/**
 * Public profile (STU-02 / SPN-02). Renders on mock data now; swap to
 * `useProfile(userId)` (hooks/account) once the API is wired. Route is under `_app`
 * because viewing a profile is a signed-in surface.
 */
export const Route = createFileRoute("/_app/u/$userId")({
	component: PublicProfile,
});

/** Placeholder view-model built from mock project members, keyed by the route param. */
function mockProfile(userId: string): ProfileViewModel {
	const member = MOCK_PROJECTS[0].members[0];
	return {
		displayName: member.name,
		role: "Student · UP Diliman",
		headline: member.role,
		location: "Metro Manila, PH",
		bio: `Building offline-first learning tools. Interested in on-device ML and accessible design. (Mock profile for "${userId}" — replaced by real data in P0.)`,
		skills: member.skills,
		links: [
			{ label: "GitHub", href: "https://github.com" },
			{ label: "Website", href: "https://example.com" },
		],
	};
}

function PublicProfile() {
	const { userId } = Route.useParams();
	return <ProfileView profile={mockProfile(userId)} />;
}
