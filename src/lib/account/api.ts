import { queryOptions } from "@tanstack/react-query";
import type {
	SponsorProfileEdit,
	StudentProfileEdit,
} from "#/lib/account/model";

/**
 * Account API — STUBBED. Blocked on `academy-server`. Query keys and signatures are
 * final so `hooks/account/*` and the profile UI can be built against them now.
 */

const NOT_WIRED = "account API not wired yet — blocked on academy-server";

/** Read one profile by user id (STU-02 / SPN-02). TODO(P0): GET /profiles/:id. */
export function profileQuery(userId: string) {
	return queryOptions({
		queryKey: ["account", "profile", userId] as const,
		queryFn: async () => {
			throw new Error(NOT_WIRED);
		},
	});
}

/** Update own student profile (STU-01). TODO(P0): PATCH /profiles/me (student). */
export async function updateStudentProfile(
	_input: StudentProfileEdit,
): Promise<void> {
	throw new Error(NOT_WIRED);
}

/** Update own sponsor profile (SPN-01). TODO(P0): PATCH /profiles/me (sponsor). */
export async function updateSponsorProfile(
	_input: SponsorProfileEdit,
): Promise<void> {
	throw new Error(NOT_WIRED);
}

/** Confirm the seeded role at onboarding (PLT-04). TODO(P0): POST /account/role. */
export async function confirmRole(): Promise<void> {
	throw new Error(NOT_WIRED);
}
