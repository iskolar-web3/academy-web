import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "#/components/project/ProjectForm/ProjectForm";
import { emptyFormValues } from "#/lib/project/helper";

/** Create a project draft → submit wizard (STU-03…07). */
export const Route = createFileRoute("/student/projects/new")({
	component: NewProject,
});

function NewProject() {
	return (
		<div className="mx-auto max-w-2xl">
			<p className="eyebrow mb-2">New project</p>
			<h1 className="mb-8 text-3xl text-content-heading">Create a project</h1>
			<ProjectForm mode="create" defaultValues={emptyFormValues()} />
		</div>
	);
}
