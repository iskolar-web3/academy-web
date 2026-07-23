import { Link } from "@tanstack/react-router";
import {
	useToggleWatch,
	useWatchlist,
} from "#/hooks/saved-search/useWatchlist";
import { useEntitlement } from "#/hooks/subscription/useEntitlement";
import type { ShowcaseProject } from "#/lib/discover/model";
import { projectCover } from "#/lib/project/helper";

/**
 * Deal-flow feed card — a 1:1 port of the design-template SPONSOR DEAL-FLOW feed card
 * shape (avatar/author/handle/time/kind badge, a preview block, upvotes + Watch + Open).
 *
 * **Reference-pass correction:** the template's per-card narrative caption (`p.text`, e.g.
 * "just crossed 340 upvotes") comes from `ftext()`, a fixed rotation of decorative flavor
 * sentences with no real event backing them — this app has no activity-log system tracking
 * "when did X happen" for a project. Rather than fabricate events, the caption line is
 * dropped and the real pitch (already shown in the template's own nested preview block)
 * carries the description. The rotating "kind" tag is replaced with the real `trending`
 * flag or the project's real category — both genuinely true of the project, unlike the
 * decorative kind rotation.
 */
export function DealFlowCard({ project }: { project: ShowcaseProject }) {
	const watchEntitled = useEntitlement("watchlists");
	const { data: watchIds = [] } = useWatchlist();
	const toggleWatch = useToggleWatch();
	const watched = watchIds.includes(project.id);

	const initials = project.title.slice(0, 2).toUpperCase();
	const tech = project.tech.slice(0, 3);

	return (
		<div className="card-surface overflow-hidden rounded-2xl">
			<div className="flex items-center gap-3 px-[18px] pt-4 pb-3">
				<span
					className="flex size-[46px] flex-none items-center justify-center rounded-[13px] text-[15px] text-white"
					style={{ background: projectCover(project.hue) }}
				>
					{initials}
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-[7px]">
						<span className="truncate text-[15.5px] text-content-heading">
							{project.title}
						</span>
						{project.verified ? (
							<span
								title="Verified Builder"
								className="text-[13px] text-verified"
							>
								✔
							</span>
						) : null}
					</div>
					<div className="font-mono text-[11.5px] text-content-faint">
						{project.school || "iSkolar Academy"}
					</div>
				</div>
				{project.trending ? (
					<span className="rounded-full border border-info-bd bg-surface-tint px-2.5 py-[5px] font-mono text-[11px] text-action">
						▲ Trending
					</span>
				) : (
					<span className="rounded-full border border-info-bd bg-surface-tint px-2.5 py-[5px] font-mono text-[11px] text-action">
						{project.category || "Uncategorized"}
					</span>
				)}
			</div>

			<Link
				to="/projects/$projectId"
				params={{ projectId: project.id }}
				className="mx-[18px] mb-3.5 block overflow-hidden rounded-[13px] border border-[#e3ebfb] transition-colors hover:border-action/40"
			>
				<div
					className="h-[10px]"
					style={{ background: projectCover(project.hue) }}
				/>
				<div className="p-[15px]">
					<p className="mb-2.5 line-clamp-2 text-[13px] leading-normal text-content-soft">
						{project.pitch}
					</p>
					<div className="flex flex-wrap gap-1.5">
						{tech.map((t) => (
							<span key={t} className="chip chip--category">
								{t}
							</span>
						))}
					</div>
				</div>
			</Link>

			<div className="flex items-center justify-between border-[#eef1fa] border-t px-[18px] py-3">
				<span className="text-[13px] text-action">
					♥ {project.upvotes} upvotes
				</span>
				<div className="flex gap-2.5">
					{watchEntitled ? (
						<button
							type="button"
							disabled={toggleWatch.isPending}
							onClick={() => toggleWatch.mutate(project.id)}
							className={`h-[34px] rounded-[10px] px-3.5 font-mono text-[12.5px] transition-colors disabled:opacity-60 ${
								watched
									? "border border-action bg-action text-white"
									: "border border-line bg-surface-card text-content-muted hover:bg-surface-sunken"
							}`}
						>
							{watched ? "★ Watching" : "☆ Watch"}
						</button>
					) : null}
					<Link
						to="/projects/$projectId"
						params={{ projectId: project.id }}
						className="btn btn-primary flex h-[34px] items-center rounded-[10px] text-[12.5px]"
					>
						Open
					</Link>
				</div>
			</div>
		</div>
	);
}
