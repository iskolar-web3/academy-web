import { z } from "zod";

/**
 * Project domain — types + schemas (real; not blocked). The MVP gate lives here as the
 * single source of truth: the draft/form schema is lax, the submit gate is strict.
 */

export const PROJECT_STATUSES = [
	"draft",
	"submitted",
	"under_review",
	"returned",
	"published",
	"withdrawn",
	"rejected",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = ["idea", "thesis_capstone"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const CATEGORIES = [
	"EdTech",
	"FinTech",
	"HealthTech",
	"AgriTech",
	"CleanTech",
	"AI/ML",
	"Civic",
	"Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type MemberConsent =
	| "not_required"
	| "pending"
	| "accepted"
	| "declined";

export interface ProjectMember {
	id: string;
	name: string;
	contribution: string;
	/** null = a non-user credit (name only); a value = a linked iSkolar user. */
	linkedUserId: string | null;
	consent: MemberConsent;
}

export interface ProjectLinks {
	demo: string;
	repo: string;
	video: string;
}

export interface ProjectOwnership {
	declared: boolean;
	/** File name only in the client-only build (real upload → Lumen vault in P1 server). */
	thesisPaperName: string | null;
}

export interface Project {
	id: string;
	title: string;
	category: Category | "";
	type: ProjectType;
	pitch: string;
	purpose: string;
	tech: string[];
	links: ProjectLinks;
	status: ProjectStatus;
	isTeam: boolean;
	members: ProjectMember[];
	ownership: ProjectOwnership;
	returnedNote: string | null;
	/** Deterministic "updated N days ago" (SSR-safe — no Date in render). */
	updatedDays: number;
	/** Display fields (server-owned): community upvotes, cover hue, owner's school. */
	upvotes: number;
	hue: number;
	school: string;
}

/** The fields a create/update accepts (status + lifecycle/display metadata are server-owned). */
export type ProjectInput = Omit<
	Project,
	| "id"
	| "status"
	| "returnedNote"
	| "updatedDays"
	| "upvotes"
	| "hue"
	| "school"
>;

const urlOrEmpty = z.union([z.url(), z.literal("")]);

/**
 * Form/draft schema — lax. A draft can be saved with just a title; URLs may be blank.
 * The strict MVP gate is applied separately at submit time (see `helper.mvpGateIssues`).
 */
export const projectFormSchema = z.object({
	title: z.string().min(2, "Title is too short").max(120),
	category: z.enum(CATEGORIES).or(z.literal("")),
	type: z.enum(PROJECT_TYPES),
	pitch: z.string().max(300),
	purpose: z.string().max(400),
	techText: z.string().max(300),
	links: z.object({ demo: urlOrEmpty, repo: urlOrEmpty, video: urlOrEmpty }),
	isTeam: z.boolean(),
	members: z.array(
		z.object({
			// Lax at the schema level (empty rows are dropped on save); the submit gate
			// enforces completeness for team projects.
			name: z.string().max(80),
			contribution: z.string().max(200),
			linked: z.boolean(),
		}),
	),
	ownershipDeclared: z.boolean(),
	thesisPaperName: z.string(),
});
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
