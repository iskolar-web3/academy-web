import type {
	MemberConsent,
	Project,
	ProjectFormValues,
	ProjectInput,
	ProjectStatus,
} from "#/lib/project/model";

/** Pure helpers for the project domain — status machine, MVP gate, form mappers. */

export function isValidUrl(value: string): boolean {
	try {
		const u = new URL(value);
		return u.protocol === "http:" || u.protocol === "https:";
	} catch {
		return false;
	}
}

export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

interface StatusMeta {
	label: string;
	tone: StatusTone;
}

const STATUS_META: Record<ProjectStatus, StatusMeta> = {
	draft: { label: "Draft", tone: "neutral" },
	submitted: { label: "Submitted", tone: "info" },
	under_review: { label: "Under review", tone: "info" },
	returned: { label: "Returned", tone: "warning" },
	published: { label: "Published", tone: "success" },
	withdrawn: { label: "Withdrawn", tone: "neutral" },
	rejected: { label: "Rejected", tone: "danger" },
};

export function statusMeta(status: ProjectStatus): StatusMeta {
	return STATUS_META[status];
}

export type ProjectAction =
	| "view"
	| "edit"
	| "submit"
	| "delete"
	| "withdraw"
	| "resubmit";

const NEXT_ACTIONS: Record<ProjectStatus, ProjectAction[]> = {
	draft: ["edit", "submit", "delete"],
	submitted: ["view"],
	under_review: ["view"],
	returned: ["edit", "resubmit"],
	published: ["edit", "withdraw"],
	withdrawn: ["resubmit"],
	rejected: ["view"],
};

export function nextActions(status: ProjectStatus): ProjectAction[] {
	return NEXT_ACTIONS[status];
}

/** Cover gradient from a hue (mirrors the design-template's `cover()` helper exactly). */
export function projectCover(hue: number): string {
	const h = 208 + (Math.abs(hue) % 42);
	const l = 41 + (Math.abs(hue) % 4) * 3;
	return `linear-gradient(135deg,hsl(${h},48%,${l}%),hsl(${h + 16},62%,64%))`;
}

/** Stable hue from a string, for user-created projects that have no seeded hue. */
export function hueFromString(value: string): number {
	let h = 0;
	for (let i = 0; i < value.length; i += 1) {
		h = (h * 31 + value.charCodeAt(i)) % 360;
	}
	return h;
}

/** The four public lifecycle stages the dashboard pipeline tracker renders. */
export const PIPELINE_STAGES = [
	"Draft",
	"Submitted",
	"In review",
	"Published",
] as const;

const STAGE_INDEX: Record<ProjectStatus, number> = {
	draft: 0,
	submitted: 1,
	under_review: 2,
	returned: 2,
	published: 3,
	withdrawn: 0,
	rejected: 2,
};

export type PipelineState = "done" | "current" | "returned" | "upcoming";

export interface PipelineStep {
	label: string;
	state: PipelineState;
	isLast: boolean;
}

/** Pipeline tracker steps for a status (design-template STUDENT DASHBOARD logic). */
export function pipelineSteps(status: ProjectStatus): PipelineStep[] {
	const currentIndex = STAGE_INDEX[status];
	const isReturned = status === "returned";
	return PIPELINE_STAGES.map((label, i) => {
		let state: PipelineState;
		if (i < currentIndex) state = "done";
		else if (i === currentIndex) state = isReturned ? "returned" : "current";
		else state = "upcoming";
		return { label, state, isLast: i === PIPELINE_STAGES.length - 1 };
	});
}

export interface DashboardStat {
	label: string;
	value: number;
}

/** The four stat tiles above the project pipeline (design-template mapping). */
export function dashboardStats(projects: Project[]): DashboardStat[] {
	return [
		{
			label: "Published",
			value: projects.filter((p) => p.status === "published").length,
		},
		{
			label: "In review",
			value: projects.filter((p) => p.status === "under_review").length,
		},
		{
			label: "Needs action",
			value: projects.filter(
				(p) => p.status === "returned" || p.status === "draft",
			).length,
		},
		{
			label: "Total upvotes",
			value: projects.reduce((sum, p) => sum + (p.upvotes || 0), 0),
		},
	];
}

export interface DashboardAction {
	label: string;
	/** Where the single card action goes — the edit flow or the read-only detail view. */
	kind: "edit" | "view";
}

/** The single per-card action shown on the dashboard (design-template labels). */
export function dashboardAction(status: ProjectStatus): DashboardAction {
	switch (status) {
		case "draft":
			return { label: "Continue draft", kind: "edit" };
		case "returned":
		case "withdrawn":
			return { label: "Resubmit", kind: "edit" };
		case "published":
			return { label: "View live", kind: "view" };
		default:
			return { label: "View", kind: "view" };
	}
}

/**
 * Tailwind classes for the 6px status badge used on dashboard project cards — the exact
 * color pairs from the design-template's student `stStatus` map (distinct from the pill).
 */
export function statusChipClass(status: ProjectStatus): string {
	const map: Record<ProjectStatus, string> = {
		draft: "text-content-soft bg-neutral-bg",
		submitted: "text-action bg-info-bg",
		under_review: "text-content-heading bg-[#dfe6fa]",
		returned: "text-danger bg-danger-bg",
		published: "text-success bg-success-bg",
		withdrawn: "text-content-soft bg-neutral-bg",
		rejected: "text-danger bg-danger-bg",
	};
	return map[status];
}

/**
 * Editing these fields on a published project re-enters review (STU-11): the MVP links,
 * the title, or the category. Description/tech/members edits stay published.
 */
export function triggersReReview(
	before: Project,
	after: ProjectInput,
): boolean {
	return (
		before.title !== after.title ||
		before.category !== after.category ||
		before.links.demo !== after.links.demo ||
		before.links.repo !== after.links.repo ||
		before.links.video !== after.links.video
	);
}

export interface GateIssue {
	/** react-hook-form field path. */
	path: string;
	message: string;
}

/**
 * The strict MVP submission gate (STU-04/05). Returns the list of blocking issues; an
 * empty array means the project may be submitted.
 */
export function mvpGateIssues(v: ProjectFormValues): GateIssue[] {
	const issues: GateIssue[] = [];
	if (!v.category) {
		issues.push({ path: "category", message: "Pick a category" });
	}
	if (v.pitch.trim().length < 20) {
		issues.push({ path: "pitch", message: "Add a short pitch (20+ chars)" });
	}
	if (v.purpose.trim().length < 20) {
		issues.push({
			path: "purpose",
			message: "Describe the purpose (20+ chars)",
		});
	}
	if (!isValidUrl(v.links.demo)) {
		issues.push({ path: "links.demo", message: "Enter a valid demo URL" });
	}
	if (!isValidUrl(v.links.repo)) {
		issues.push({ path: "links.repo", message: "Enter a valid repo URL" });
	}
	if (!isValidUrl(v.links.video)) {
		issues.push({ path: "links.video", message: "Enter a valid video URL" });
	}
	if (!v.ownershipDeclared) {
		issues.push({
			path: "ownershipDeclared",
			message: "Confirm ownership to submit",
		});
	}
	if (v.type === "thesis_capstone" && !v.thesisPaperName) {
		issues.push({
			path: "thesisPaperName",
			message: "Upload the thesis/capstone paper",
		});
	}
	return issues;
}

/** Map form values → the fields a create/update accepts. */
export function formToProjectInput(v: ProjectFormValues): ProjectInput {
	return {
		title: v.title.trim(),
		category: v.category,
		type: v.type,
		pitch: v.pitch.trim(),
		purpose: v.purpose.trim(),
		tech: v.techText
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
		links: v.links,
		isTeam: v.isTeam,
		members: v.isTeam
			? v.members
					.filter((m) => m.name.trim())
					.map((m, i) => ({
						id: `m${i}`,
						name: m.name.trim(),
						contribution: m.contribution.trim(),
						linkedUserId: m.linked ? `linked-${i}` : null,
						consent: (m.linked ? "pending" : "not_required") as MemberConsent,
					}))
			: [],
		ownership: {
			declared: v.ownershipDeclared,
			thesisPaperName: v.thesisPaperName || null,
		},
	};
}

/** Map a stored project → form values (for the edit flow). */
export function projectToFormValues(p: Project): ProjectFormValues {
	return {
		title: p.title,
		category: p.category,
		type: p.type,
		pitch: p.pitch,
		purpose: p.purpose,
		techText: p.tech.join(", "),
		links: { ...p.links },
		isTeam: p.isTeam,
		members: p.members.map((m) => ({
			name: m.name,
			contribution: m.contribution,
			linked: m.linkedUserId !== null,
		})),
		ownershipDeclared: p.ownership.declared,
		thesisPaperName: p.ownership.thesisPaperName ?? "",
	};
}

/** Blank form values for a new draft. */
export function emptyFormValues(): ProjectFormValues {
	return {
		title: "",
		category: "",
		type: "idea",
		pitch: "",
		purpose: "",
		techText: "",
		links: { demo: "", repo: "", video: "" },
		isTeam: false,
		members: [],
		ownershipDeclared: false,
		thesisPaperName: "",
	};
}
