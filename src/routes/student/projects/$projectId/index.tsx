import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProjectDetailView } from "#/components/project/ProjectDetailView";
import { ProjectStatusBadge } from "#/components/project/ProjectStatusBadge";
import { ConfirmActionDialog } from "#/components/ui/ConfirmActionDialog";
import { useProject } from "#/hooks/project/useProject";
import { useProjectMutations } from "#/hooks/project/useProjectMutations";
import { nextActions } from "#/lib/project/helper";
import { toast } from "#/lib/toast";

/**
 * Owner project view (STU-09/10/11) — the design-template PROJECT DETAIL (`ProjectDetailView`)
 * with the owner's manage card in the side rail: status, the returned note, and the
 * lifecycle actions available for the current status.
 */
export const Route = createFileRoute("/student/projects/$projectId/")({
	component: ProjectDetail,
});

function ProjectDetail() {
	const { projectId } = Route.useParams();
	const navigate = useNavigate();
	const [confirmAction, setConfirmAction] = useState<
		"withdraw" | "delete" | null
	>(null);
	const { data: project, isLoading, isError } = useProject(projectId);
	const { submit, resubmit, withdraw, remove } = useProjectMutations();

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

	const actions = nextActions(project.status);

	const manage = (
		<>
			<div className="mb-3 flex items-center justify-between">
				<span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
					Status
				</span>
				<ProjectStatusBadge status={project.status} />
			</div>

			{project.returnedNote ? (
				<div className="mb-3 rounded-[10px] border border-danger-bd bg-danger-bg p-3 text-[13px] text-danger">
					{project.returnedNote}
				</div>
			) : null}

			<div className="flex flex-col gap-2.5">
				{actions.includes("edit") ? (
					<Link
						to="/student/projects/$projectId/edit"
						params={{ projectId: project.id }}
						className="btn btn-secondary h-[42px] w-full"
					>
						Edit project
					</Link>
				) : null}
				{actions.includes("submit") ? (
					<button
						type="button"
						className="btn btn-primary h-[42px] w-full"
						onClick={() => submit.mutate(project.id)}
					>
						Submit for review
					</button>
				) : null}
				{actions.includes("resubmit") ? (
					<button
						type="button"
						className="btn btn-primary h-[42px] w-full"
						onClick={() => resubmit.mutate(project.id)}
					>
						Resubmit
					</button>
				) : null}
				{actions.includes("withdraw") ? (
					<button
						type="button"
						className="btn btn-destructive h-[42px] w-full"
						onClick={() => setConfirmAction("withdraw")}
					>
						Withdraw
					</button>
				) : null}
				{actions.includes("delete") ? (
					<button
						type="button"
						className="btn btn-destructive h-[42px] w-full"
						onClick={() => setConfirmAction("delete")}
					>
						Delete draft
					</button>
				) : null}
			</div>
		</>
	);

	return (
		<div>
			<Link
				to="/student/home"
				className="mb-5 inline-block text-[14.5px] text-action"
			>
				Dashboard
			</Link>
			<ProjectDetailView project={project} viewer="owner" manage={manage} />
			<ConfirmActionDialog
				open={confirmAction !== null}
				onClose={() => setConfirmAction(null)}
				title={confirmAction === "delete" ? "Delete draft" : "Withdraw project"}
				description={
					confirmAction === "delete"
						? `Delete “${project.title}”? This cannot be undone.`
						: `Withdraw “${project.title}” from the showcase?`
				}
				confirmLabel={confirmAction === "delete" ? "Delete draft" : "Withdraw"}
				busy={withdraw.isPending || remove.isPending}
				onConfirm={() => {
					if (confirmAction === "withdraw") {
						withdraw.mutate(project.id, {
							onSuccess: () => {
								toast.success("Project withdrawn");
								setConfirmAction(null);
							},
							onError: (error) => toast.error(error.message),
						});
					} else if (confirmAction === "delete") {
						remove.mutate(project.id, {
							onSuccess: () => {
								toast.success("Draft deleted");
								navigate({ to: "/student/home" });
							},
							onError: (error) => toast.error(error.message),
						});
					}
				}}
			/>
		</div>
	);
}
