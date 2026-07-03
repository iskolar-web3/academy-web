import { z } from "zod";
import {
	type AcademyRole,
	academyRoleSchema,
	type SponsorKind,
	sponsorKindSchema,
} from "#/lib/auth/model";

/**
 * Account domain — profile view model + edit / role-confirm schemas. Types and schemas
 * are real (fixed by the PRD + `academy-server` migrations); the network calls in
 * `./api.ts` hit the endpoints the server P0 phase (`academy-server` docs) delivers.
 *
 * The edit shape mirrors the design-template EDIT PROFILE PAGE exactly — four fields:
 * Display name · Headline · School / organization · Bio. `org` maps to `student_profile.school`
 * for students and `sponsor_profile.org` for sponsors (server resolves by role).
 */

/** Aggregate counters shown on the profile header (0 until the showcase/grants ship). */
export const profileStatsSchema = z.object({
	projects: z.number(),
	upvotes: z.number(),
	raised: z.number(),
});
export type ProfileStats = z.infer<typeof profileStatsSchema>;

/**
 * The public/own profile record returned by `GET /accounts/:id/profile` and
 * `GET /accounts/me/profile` — the academy_user snapshot joined with the role profile.
 */
export const accountProfileSchema = z.object({
	academyUserId: z.string(),
	role: academyRoleSchema,
	sponsorKind: sponsorKindSchema.nullable(),
	displayName: z.string(),
	avatarUrl: z.string().nullable(),
	headline: z.string(),
	/** School (student) or organization (sponsor) — one label in the template. */
	org: z.string(),
	bio: z.string(),
	skills: z.array(z.string()),
	links: z.array(z.string()),
	stats: profileStatsSchema,
});
export type AccountProfile = z.infer<typeof accountProfileSchema>;

/** Own-profile edit body (design-template EDIT PROFILE PAGE — the four fields). */
export const profileEditSchema = z.object({
	displayName: z.string().min(2, "Name is too short").max(80),
	headline: z.string().max(120),
	org: z.string().max(120),
	bio: z.string().max(600),
});
export type ProfileEdit = z.infer<typeof profileEditSchema>;

/**
 * Role confirmation body (PLT-04). Confirming a role is one click for every role — sponsors
 * no longer pick a sub-kind at onboarding (they choose a subscription tier instead, see
 * `/sponsor/subscription`). `kind` is kept optional/nullable for wire compatibility.
 */
export const roleConfirmSchema = z.object({
	role: academyRoleSchema,
	kind: sponsorKindSchema.nullable().optional(),
});
export type RoleConfirmInput = z.infer<typeof roleConfirmSchema>;

/** Human label for a profile's role line, e.g. "Sponsor · Investor". */
export function roleLabel(role: AcademyRole, kind: SponsorKind | null): string {
	if (role === "sponsor" && kind) {
		return `Sponsor · ${kind[0].toUpperCase()}${kind.slice(1)}`;
	}
	return `${role[0].toUpperCase()}${role.slice(1)}`;
}
