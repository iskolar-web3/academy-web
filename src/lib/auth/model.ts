import { z } from "zod";

/**
 * Auth domain — types + schemas. These are NOT blocked on the server: the role model
 * is fixed by the PRD, so the enums/schemas are real. Only the network calls in
 * `./api.ts` are stubbed until `academy-server` and the §3 token contract land.
 */

/** The three Academy roles. Seeded from iSkolar, confirmed at onboarding (PLT-04). */
export enum AcademyRole {
	Student = "student",
	Sponsor = "sponsor",
	Admin = "admin",
}

/** Sponsor sub-kind, chosen when a sponsor confirms their role. */
export enum SponsorKind {
	Investor = "investor",
	Recruiter = "recruiter",
	Employer = "employer",
}

export const academyRoleSchema = z.enum(AcademyRole);
export const sponsorKindSchema = z.enum(SponsorKind);

/** Cached base-profile snapshot mirrored from iSkolar on login (plan §9.6). */
export const sessionUserSchema = z.object({
	id: z.string(),
	email: z.email(),
	displayName: z.string(),
	avatarUrl: z.string().nullable(),
	/** null until the user confirms a role in onboarding. */
	role: academyRoleSchema.nullable(),
	sponsorKind: sponsorKindSchema.nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const sessionSchema = z.object({ user: sessionUserSchema });
export type Session = z.infer<typeof sessionSchema>;

/**
 * The `academy_user` record returned TODAY by `GET /auth/session`
 * (academy-server `account/model.ts`, camelCased). This is the real wire shape now —
 * the richer `SessionUser` above (email, cached profile, sponsorKind) is the target once
 * the server's step-9 session adaptation lands. Consume this until then.
 */
export const academyUserSchema = z.object({
	academyUserId: z.string(),
	iskolarUserId: z.string(),
	academyRole: academyRoleSchema,
	roleConfirmed: z.boolean(),
	/** True once the basic-info onboarding step (name + school/org) is submitted. */
	onboardingCompleted: z.boolean(),
	displayName: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type AcademyUser = z.infer<typeof academyUserSchema>;
