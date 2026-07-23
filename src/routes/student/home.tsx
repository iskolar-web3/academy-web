import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { IncomingInvites } from "#/components/project/IncomingInvites";
import { MyProjectCard } from "#/components/project/MyProjectCard";
import { SubmitProjectModal } from "#/components/project/SubmitProjectModal";
import { useProfilePanel } from "#/hooks/account/useProfilePanel";
import { useMyGrants } from "#/hooks/grant/useMyGrants";
import { useMyProjects } from "#/hooks/project/useMyProjects";
import { formatPeso, grantStatusMeta } from "#/lib/grant/helper";
import { dashboardStats } from "#/lib/project/helper";

/**
 * Student dashboard (STU-09) — a 1:1 build of the design-template STUDENT DASHBOARD:
 * a sticky profile sidebar (now the shared `AppPageLayout` left column), four stat
 * tiles, and the owned-project list with lifecycle pipeline trackers, plus the
 * right-column ad slot.
 */
export const Route = createFileRoute("/student/home")({
	component: StudentHome,
});

function StudentHome() {
	const panel = useProfilePanel();
	const { data: projects = [], isLoading } = useMyProjects();
	const { data: myGrants = [] } = useMyGrants();
	const stats = dashboardStats(projects);
	const [submitOpen, setSubmitOpen] = useState(false);

	return (
		<AppPageLayout
			left={
				panel ? (
					<StudentProfileCard profile={panel} />
				) : (
					<div className="h-64 animate-pulse rounded-[18px] bg-surface-card" />
				)
			}
			right={<AdsPanel />}
		>
			<div>
				<div className="mb-[22px] flex items-center justify-end gap-2.5">
					<Link
						to="/student/grants/new"
						className="btn btn-secondary h-[46px] px-5 text-[14.5px]"
					>
						+ Request a grant
					</Link>
					<button
						type="button"
						onClick={() => setSubmitOpen(true)}
						className="btn btn-primary h-[46px] px-5 text-[14.5px]"
					>
						+ Submit a project
					</button>
				</div>

				<div className="mb-7 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
					{stats.map((stat) => (
						<div key={stat.label} className="card-surface p-4">
							<div className="text-[27px] text-action">{stat.value}</div>
							<div className="mt-[3px] font-mono text-[11.5px] text-content-faint">
								{stat.label}
							</div>
						</div>
					))}
				</div>

				<IncomingInvites />

				{isLoading ? (
					<p className="text-content-soft">Loading…</p>
				) : projects.length === 0 ? (
					<div className="card-surface p-10 text-center">
						<p className="text-content-heading">No projects yet</p>
						<p className="mt-1 text-sm text-content-soft">
							Publish your first project to get it in front of sponsors.
						</p>
						<button
							type="button"
							onClick={() => setSubmitOpen(true)}
							className="btn btn-primary mt-5"
						>
							+ Submit a project
						</button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{projects.map((project) => (
							<MyProjectCard key={project.id} project={project} />
						))}
					</div>
				)}

				{myGrants.length > 0 ? (
					<div className="mt-8">
						<div className="mb-3.5 text-[18px] text-content-heading">
							Grant payouts
						</div>
						<div className="card-surface overflow-hidden rounded-2xl">
							{myGrants.map((grant) => (
								<Link
									key={grant.id}
									to="/grants/$grantId"
									params={{ grantId: grant.id }}
									className="flex items-center justify-between border-[#eef1fa] border-b px-5 py-4 last:border-b-0 hover:bg-surface-tint"
								>
									<span className="text-[15.5px] text-content-heading">
										{grant.title}
									</span>
									<div className="flex items-center gap-4">
										<span className="text-[15px] text-content-heading">
											{formatPeso(grant.raised)}
										</span>
										<span
											className={`rounded-[6px] border px-2.5 py-1 font-mono text-[11.5px] ${grantStatusMeta(grant.status).className}`}
										>
											{grantStatusMeta(grant.status).label}
										</span>
									</div>
								</Link>
							))}
						</div>
					</div>
				) : null}
			</div>

			{submitOpen ? (
				<SubmitProjectModal onClose={() => setSubmitOpen(false)} />
			) : null}
		</AppPageLayout>
	);
}
