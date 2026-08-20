import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteFallback } from "#/components/layout/RouteFallback";
import { useRouteGuard } from "#/hooks/auth/useRouteGuard";

/**
 * Onboarding layout — pathless. For signed-in users who haven't confirmed a role yet
 * (PLT-04). Client guard admits only signed-in, unconfirmed users; a confirmed user is
 * bounced to their role area.
 */
export const Route = createFileRoute("/_onboarding")({
	component: OnboardingLayout,
});

function OnboardingLayout() {
	const { allowed } = useRouteGuard({ kind: "onboarding" });
	if (!allowed) return <RouteFallback />;
	return (
		<div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
			<div className="w-full">
				<Outlet />
			</div>
		</div>
	);
}
