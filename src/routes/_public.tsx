import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Public (unauthenticated) layout — pathless, so its children keep clean URLs (`/`).
 * No guard: anyone can see these. Sign-in lives on the landing page itself
 * (`SignInPopover`) — there's no separate `/login` route. Each child brings its own
 * chrome (the landing has its own header/footer), so this layout is just an outlet.
 */
export const Route = createFileRoute("/_public")({
	component: () => <Outlet />,
});
