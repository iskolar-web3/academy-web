import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Public (unauthenticated) layout — pathless, so its children keep clean URLs
 * (`/`, `/login`). No guard: anyone can see these. Each child brings its own chrome
 * (the landing has its own header/footer), so this layout is just an outlet.
 */
export const Route = createFileRoute("/_public")({
	component: () => <Outlet />,
});
