import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { RouteFallback } from "#/components/layout/RouteFallback";
import { useRouteGuard } from "#/hooks/auth/useRouteGuard";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Student area layout + guard (PLT-05). Uses a VISIBLE `/student/*` segment (not a
 * pathless `_student`) so it can't collide with `/sponsor/*` on shared page names like
 * `profile`. Client guard requires a confirmed student role (server re-enforces).
 */
export const Route = createFileRoute("/student")({
	component: StudentLayout,
});

function StudentLayout() {
	const { allowed } = useRouteGuard({
		kind: "role",
		role: AcademyRole.Student,
	});
	if (!allowed) return <RouteFallback />;
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Student} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
