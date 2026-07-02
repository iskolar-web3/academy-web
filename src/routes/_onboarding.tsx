import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Onboarding layout — pathless. For signed-in users who haven't confirmed a role yet
 * (PLT-04). Guard is stubbed until auth is wired; uncomment when the router context
 * carries `auth`.
 */
export const Route = createFileRoute("/_onboarding")({
	component: OnboardingLayout,
	// TODO(P0): gate on session + unconfirmed role.
	// beforeLoad: async ({ context }) => {
	// 	const user = context.auth.user ?? (await context.auth.getSession())?.user;
	// 	if (!user) throw redirect({ to: "/login" });
	// 	if (user.role !== null) throw redirect({ to: getDefaultPathOfRole(user.role) });
	// },
});

function OnboardingLayout() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
			<div className="w-full">
				<Outlet />
			</div>
		</div>
	);
}
