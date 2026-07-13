import { z } from "zod";
import { CATEGORIES } from "#/lib/project/model";

/**
 * Grant domain — types + schemas (P4). A grant request is self-declared (FR-G3: no admin
 * review gate) and goes live the moment it's created — there is no draft state, unlike
 * `project`. Reference-pass corrections from the design-template (GRANTS GALLERY §~520,
 * GRANT DETAIL + FUND FLOW §~553, CREATE GRANT REQUEST §~1348):
 * - No structured team roster — `GRANTS()`'s seed `members` field is never rendered
 *   anywhere in the template; "Individual or team" is a single free-text descriptor.
 * - No deadline field exists in the create form — the template's "days left" is decorative
 *   seed data with no real input; `createdDays` ("posted N days ago") substitutes, mirroring
 *   `Project.updatedDays`.
 * - Category is a free-text placeholder in the template's static prototype, but per the
 *   plan's settled decision ("category is a fixed curated list"), reuses `CATEGORIES`.
 */

export const GRANT_STATUSES = [
	"open",
	"funded",
	"closed",
	"cancelled",
] as const;
export type GrantStatus = (typeof GRANT_STATUSES)[number];

export interface GrantRequest {
	id: string;
	title: string;
	category: (typeof CATEGORIES)[number] | "";
	tech: string[];
	purpose: string;
	/** Free-text descriptor ("Individual", "Team of 3") — no structured roster. */
	teamNote: string;
	/** Pesos (plain number, no client-side centavos math — see next-steps-lumen-p4-p5.md). */
	target: number;
	/** Server-computed sum of contributions. */
	raised: number;
	/** Server-computed contribution count. */
	backers: number;
	status: GrantStatus;
	ownershipDeclared: boolean;
	/** Display filename of the stored title-proposal PDF — mirrors `ownership.thesisPaperName`. */
	proposalName: string | null;
	/** Deterministic "posted N days ago" (SSR-safe — no Date in render). */
	createdDays: number;
	/** Display fields (server-owned): cover hue, owner's school. */
	hue: number;
	school: string;
}

/** The fields a create accepts (status/raised/backers/createdDays/hue/school are server-owned). */
export type GrantInput = Omit<
	GrantRequest,
	"id" | "status" | "raised" | "backers" | "createdDays" | "hue" | "school"
>;

/** Wire schema for a `GrantRequest` returned by academy-server. */
export const grantSchema = z.object({
	id: z.string(),
	title: z.string(),
	category: z.enum(CATEGORIES).or(z.literal("")),
	tech: z.array(z.string()),
	purpose: z.string(),
	teamNote: z.string(),
	target: z.number(),
	raised: z.number(),
	backers: z.number(),
	status: z.enum(GRANT_STATUSES),
	ownershipDeclared: z.boolean(),
	proposalName: z.string().nullable(),
	createdDays: z.number(),
	hue: z.number(),
	school: z.string(),
});

export const grantListSchema = z.array(grantSchema);

/**
 * Create-form schema — the template's single "Publish grant request" step (no draft).
 * The proposal file itself isn't in this schema (handled as a separate `File` alongside the
 * form values); `proposalName` here just gates that a file was picked before publish.
 */
export const grantFormSchema = z.object({
	title: z.string().min(2, "Title is too short").max(120),
	category: z.enum(CATEGORIES).or(z.literal("")),
	techText: z.string().max(300),
	purpose: z.string().max(400),
	teamNote: z.string().max(80),
	targetRaw: z.string(),
	ownershipDeclared: z.boolean(),
	proposalName: z.string(),
});
export type GrantFormValues = z.infer<typeof grantFormSchema>;
