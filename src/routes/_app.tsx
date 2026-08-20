import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { RouteFallback } from "#/components/layout/RouteFallback";
import { useRouteGuard } from "#/hooks/auth/useRouteGuard";

/**
 * Shared signed-in shell — pathless. Holds surfaces any signed-in role can reach
 * (Discover, Grants, public profiles). The header nav adapts to the live session role.
 * Guard (client-side / defense-in-depth) requires any signed-in, role-confirmed user.
 */
export const Route = createFileRoute("/_app")({
	component: AppShell,
});

function AppShell() {
	const { allowed } = useRouteGuard({ kind: "signed-in" });
	if (!allowed) return <RouteFallback />;
	return (
		<div className="min-h-screen bg-background">
			<RoleNav />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
