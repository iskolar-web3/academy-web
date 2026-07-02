import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { ProjectStatusBadge } from "#/components/project/ProjectStatusBadge";
import { useProject } from "#/hooks/project/useProject";
import { useProjectMutations } from "#/hooks/project/useProjectMutations";
import { nextActions } from "#/lib/project/helper";
import type { MemberConsent } from "#/lib/project/model";

/** Owner project view (STU-09): status, returned notes, and the full submission. */
export const Route = createFileRoute("/student/projects/$projectId/")({
	component: ProjectDetail,
});

const CONSENT_LABEL: Record<MemberConsent, string> = {
	not_required: "Credit only",
	pending: "Consent pending",
	accepted: "Accepted",
	declined: "Declined",
};

function ProjectDetail() {
	const { projectId } = Route.useParams();
	const navigate = useNavigate();
	const { data: project, isLoading, isError } = useProject(projectId);
	const { submit, resubmit, withdraw, remove } = useProjectMutations();

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

	const actions = nextActions(project.status);

	const links = [
		{ label: "Live demo", href: project.links.demo },
		{ label: "Repository", href: project.links.repo },
		{ label: "Video", href: project.links.video },
	].filter((l) => l.href);

	return (
		<div className="mx-auto max-w-3xl">
			<Link
				to="/student/home"
				className="text-sm text-content-soft hover:text-action"
			>
				← Dashboard
			</Link>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl text-content-heading">{project.title}</h1>
					<ProjectStatusBadge status={project.status} />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{actions.includes("edit") ? (
						<Link
							to="/student/projects/$projectId/edit"
							params={{ projectId: project.id }}
							className="btn btn-secondary"
						>
							Edit
						</Link>
					) : null}
					{actions.includes("submit") ? (
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => submit.mutate(project.id)}
						>
							Submit for review
						</button>
					) : null}
					{actions.includes("resubmit") ? (
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => resubmit.mutate(project.id)}
						>
							Resubmit
						</button>
					) : null}
					{actions.includes("withdraw") ? (
						<button
							type="button"
							className="btn btn-destructive"
							onClick={() => {
								if (confirm(`Withdraw "${project.title}" from the showcase?`)) {
									withdraw.mutate(project.id);
								}
							}}
						>
							Withdraw
						</button>
					) : null}
					{actions.includes("delete") ? (
						<button
							type="button"
							className="btn btn-destructive"
							onClick={() => {
								if (confirm(`Delete the draft "${project.title}"?`)) {
									remove.mutate(project.id, {
										onSuccess: () => navigate({ to: "/student/home" }),
									});
								}
							}}
						>
							Delete
						</button>
					) : null}
				</div>
			</div>

			<p className="mt-1 text-content-soft">
				{project.category || "Uncategorized"} ·{" "}
				{project.type === "thesis_capstone" ? "Thesis/Capstone" : "Idea"}
			</p>

			{project.returnedNote ? (
				<div className="status-pill status-pill--warning mt-4 w-full justify-start p-3 text-sm">
					{project.returnedNote}
				</div>
			) : null}

			<section className="mt-6">
				<h2 className="eyebrow mb-2">Pitch</h2>
				<p className="text-content-body">{project.pitch || "—"}</p>
			</section>

			<section className="mt-6">
				<h2 className="eyebrow mb-2">Purpose</h2>
				<p className="text-content-body">{project.purpose || "—"}</p>
			</section>

			{project.tech.length > 0 ? (
				<section className="mt-6">
					<h2 className="eyebrow mb-2">Tech</h2>
					<div className="flex flex-wrap gap-2">
						{project.tech.map((t) => (
							<span key={t} className="chip chip--tech">
								{t}
							</span>
						))}
					</div>
				</section>
			) : null}

			{links.length > 0 ? (
				<section className="mt-6">
					<h2 className="eyebrow mb-2">Links</h2>
					<div className="flex flex-col gap-2">
						{links.map((l) => (
							<a
								key={l.label}
								href={l.href}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 text-sm text-action hover:underline"
							>
								<ExternalLink className="size-4" aria-hidden />
								{l.label}
							</a>
						))}
					</div>
				</section>
			) : null}

			<section className="mt-6">
				<h2 className="eyebrow mb-2">
					{project.isTeam ? "Team" : "Ownership"}
				</h2>
				{project.isTeam && project.members.length > 0 ? (
					<ul className="flex flex-col gap-2">
						{project.members.map((m) => (
							<li
								key={m.id}
								className="card-surface flex items-center justify-between p-3"
							>
								<div>
									<p className="text-content-heading">{m.name}</p>
									<p className="text-sm text-content-soft">
										{m.contribution || "—"}
									</p>
								</div>
								<span className="status-pill status-pill--neutral">
									{CONSENT_LABEL[m.consent]}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-content-body">
						Individual project ·{" "}
						{project.ownership.declared ? "ownership declared" : "not declared"}
						{project.ownership.thesisPaperName
							? ` · ${project.ownership.thesisPaperName}`
							: ""}
					</p>
				)}
			</section>
		</div>
	);
}
