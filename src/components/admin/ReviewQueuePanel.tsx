import type { Project } from "#/lib/project/model";
import { PROJECT_TYPE_LABELS as TYPE_LABEL } from "#/lib/project/model";

/**
 * Review queue (ADM-01) — a 1:1 port of the design-template ADMIN › REVIEW QUEUE: an intro
 * line then a column of submission cards (title · type pill · school · submitted · MVP-link
 * summary) each opening the review modal. Pass / fail, no scoring.
 */

/** MVP-link summary line; missing a required demo/repo turns it into a red warning. */
function linkSummary(p: Project): { label: string; danger: boolean } {
	const present: string[] = [];
	if (p.links.demo) present.push("Live demo");
	if (p.links.repo) present.push("Repository");
	if (p.links.video) present.push("Demo video");
	const missing = !p.links.demo || !p.links.repo;
	return {
		label: present.length ? present.join(" · ") : "No MVP links",
		danger: missing,
	};
}

export function ReviewQueuePanel({
	projects,
	isLoading,
	isError,
	onOpen,
}: {
	projects: Project[];
	isLoading: boolean;
	isError: boolean;
	onOpen: (project: Project) => void;
}) {
	return (
		<div>
			<p className="mb-6 text-[15px] text-content-soft">
				Confirm the MVP runs and the purpose is clear. Pass / fail, no scoring,
				no ranking.
			</p>

			{isLoading ? (
				<p className="text-[14px] text-content-soft">Loading the queue…</p>
			) : isError ? (
				<p className="text-[14px] text-danger">
					Couldn’t load the review queue. Try again.
				</p>
			) : projects.length === 0 ? (
				<div className="card-surface p-8 text-center">
					<p className="text-content-heading">The queue is clear</p>
					<p className="mt-1.5 text-[14px] text-content-soft">
						No submissions are waiting for review.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-3.5">
					{projects.map((p) => {
						const links = linkSummary(p);
						return (
							<div
								key={p.id}
								className="rounded-[14px] border border-line bg-surface-card px-5 py-[18px]"
							>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<div className="mb-1.5 flex items-center gap-2.5">
											<span className="text-[18px] text-content-heading">
												{p.title}
											</span>
											<span className="rounded-[6px] bg-[#dfe6fa] px-[9px] py-[3px] font-mono text-[11.5px] text-content-heading">
												{TYPE_LABEL[p.type]}
											</span>
										</div>
										<div className="mb-2.5 font-mono text-[12.5px] text-content-faint">
											{p.school || "iSkolar Academy"} · submitted{" "}
											{p.updatedDays === 0 ? "today" : `${p.updatedDays}d ago`}
										</div>
										<div
											className={`font-mono text-[12.5px] ${links.danger ? "text-danger" : "text-content-faint"}`}
										>
											{links.label}
										</div>
									</div>
									<button
										type="button"
										onClick={() => onOpen(p)}
										className="h-[42px] whitespace-nowrap rounded-[11px] bg-action px-5 text-[13.5px] text-on-action shadow-[0_5px_14px_rgba(58,82,166,0.22)] transition-colors hover:bg-action-hover"
									>
										Review submission →
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
