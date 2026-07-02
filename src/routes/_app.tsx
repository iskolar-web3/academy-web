import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleNav } from "#/components/layout/RoleNav";

/**
 * Shared signed-in shell — pathless. Holds surfaces any signed-in role can reach
 * (Discover, Grants, public profiles). The header nav adapts to the live session role.
 * Guard is stubbed until auth is wired.
 */
export const Route = createFileRoute("/_app")({
	component: AppShell,
	// TODO(P0): require any signed-in session.
	// beforeLoad: async ({ context }) => {
	// 	const user = context.auth.user ?? (await context.auth.getSession())?.user;
	// 	if (!user) throw redirect({ to: "/login" });
	// },
});

function AppShell() {
	return (
		<div className="min-h-screen bg-background">
			<RoleNav />
			<main className="container-page py-10">
				<Outlet />
			</main>
		</div>
	);
}
