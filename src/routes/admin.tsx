import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Admin area layout + guard (PLT-05). Visible `/admin/*` segment. Guard stubbed until
 * auth is wired. The review queue + moderation tools land in P2.
 */
export const Route = createFileRoute("/admin")({
	component: AdminLayout,
	// TODO(P0): enforce admin role (see student.tsx for the pattern).
});

function AdminLayout() {
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Admin} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
