import { Link } from "@tanstack/react-router";
import { ReviewEvidenceChips } from "#/components/project/ReviewCheckPanel";
import { UpvoteButton } from "#/components/project/UpvoteButton";
import { useToggleUpvote } from "#/hooks/upvote/useToggleUpvote";
import type { ShowcaseProject } from "#/lib/discover/model";
import { projectCover } from "#/lib/project/helper";
import { PROJECT_TYPE_LABELS as TYPE_LABEL } from "#/lib/project/model";

/**
 * Showcase gallery card — a 1:1 port of the design-template GALLERY card: hue
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

export function DiscoverCard({
	project,
	canUpvote = true,
}: {
	project: ShowcaseProject;
	canUpvote?: boolean;
}) {
	const toggle = useToggleUpvote();
	const tech = project.tech.slice(0, 3);
	const more = project.tech.length - tech.length;
	const to = "/projects/$projectId";
	const params = { projectId: project.id };

	return (
		<div className="card-surface flex h-[400px] min-w-0 flex-col overflow-hidden rounded-[15px] transition-colors hover:border-action">
			<Link
				to={to}
				params={params}
				className="relative flex h-24 flex-none items-start justify-end p-3"
				style={{ background: projectCover(project.hue) }}
			>
				{project.trending ? (
					<span className="chip chip--trending relative">▲ Trending</span>
				) : null}
			</Link>

			<div className="flex min-h-0 flex-1 flex-col px-4 pt-3 pb-3">
				<Link to={to} params={params} className="flex min-h-0 flex-1 flex-col">
					<span className="mb-2 flex min-w-0 items-center gap-1.5 text-[18px] leading-tight text-content-heading">
						<span className="min-w-0 truncate" title={project.title}>
							{project.title}
						</span>
						{project.verified ? (
							<span
								title="Verified Builder"
								className="text-[14px] text-verified"
							>
								✔
							</span>
						) : null}
					</span>
					<div className="mb-1.5 flex min-w-0 items-center gap-[7px] overflow-hidden">
						<span className="chip chip--category min-w-0 truncate">
							{project.category || "Uncategorized"}
						</span>
						<span className="chip chip--type min-w-0 truncate">
							{TYPE_LABEL[project.type]}
						</span>
					</div>
					<div className="mb-2 truncate font-mono text-[12px] text-content-faint">
						{project.school || "iSkolar Academy"}
					</div>
					<p className="mb-2 line-clamp-2 h-[42px] text-[14px] leading-normal text-content-soft">
						{project.pitch}
					</p>
					<div className="mb-2 flex min-h-6 gap-1.5 overflow-hidden">
						{tech.map((t) => (
							<span key={t} className="chip chip--category flex-none">
								{t}
							</span>
						))}
						{more > 0 ? (
							<span className="chip chip--tech flex-none">+{more} more</span>
						) : null}
					</div>
					<div className="mb-2 h-7 overflow-hidden">
						<ReviewEvidenceChips project={project} max={2} />
					</div>
				</Link>

				<div className="mt-auto flex min-w-0 items-center justify-between border-[#eef1fa] border-t pt-2">
					<div className="flex min-w-0 items-center overflow-hidden">
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
					{canUpvote ? (
						<UpvoteButton
							count={project.upvotes}
							showCount={false}
							upvoted={project.upvotedByMe}
							onToggle={() => toggle.mutate(project.id)}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
}
