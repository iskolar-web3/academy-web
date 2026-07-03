import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SubmitProjectModal } from "#/components/project/SubmitProjectModal";
import { useProject } from "#/hooks/project/useProject";

/**
 * Edit a project (STU-11) — reuses the design-template SUBMIT WIZARD **modal**, prefilled
 * from the project, so create and edit share one surface. The modal surfaces the re-review
 * warning when a published project's MVP-critical fields change; closing returns to the
 * project detail.
 */
export const Route = createFileRoute("/student/projects/$projectId/edit")({
	component: EditProject,
});

function EditProject() {
	const { projectId } = Route.useParams();
	const navigate = useNavigate();
	const { data: project, isLoading, isError } = useProject(projectId);

	const back = () =>
		navigate({ to: "/student/projects/$projectId", params: { projectId } });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-24">
				<span className="size-8 animate-spin-ds rounded-full border-2 border-line border-t-action" />
			</div>
		);
	}
	if (isError || !project) {
		return (
			<div className="card-surface mx-auto max-w-md p-8 text-center">
				<p className="text-content-heading">Project not found</p>
				<Link to="/student/home" className="btn btn-secondary mt-4">
					Back to dashboard
				</Link>
			</div>
		);
	}

	return <SubmitProjectModal project={project} onClose={back} />;
}
