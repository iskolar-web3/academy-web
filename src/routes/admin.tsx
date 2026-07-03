import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { RouteFallback } from "#/components/layout/RouteFallback";
import { useRouteGuard } from "#/hooks/auth/useRouteGuard";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Admin area layout + guard (PLT-05). Visible `/admin/*` segment. Client guard requires
 * a confirmed admin role (server re-enforces). Review queue + moderation land in P2.
 */
export const Route = createFileRoute("/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	const { allowed } = useRouteGuard({ kind: "role", role: AcademyRole.Admin });
	if (!allowed) return <RouteFallback />;
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Admin} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
