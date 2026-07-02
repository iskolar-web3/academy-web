import { createFileRoute, Link } from "@tanstack/react-router";
import { ProjectForm } from "#/components/project/ProjectForm/ProjectForm";
import { useProject } from "#/hooks/project/useProject";
import { projectToFormValues } from "#/lib/project/helper";

/** Edit a project; ProjectForm surfaces the re-review warning when published (STU-11). */
export const Route = createFileRoute("/student/projects/$projectId/edit")({
	component: EditProject,
});

function EditProject() {
	const { projectId } = Route.useParams();
	const { data: project, isLoading, isError } = useProject(projectId);

	if (isLoading) {
		return <p className="text-content-soft">Loading…</p>;
	}
	if (isError || !project) {
		return (
			<div className="card-surface p-8 text-center">
				<p className="text-content-heading">Project not found</p>
				<Link to="/student/home" className="btn btn-secondary mt-4">
					Back to dashboard
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl">
			<p className="eyebrow mb-2">Edit project</p>
			<h1 className="mb-8 text-3xl text-content-heading">{project.title}</h1>
			<ProjectForm
				mode="edit"
				projectId={project.id}
				existingStatus={project.status}
				defaultValues={projectToFormValues(project)}
			/>
		</div>
	);
}
