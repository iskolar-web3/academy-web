import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Sponsor area layout + guard (PLT-05). Visible `/sponsor/*` segment. Guard stubbed
 * until auth is wired.
 */
export const Route = createFileRoute("/sponsor")({
	component: SponsorLayout,
	// TODO(P0): enforce sponsor role (see student.tsx for the pattern).
});

function SponsorLayout() {
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Sponsor} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
