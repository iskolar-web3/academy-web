import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Submitting a project is a **modal** opened from the dashboard "+ Submit a project"
 * action (design-template SUBMIT WIZARD MODAL — see `components/project/SubmitProjectModal`),
 * not a standalone page. This route is kept as a redirect so any existing link to
 * `/student/projects/new` lands on the dashboard where the modal lives.
 */
export const Route = createFileRoute("/student/projects/new")({
	beforeLoad: () => {
		throw redirect({ to: "/student/home" });
	},
});
