import { statusMeta } from "#/lib/project/helper";
import type { ProjectStatus } from "#/lib/project/model";

/** Lifecycle status pill (draft → published → …). */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
	const { label, tone } = statusMeta(status);
	return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}
