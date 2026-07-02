import { z } from "zod";
import type { SponsorKind } from "#/lib/auth/model";

/**
 * Account domain — profile types + edit schemas. Types/schemas are real (known from the
 * PRD); the CRUD calls in `./api.ts` are stubbed until `academy-server` lands.
 */

export interface StudentProfile {
	userId: string;
	displayName: string;
	avatarUrl: string | null;
	school: string;
	program: string;
	specialty: string;
	bio: string;
	skills: string[];
	links: { github: string; website: string; linkedin: string };
}

export interface SponsorProfile {
	userId: string;
	displayName: string;
	avatarUrl: string | null;
	kind: SponsorKind;
	organization: string;
	focus: string;
	bio: string;
	website: string;
}

/** A URL field that also accepts empty (optional link left blank). */
const optionalUrl = z.union([z.url(), z.literal("")]);

export const studentProfileEditSchema = z.object({
	displayName: z.string().min(2, "Name is too short").max(80),
	school: z.string().min(2, "School is required").max(120),
	program: z.string().max(120),
	specialty: z.string().max(120),
	bio: z.string().max(600),
	skills: z.array(z.string().max(40)).max(20),
	links: z.object({
		github: optionalUrl,
		website: optionalUrl,
		linkedin: optionalUrl,
	}),
});
export type StudentProfileEdit = z.infer<typeof studentProfileEditSchema>;

export const sponsorProfileEditSchema = z.object({
	displayName: z.string().min(2, "Name is too short").max(80),
	organization: z.string().max(120),
	focus: z.string().max(160),
	bio: z.string().max(600),
	website: optionalUrl,
});
export type SponsorProfileEdit = z.infer<typeof sponsorProfileEditSchema>;
