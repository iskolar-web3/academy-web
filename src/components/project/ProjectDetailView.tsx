import { ArrowUpRight, Github, Lock, MonitorPlay, Play } from "lucide-react";
import type { ReactNode } from "react";
import { UpvoteButton } from "#/components/project/UpvoteButton";
import { projectCover } from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";

/**
 * Project detail — a 1:1 port of the design-template PROJECT DETAIL: a gradient cover
 * banner with category/type chips, a two-column body (pitch · purpose quote · tech · team
 * on the left; a side rail with the interact/manage card, MVP links, and the Venture Pitch
 * Vault on the right). Presentational + viewer-aware so it serves the owner (P1) and later
 * the sponsor/public showcase view (P3) from one design.
 *
 * `viewer`:
 *  - `owner`   → the `manage` slot (status + returned note + lifecycle actions) tops the rail.
 *  - `sponsor` → Upvote + Express interest (real interest flow lands in P3).
 *  - `public`  → Upvote + a sign-in nudge.
 */

const TYPE_LABEL: Record<Project["type"], string> = {
	idea: "Idea / MVP",
	thesis_capstone: "Thesis / Capstone",
};

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

const railCardCls =
	"rounded-[14px] border border-line bg-surface-card p-[18px]";
const eyebrowTick = (
	<span className="h-0.5 w-[22px] bg-action/50" aria-hidden />
);
const eyebrowText =
	"font-mono text-[11.5px] uppercase tracking-[0.2em] text-action/60";

const MVP_LINKS = [
	{ key: "demo", Icon: MonitorPlay, label: "Live demo" },
	{ key: "repo", Icon: Github, label: "Repository" },
	{ key: "video", Icon: Play, label: "Demo video" },
] as const;

export function ProjectDetailView({
	project,
	viewer,
	manage,
}: {
	project: Project;
	viewer: "owner" | "sponsor" | "public";
	manage?: ReactNode;
}) {
	const links = MVP_LINKS.map((l) => ({
		...l,
		href: project.links[l.key],
	})).filter((l) => l.href);

	return (
		<div className="mx-auto max-w-[1340px]">
			<div className="card-surface overflow-hidden rounded-[18px]">
				{/* Cover banner */}
				<div
					className="relative flex h-[200px] items-end p-6"
					style={{ background: projectCover(project.hue) }}
				>
					<div
						aria-hidden
						className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.10)_11px,transparent_11px,transparent_24px)]"
					/>
					<div className="relative flex gap-2.5">
						<span className="rounded-[7px] bg-[rgba(17,24,39,0.34)] px-[11px] py-[5px] font-mono text-[12px] text-white">
							{project.category || "Uncategorized"}
						</span>
						<span className="rounded-[7px] bg-[rgba(17,24,39,0.34)] px-[11px] py-[5px] font-mono text-[12px] text-white">
							{TYPE_LABEL[project.type]}
						</span>
					</div>
				</div>

				<div className="flex flex-wrap gap-6 p-8 lg:flex-nowrap">
					{/* Left column */}
					<div className="min-w-[320px] flex-1">
						<div className="mb-1.5 flex items-center gap-2.5">
							<h1 className="text-[32px] text-content-heading">
								{project.title}
							</h1>
							{project.status === "published" ? (
								<span className="inline-flex items-center gap-1.5 rounded-[7px] border border-success-bd bg-success-bg px-2.5 py-1 text-[12px] text-verified">
									✔ Verified Builder
								</span>
							) : null}
						</div>
						<div className="mb-[18px] font-mono text-[13px] text-content-faint">
							{project.school || "iSkolar Academy"}
						</div>
						<p className="mb-[22px] text-[17px] leading-[1.6] text-content-strong">
							{project.pitch || "—"}
						</p>

						<div className="mb-2.5 flex items-center gap-2.5">
							{eyebrowTick}
							<span className={eyebrowText}>Purpose</span>
						</div>
						<p className="mb-6 border-line border-l-2 pl-4 text-[15.5px] leading-[1.6] text-content-strong">
							{project.purpose || "—"}
						</p>

						{project.tech.length > 0 ? (
							<>
								<div className="mb-3 flex items-center gap-2.5">
									{eyebrowTick}
									<span className={eyebrowText}>Tech stack</span>
								</div>
								<div className="mb-[26px] flex flex-wrap gap-2">
									{project.tech.map((t) => (
										<span key={t} className="chip chip--category">
											{t}
										</span>
									))}
								</div>
							</>
						) : null}

						<div className="mb-3.5 flex items-center gap-2.5">
							{eyebrowTick}
							<span className={eyebrowText}>
								{project.isTeam ? "Team & contributions" : "Ownership"}
							</span>
						</div>
						{project.isTeam && project.members.length > 0 ? (
							<div className="flex flex-col gap-3">
								{project.members.map((m) => (
									<div key={m.id} className="flex items-start gap-3">
										<span className="flex size-10 flex-none items-center justify-center rounded-[10px] bg-action text-[14px] text-white">
											{initialsOf(m.name)}
										</span>
										<div>
											<div className="text-[15.5px] text-content-heading">
												{m.name}
												{m.contribution ? (
													<span className="text-[13px] text-content-faint">
														{" "}
														· {m.contribution}
													</span>
												) : null}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-[15px] text-content-strong">
								Individual project
								{project.ownership.declared ? " · ownership declared" : ""}
								{project.ownership.thesisPaperName
									? ` · ${project.ownership.thesisPaperName}`
									: ""}
							</p>
						)}
					</div>

					{/* Side rail */}
					<aside className="flex w-full flex-col gap-3.5 lg:w-[300px] lg:flex-none">
						<div className={railCardCls}>
							{viewer === "owner" ? (
								manage
							) : (
								<>
									<UpvoteButton
										count={project.upvotes}
										title={`Upvote ${project.title}`}
									/>
									{viewer === "sponsor" ? (
										<>
											<button
												type="button"
												className="mt-2.5 h-[42px] w-full rounded-[9px] bg-action text-[14px] text-on-action transition-colors hover:bg-action-hover"
											>
												Express interest
											</button>
											<p className="mt-2.5 text-center font-mono text-[12px] leading-[1.5] text-content-faint">
												Interest reveals only you to the student, never their
												contact.
											</p>
										</>
									) : (
										<p className="mt-2.5 text-center font-mono text-[12px] leading-[1.5] text-content-faint">
											Sponsors can express interest in this work.
										</p>
									)}
								</>
							)}
						</div>

						<div className={railCardCls}>
							<div className="mb-3 font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
								MVP links
							</div>
							{links.length > 0 ? (
								<div className="flex flex-col gap-2.5">
									{links.map(({ key, Icon, label, href }) => (
										<a
											key={key}
											href={href}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-2.5 rounded-[9px] border border-info-bd px-3 py-2.5 text-[14px] text-content-heading transition-colors hover:bg-surface-sunken"
										>
											<Icon className="size-[17px] text-action" aria-hidden />
											{label}
											<ArrowUpRight className="ml-auto size-4 text-content-ghost" />
										</a>
									))}
								</div>
							) : (
								<p className="text-[13px] text-content-soft">
									No links added yet.
								</p>
							)}
						</div>

						<div className="rounded-[14px] border border-[#c3d0f2] bg-[linear-gradient(180deg,#eef3ff,#e3ebfb)] p-[18px]">
							<div className="mb-2.5 flex items-center gap-2">
								<Lock
									className="size-[15px] text-content-heading"
									aria-hidden
								/>
								<span className="text-[14.5px] text-content-heading">
									Venture Pitch Vault
								</span>
							</div>
							<p className="mb-3.5 text-[13px] leading-[1.5] text-content-muted">
								Deck, financials &amp; cap table in the Lumen document vault —
								consent-gated, time-bound, signed-link access.
							</p>
							<button
								type="button"
								disabled
								className="h-[42px] w-full cursor-not-allowed rounded-[9px] bg-action/60 text-[14px] text-on-action"
							>
								{viewer === "owner" ? "Manage vault" : "Request access"} (P5)
							</button>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
