import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The student dashboard now lives at `/student/home` (design-template: the student's
 * home IS their my-projects dashboard). Keep this path working by redirecting.
 */
export const Route = createFileRoute("/student/projects/")({
	beforeLoad: () => {
		throw redirect({ to: "/student/home" });
	},
});
