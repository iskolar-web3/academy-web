import { Link } from "@tanstack/react-router";
import { ProjectPipeline } from "#/components/project/ProjectPipeline";
import {
	dashboardAction,
	projectCover,
	statusChipClass,
	statusMeta,
} from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";

/**
 * Owned-project card for the student dashboard — a 1:1 port of the design-template's
 * STUDENT DASHBOARD project row: a hue color bar, title + status badge, a lifecycle
 * pipeline tracker, an inline returned note, and a single contextual action.
 */
export function MyProjectCard({ project }: { project: Project }) {
	const status = statusMeta(project.status);
	const action = dashboardAction(project.status);
	const when =
		project.updatedDays === 0 ? "today" : `${project.updatedDays}d ago`;

	return (
		<div className="card-surface flex overflow-hidden">
			<div
				className="w-2 flex-none"
				style={{ background: projectCover(project.hue) }}
				aria-hidden
			/>
			<div className="flex-1 px-[22px] py-[18px]">
				<div className="mb-1.5 flex items-start justify-between gap-3">
					<span className="text-lg leading-tight text-content-heading">
						{project.title}
					</span>
					<span
						className={`flex-none rounded-md px-[11px] py-1 font-mono text-[11.5px] ${statusChipClass(project.status)}`}
					>
						{status.label}
					</span>
				</div>
				<div className="font-mono text-[12.5px] text-content-faint">
					{project.category || "Uncategorized"} · updated {when}
				</div>

				<ProjectPipeline status={project.status} />

				{project.returnedNote ? (
					<div className="mt-3 rounded-[10px] border border-danger-bd bg-danger-bg px-3 py-2.5 text-[13px] leading-relaxed text-danger">
						⚠ {project.returnedNote}
					</div>
				) : null}

				<div className="mt-4 flex items-center justify-between border-[#eef1fa] border-t pt-3.5">
					{project.status === "published" ? (
						<span className="text-[13.5px] text-action">
							♥ {project.upvotes} upvotes
						</span>
					) : null}
					<Link
						to={
							action.kind === "edit"
								? "/student/projects/$projectId/edit"
								: "/student/projects/$projectId"
						}
						params={{ projectId: project.id }}
						className="btn btn-secondary ml-auto h-[38px] px-[18px] text-[13.5px]"
					>
						{action.label}
					</Link>
				</div>
			</div>
		</div>
	);
}
