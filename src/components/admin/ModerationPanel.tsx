import { toast } from "sonner";
import { useReviewDecision } from "#/hooks/review/useReviewDecision";
import { projectCover } from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";

/**
 * Moderation (ADM-05) — a 1:1 port of the design-template ADMIN › MODERATION: a Published
 * projects list (Flag / Unpublish, every action logged server-side) and an Open grant requests
 * list. Grant requests belong to the grants module (**P4**) — the section renders its design
 * with a stub note until that data exists, mirroring the P1 cross-phase-stub convention.
 */

export function ModerationPanel({
	projects,
	isLoading,
	isError,
}: {
	projects: Project[];
	isLoading: boolean;
	isError: boolean;
}) {
	const { moderate } = useReviewDecision();

	const act = (id: string, action: "unpublish" | "flag") =>
		moderate.mutate(
			{ id, input: { action } },
			{
				onSuccess: () =>
					toast.success(
						action === "flag" ? "Project flagged" : "Project unpublished",
					),
			},
		);

	return (
		<div>
			<p className="mb-6 text-[15px] text-content-soft">
				Unpublish or flag a published project, or cancel an abusive grant
				request. Every action is logged.
			</p>

			<div className="mb-3 text-[13px] text-content-heading">
				Published projects
			</div>
			{isLoading ? (
				<p className="text-[14px] text-content-soft">Loading…</p>
			) : isError ? (
				<p className="text-[14px] text-danger">
					Couldn’t load published projects.
				</p>
			) : projects.length === 0 ? (
				<p className="mb-8 text-[14px] text-content-soft">
					No published projects yet.
				</p>
			) : (
				<div className="mb-8 flex flex-col gap-3">
					{projects.map((p) => (
						<div
							key={p.id}
							className="flex items-center gap-3.5 rounded-[14px] border border-line bg-surface-card px-[18px] py-3.5"
						>
							<span
								className="size-10 flex-none rounded-[11px]"
								style={{ background: projectCover(p.hue) }}
							/>
							<div className="min-w-0 flex-1">
								<div className="text-[15.5px] text-content-heading">
									{p.title}
								</div>
								<div className="font-mono text-[12px] text-content-faint">
									{p.school || "iSkolar Academy"} ·{" "}
									{p.category || "Uncategorized"}
								</div>
							</div>
							<button
								type="button"
								disabled={moderate.isPending}
								onClick={() => act(p.id, "flag")}
								className="h-9 rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-content-muted transition-colors hover:bg-surface-sunken disabled:opacity-60"
							>
								⚑ Flag
							</button>
							<button
								type="button"
								disabled={moderate.isPending}
								onClick={() => act(p.id, "unpublish")}
								className="h-9 rounded-[9px] border border-[#f0c9cb] bg-surface-card px-3.5 text-[13px] text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
							>
								Unpublish
							</button>
						</div>
					))}
				</div>
			)}

			<div className="mb-3 text-[13px] text-content-heading">
				Open grant requests
			</div>
			<div className="rounded-[14px] border border-line border-dashed bg-surface-card px-[18px] py-5 text-[13.5px] text-content-soft">
				Grant requests appear here once the grants module ships in{" "}
				<span className="font-mono text-content-muted">P4</span>.
			</div>
		</div>
	);
}
