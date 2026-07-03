import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { RouteFallback } from "#/components/layout/RouteFallback";
import { useRouteGuard } from "#/hooks/auth/useRouteGuard";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Sponsor area layout + guard (PLT-05). Visible `/sponsor/*` segment. Client guard
 * requires a confirmed sponsor role (server re-enforces).
 */
export const Route = createFileRoute("/sponsor")({
	component: SponsorLayout,
});

function SponsorLayout() {
	const { allowed } = useRouteGuard({
		kind: "role",
		role: AcademyRole.Sponsor,
	});
	if (!allowed) return <RouteFallback />;
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Sponsor} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
