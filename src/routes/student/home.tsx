import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { GrantReviewPanel } from "#/components/grant/GrantReviewPanel";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { IncomingInvites } from "#/components/project/IncomingInvites";
import { MyProjectCard } from "#/components/project/MyProjectCard";
import { SubmitProjectModal } from "#/components/project/SubmitProjectModal";
import { useProfilePanel } from "#/hooks/account/useProfilePanel";
import { useMyGrants } from "#/hooks/grant/useMyGrants";
import { useMyProjects } from "#/hooks/project/useMyProjects";
import { formatPeso, grantStatusMeta } from "#/lib/grant/helper";
import {
	buildGrantChecks,
	summarizeGrantChecks,
} from "#/lib/grant/reviewChecks";
import { dashboardStats } from "#/lib/project/helper";
import {
	buildReviewChecks,
	summarizeReviewChecks,
} from "#/lib/project/reviewChecks";

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
	const trackerTotals = projects.reduce(
		(acc, project) => {
			const summary = summarizeReviewChecks(buildReviewChecks(project));
			acc.ready += summary.pass;
			acc.queued += summary.pending;
			acc.needsAction += summary.attention;
			return acc;
		},
		{ ready: 0, queued: 0, needsAction: 0 },
	);
	const grantTrackerTotals = myGrants.reduce(
		(acc, grant) => {
			const summary = summarizeGrantChecks(buildGrantChecks(grant));
			acc.ready += summary.pass;
			acc.queued += summary.pending;
			acc.needsAction += summary.attention;
			return acc;
		},
		{ ready: 0, queued: 0, needsAction: 0 },
	);

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
				<div className="mb-[22px] flex flex-col gap-4 rounded-[18px] border border-line bg-surface-card px-5 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
							Student dashboard
						</div>
						<h1 className="mt-1 text-[26px] leading-tight text-content-heading">
							Profile, projects, and review progress
						</h1>
						<p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-content-soft">
							Track startup projects and research grants through separate
							evidence pipelines before sponsors see them.
						</p>
					</div>
					<div className="flex flex-wrap gap-2.5">
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

				<div className="mb-6 grid gap-3.5 sm:grid-cols-3">
					<div className="rounded-[14px] border border-success-bd bg-success-bg/60 p-4">
						<div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-success">
							Ready evidence
						</div>
						<div className="mt-2 text-[24px] text-content-heading">
							{trackerTotals.ready + grantTrackerTotals.ready}
						</div>
					</div>
					<div className="rounded-[14px] border border-info-bd bg-info-bg/70 p-4">
						<div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-action">
							Queued checks
						</div>
						<div className="mt-2 text-[24px] text-content-heading">
							{trackerTotals.queued + grantTrackerTotals.queued}
						</div>
					</div>
					<div className="rounded-[14px] border border-warning-bd bg-warning-bg/70 p-4">
						<div className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-warning">
							Needs action
						</div>
						<div className="mt-2 text-[24px] text-content-heading">
							{trackerTotals.needsAction + grantTrackerTotals.needsAction}
						</div>
					</div>
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
						<div>
							<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
								Startup / project track
							</div>
							<p className="mt-1 mb-3 text-[13.5px] text-content-soft">
								MVP evidence: demo liveness, repository access, README/license,
								ownership, and team consent.
							</p>
						</div>
						{projects.map((project) => (
							<MyProjectCard key={project.id} project={project} />
						))}
					</div>
				)}

				{myGrants.length > 0 ? (
					<div className="mt-8">
						<div className="mb-3.5">
							<div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
								Research / thesis grant track
							</div>
							<p className="mt-1 text-[13.5px] text-content-soft">
								Document evidence: proposal, research structure, endorsement,
								citations, similarity, and ethics routing.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							{myGrants.map((grant) => (
								<Link
									key={grant.id}
									to="/grants/$grantId"
									params={{ grantId: grant.id }}
									className="card-surface block rounded-2xl p-5 transition-colors hover:bg-surface-tint"
								>
									<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
									</div>
									<GrantReviewPanel
										grant={grant}
										limit={3}
										title="Grant tracker"
									/>
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
