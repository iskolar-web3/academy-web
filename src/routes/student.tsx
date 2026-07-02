import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Student area layout + guard (PLT-05). Uses a VISIBLE `/student/*` segment (not a
 * pathless `_student`) so it can't collide with `/sponsor/*` on shared page names like
 * `profile`. Guard stubbed until auth is wired.
 */
export const Route = createFileRoute("/student")({
	component: StudentLayout,
	// TODO(P0): enforce student role.
	// beforeLoad: async ({ context }) => {
	// 	const user = context.auth.user ?? (await context.auth.getSession())?.user;
	// 	if (!user) throw redirect({ to: "/login" });
	// 	if (user.role !== AcademyRole.Student)
	// 		throw redirect({ to: getDefaultPathOfRole(user.role) });
	// },
});

function StudentLayout() {
	return (
		<div className="min-h-screen bg-background">
			<RoleNav role={AcademyRole.Student} />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
