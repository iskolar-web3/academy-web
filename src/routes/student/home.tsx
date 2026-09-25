import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	FileText,
	Plus,
	Rocket,
} from "lucide-react";
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

	const evidenceTotals = {
		ready: trackerTotals.ready + grantTrackerTotals.ready,
		queued: trackerTotals.queued + grantTrackerTotals.queued,
		needsAction: trackerTotals.needsAction + grantTrackerTotals.needsAction,
	};

	return (
		<AppPageLayout
			left={
				panel ? (
					<StudentProfileCard profile={panel} />
				) : (
					<div className="h-64 animate-pulse rounded-[14px] bg-surface-card" />
				)
			}
			right={<AdsPanel />}
		>
			<div>
				<header className="mb-6 border-line border-b pb-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-[680px]">
							<div className="font-mono text-[11px] uppercase text-action/65">
								Student workspace
							</div>
							<h1 className="mt-2 text-[30px] leading-tight text-content-heading">
								Your Academy workbench
							</h1>
							<p className="mt-2 text-[15px] leading-relaxed text-content-soft">
								Keep project submissions, research grants, and review evidence
								in one place.
							</p>
						</div>
						<div className="flex flex-wrap gap-2.5">
							<Link
								to="/student/grants/new"
								className="btn btn-secondary h-11 px-4 text-[14px]"
							>
								<FileText className="size-4" aria-hidden />
								Request grant
							</Link>
							<button
								type="button"
								onClick={() => setSubmitOpen(true)}
								className="btn btn-primary h-11 px-4 text-[14px]"
							>
								<Plus className="size-4" aria-hidden />
								Submit project
							</button>
						</div>
					</div>
				</header>

				<div className="mb-5 grid overflow-hidden rounded-[14px] border border-line bg-surface-card shadow-card sm:grid-cols-4">
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="border-line border-b px-5 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
						>
							<div className="text-[25px] leading-none text-content-heading">
								{stat.value}
							</div>
							<div className="mt-2 font-mono text-[11px] text-content-faint">
								{stat.label}
							</div>
						</div>
					))}
				</div>

				<section className="mb-7 rounded-[14px] border border-line bg-surface-card p-4 shadow-card">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<div className="text-[15px] text-content-heading">
								Review evidence
							</div>
							<p className="mt-0.5 text-[13px] text-content-soft">
								Signals from project and grant tracks.
							</p>
						</div>
					</div>
					<div className="grid gap-2.5 md:grid-cols-3">
						<div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-sunken/55 px-3.5 py-3">
							<CheckCircle2 className="size-4 text-success" aria-hidden />
							<div className="min-w-0">
								<div className="text-[19px] leading-none text-content-heading">
									{evidenceTotals.ready}
								</div>
								<div className="mt-1 font-mono text-[10.5px] text-content-faint">
									Accepted evidence
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-sunken/55 px-3.5 py-3">
							<Clock3 className="size-4 text-action" aria-hidden />
							<div className="min-w-0">
								<div className="text-[19px] leading-none text-content-heading">
									{evidenceTotals.queued}
								</div>
								<div className="mt-1 font-mono text-[10.5px] text-content-faint">
									Awaiting review
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-sunken/55 px-3.5 py-3">
							<AlertTriangle className="size-4 text-warning" aria-hidden />
							<div className="min-w-0">
								<div className="text-[19px] leading-none text-content-heading">
									{evidenceTotals.needsAction}
								</div>
								<div className="mt-1 font-mono text-[10.5px] text-content-faint">
									Needs action
								</div>
							</div>
						</div>
					</div>
				</section>

				<IncomingInvites />

				{isLoading ? (
					<div className="rounded-[14px] border border-line bg-surface-card p-5 text-[14px] text-content-soft">
						Loading projects...
					</div>
				) : projects.length === 0 ? (
					<div className="rounded-[14px] border border-dashed border-line bg-surface-card p-6 shadow-card">
						<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-start gap-4">
								<span className="flex size-11 flex-none items-center justify-center rounded-[12px] bg-surface-tint text-action">
									<Rocket className="size-5" aria-hidden />
								</span>
								<div>
									<div className="text-[18px] text-content-heading">
										Start with one shipped thing
									</div>
									<p className="mt-1 max-w-[520px] text-[14px] leading-relaxed text-content-soft">
										Submit an MVP when it has a demo, repo, and ownership
										declaration. Grants are for research work that needs funding
										before an MVP exists.
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setSubmitOpen(true)}
								className="btn btn-primary h-11 flex-none px-4 text-[14px]"
							>
								<Plus className="size-4" aria-hidden />
								Submit project
							</button>
						</div>
					</div>
				) : (
					<section className="flex flex-col gap-4">
						<div className="flex items-end justify-between gap-4">
							<div>
								<div className="font-mono text-[11px] uppercase text-action/65">
									Startup / project track
								</div>
								<p className="mt-1 text-[13.5px] text-content-soft">
									MVP evidence, ownership, and team consent.
								</p>
							</div>
						</div>
						{projects.map((project) => (
							<MyProjectCard key={project.id} project={project} />
						))}
					</section>
				)}

				{myGrants.length > 0 ? (
					<section className="mt-8">
						<div className="mb-3.5">
							<div className="font-mono text-[11px] uppercase text-action/65">
								Research / thesis grant track
							</div>
							<p className="mt-1 text-[13.5px] text-content-soft">
								Document evidence, endorsements, citations, and ethics routing.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							{myGrants.map((grant) => (
								<Link
									key={grant.id}
									to="/grants/$grantId"
									params={{ grantId: grant.id }}
									className="card-surface block rounded-[14px] p-5 transition-colors hover:bg-surface-tint"
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
										title="Grant tracker"
									/>
								</Link>
							))}
						</div>
					</section>
				) : null}
			</div>

			{submitOpen ? (
				<SubmitProjectModal onClose={() => setSubmitOpen(false)} />
			) : null}
		</AppPageLayout>
	);
}
