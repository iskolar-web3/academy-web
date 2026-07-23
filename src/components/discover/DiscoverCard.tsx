import { Link } from "@tanstack/react-router";
import { UpvoteButton } from "#/components/project/UpvoteButton";
import { useToggleUpvote } from "#/hooks/upvote/useToggleUpvote";
import type { ShowcaseProject } from "#/lib/discover/model";
import { projectCover } from "#/lib/project/helper";
import { PROJECT_TYPE_LABELS as TYPE_LABEL } from "#/lib/project/model";

/**
 * Showcase gallery card — a 1:1 port of the design-template GALLERY card: striped hue
 * cover + trending badge, title, category + type chips, school, 3-line pitch, tech chips
 * (+N more), overlapping member avatars, and the wired upvote control (PLT-08). The cover
 * and the text block open the project detail (`/projects/:id`); the upvote button stays
 * outside that link. Renders the live published projection (`ShowcaseProject`).
 */

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

export function DiscoverCard({ project }: { project: ShowcaseProject }) {
	const toggle = useToggleUpvote();
	const tech = project.tech.slice(0, 3);
	const more = project.tech.length - tech.length;
	const to = "/projects/$projectId";
	const params = { projectId: project.id };

	return (
		<div className="card-surface flex h-[452px] flex-col overflow-hidden rounded-[15px] transition-transform hover:-translate-y-1">
			<Link
				to={to}
				params={params}
				className="relative flex h-32 flex-none items-start justify-end p-3.5"
				style={{ background: projectCover(project.hue) }}
			>
				<div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.10)_9px,transparent_9px,transparent_20px)]" />
				{project.trending ? (
					<span className="chip chip--trending relative">▲ Trending</span>
				) : null}
			</Link>

			<div className="flex min-h-0 flex-1 flex-col px-[17px] pt-4 pb-[17px]">
				<Link to={to} params={params} className="flex min-h-0 flex-1 flex-col">
					<span className="mb-3.5 flex items-center gap-1.5 truncate text-[18.5px] leading-tight text-content-heading">
						{project.title}
						{project.verified ? (
							<span
								title="Verified Builder"
								className="text-[14px] text-verified"
							>
								✔
							</span>
						) : null}
					</span>
					<div className="mb-[7px] flex items-center gap-[7px] overflow-hidden">
						<span className="chip chip--category flex-none">
							{project.category || "Uncategorized"}
						</span>
						<span className="chip chip--type flex-none">
							{TYPE_LABEL[project.type]}
						</span>
					</div>
					<div className="mb-[11px] truncate font-mono text-[12px] text-content-faint">
						{project.school || "iSkolar Academy"}
					</div>
					<p className="mb-[13px] line-clamp-3 h-[63px] text-[14px] leading-normal text-content-soft">
						{project.pitch}
					</p>
					<div className="mb-[14px] flex gap-1.5 overflow-hidden">
						{tech.map((t) => (
							<span key={t} className="chip chip--category flex-none">
								{t}
							</span>
						))}
						{more > 0 ? (
							<span className="chip chip--tech flex-none">+{more} more</span>
						) : null}
					</div>
				</Link>

				<div className="mt-auto flex items-center justify-between border-[#eef1fa] border-t pt-[13px]">
					<div className="flex items-center">
						{project.members.map((m) => (
							<span
								key={m.id}
								title={m.name}
								className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-surface-card bg-action text-[11px] text-white first:ml-0"
							>
								{initialsOf(m.name)}
							</span>
						))}
					</div>
					<UpvoteButton
						count={project.upvotes}
						upvoted={project.upvotedByMe}
						onToggle={() => toggle.mutate(project.id)}
					/>
				</div>
			</div>
		</div>
	);
}
