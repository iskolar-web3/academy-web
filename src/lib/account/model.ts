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

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const EDUCATION_LEVELS = [
	"secondary_education",
	"tertiary_education",
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

/** iSkolar-main's exact option copy — shared by the onboarding form and the profile view. */
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
	secondary_education: "Secondary Education (High School)",
	tertiary_education: "Tertiary Education (Higher Education)",
};

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

/**
 * Own-profile view — `GET /accounts/me/profile` only. Adds the onboarding-only fields
 * on top of `AccountProfile` (gender/birth date/phone/education level) so the signed-in
 * user can see what they entered at onboarding. These are PII — the public
 * `GET /accounts/:id/profile` (someone else's profile) never returns them; `null` for a
 * role/field combination that doesn't apply (sponsor has no gender/birthDate/
 * educationLevel; admin has none of the four).
 */
export const myAccountProfileSchema = accountProfileSchema.extend({
	gender: z.enum(GENDERS).nullable(),
	birthDate: z.string().nullable(),
	phone: z.string().nullable(),
	educationLevel: z.enum(EDUCATION_LEVELS).nullable(),
});
export type MyAccountProfile = z.infer<typeof myAccountProfileSchema>;

/** Own-profile edit body (design-template EDIT PROFILE PAGE — the four fields). */
export const profileEditSchema = z.object({
	displayName: z.string().min(2, "Name is too short").max(80),
	headline: z.string().max(120),
	org: z.string().max(120),
	bio: z.string().max(600),
});
export type ProfileEdit = z.infer<typeof profileEditSchema>;

/**
 * Onboarding basic-info — one form per role, submitted to `POST /accounts/me/onboarding`
 * (flips `onboardingCompleted`). Mirrors the actual fields iSkolar-main's own onboarding
 * collects (`iskolar-main/web/src/lib/student/model.ts`'s `createStudentRequestSchema`;
 * `iskolar-main/web/src/lib/sponsor/model.ts`'s `create*SponsorRequestSchema`) — stored
 * independently in Academy's own `academy_user`/role-profile rows, not fetched from
 * iskolar-main (no cross-service endpoint exists for that).
 *
 * Sponsor genuinely branches three ways here, matching iSkolar-main's own
 * individual/organization/government sponsor forms field-for-field — corrected after an
 * earlier pass wrongly collapsed these into one non-branching form. Academy's `sponsor`
 * academyRole stays a single role either way (`sponsorType` is new, additive metadata on
 * `sponsor_profile`, not a new top-level role) — subscription/vault/badge don't need to
 * know which sponsor type a sponsor is. Admin has no iSkolar-main counterpart — just a
 * name.
 */

export const studentOnboardingSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(60),
	middleName: z.string().max(60).optional(),
	lastName: z.string().min(1, "Last name is required").max(60),
	gender: z.enum(GENDERS),
	birthDate: z.string().min(1, "Birth date is required"),
	phone: z.string().min(1, "Phone number is required").max(30),
	educationLevel: z.enum(EDUCATION_LEVELS),
	schoolName: z.string().min(1, "School name is required").max(120),
});
export type StudentOnboardingInput = z.infer<typeof studentOnboardingSchema>;

export const SPONSOR_TYPES = [
	"individual",
	"organization",
	"government",
] as const;
export type SponsorType = (typeof SPONSOR_TYPES)[number];

export const EMPLOYMENT_TYPES = [
	"employed",
	"self_employed",
	"freelancer",
	"ofw",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
	employed: "Employed",
	self_employed: "Self-Employed",
	freelancer: "Freelancer",
	ofw: "OFW (Overseas Filipino Worker)",
};

export const ORGANIZATION_TYPES = [
	"private_company",
	"non_governmental_organization",
	"educational_institution",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
	private_company: "Private Company",
	non_governmental_organization: "Non-Governmental Organization",
	educational_institution: "Educational Institution",
};

export const AGENCY_TYPES = [
	"national_government_agency",
	"local_government_unit",
	"government_owned_and_controlled_corporation",
] as const;
export type AgencyType = (typeof AGENCY_TYPES)[number];
export const AGENCY_TYPE_LABELS: Record<AgencyType, string> = {
	national_government_agency: "National Government Agency",
	local_government_unit: "Local Government Unit",
	government_owned_and_controlled_corporation:
		"Government-Owned and Controlled Corporation",
};

export const individualSponsorOnboardingSchema = z.object({
	sponsorType: z.literal("individual"),
	firstName: z.string().min(1, "First name is required").max(60),
	middleName: z.string().max(60).optional(),
	lastName: z.string().min(1, "Last name is required").max(60),
	employmentType: z.enum(EMPLOYMENT_TYPES),
	birthDate: z.string().min(1, "Birth date is required"),
	phone: z.string().min(1, "Phone number is required").max(30),
});
export type IndividualSponsorOnboardingInput = z.infer<
	typeof individualSponsorOnboardingSchema
>;

export const organizationSponsorOnboardingSchema = z.object({
	sponsorType: z.literal("organization"),
	name: z.string().min(1, "Organization name is required").max(120),
	organizationType: z.enum(ORGANIZATION_TYPES),
	phone: z.string().min(1, "Phone number is required").max(30),
});
export type OrganizationSponsorOnboardingInput = z.infer<
	typeof organizationSponsorOnboardingSchema
>;

export const governmentSponsorOnboardingSchema = z.object({
	sponsorType: z.literal("government"),
	name: z.string().min(1, "Agency name is required").max(120),
	agencyType: z.enum(AGENCY_TYPES),
	phone: z.string().min(1, "Phone number is required").max(30),
});
export type GovernmentSponsorOnboardingInput = z.infer<
	typeof governmentSponsorOnboardingSchema
>;

export type SponsorOnboardingInput =
	| IndividualSponsorOnboardingInput
	| OrganizationSponsorOnboardingInput
	| GovernmentSponsorOnboardingInput;

export const adminOnboardingSchema = z.object({
	displayName: z.string().min(2, "Name is too short").max(80),
});
export type AdminOnboardingInput = z.infer<typeof adminOnboardingSchema>;

export type OnboardingInput =
	| ({ role: "student" } & StudentOnboardingInput)
	| ({ role: "sponsor" } & SponsorOnboardingInput)
	| ({ role: "admin" } & AdminOnboardingInput);

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
