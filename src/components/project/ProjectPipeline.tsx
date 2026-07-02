import { Fragment } from "react";
import { type PipelineState, pipelineSteps } from "#/lib/project/helper";
import type { ProjectStatus } from "#/lib/project/model";

/**
 * Horizontal lifecycle tracker (Draft → Submitted → In review → Published), ported
 * 1:1 from the design-template STUDENT DASHBOARD. A returned project marks its current
 * stage in danger; upcoming stages stay muted.
 */

const DOT_BG: Record<PipelineState, string> = {
	done: "bg-action",
	current: "bg-action",
	returned: "bg-danger",
	upcoming: "bg-[#cbd5ef]",
};

const MARK: Record<PipelineState, string> = {
	done: "✓",
	current: "●",
	returned: "!",
	upcoming: "",
};

export function ProjectPipeline({ status }: { status: ProjectStatus }) {
	const steps = pipelineSteps(status);
	return (
		<div className="mt-[18px] mb-1.5 flex items-start">
			{steps.map((step) => (
				<Fragment key={step.label}>
					<div className="flex w-[58px] flex-none flex-col items-center sm:w-[74px]">
						<span
							className={`flex size-6 flex-none items-center justify-center rounded-full text-[11px] text-white ${DOT_BG[step.state]}`}
						>
							{MARK[step.state]}
						</span>
						<span
							className={`mt-1.5 text-center font-mono text-[10.5px] ${step.state === "upcoming" ? "text-content-ghost" : "text-action"}`}
						>
							{step.label}
						</span>
					</div>
					{!step.isLast ? (
						<span
							className={`mt-[11px] h-0.5 flex-1 ${step.state === "done" ? "bg-action" : "bg-info-bd"}`}
						/>
					) : null}
				</Fragment>
			))}
		</div>
	);
}
