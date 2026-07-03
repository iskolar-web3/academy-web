import { queryOptions } from "@tanstack/react-query";
import {
	type AccountProfile,
	accountProfileSchema,
	type ProfileEdit,
	type RoleConfirmInput,
} from "#/lib/account/model";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import { type AcademyUser, academyUserSchema } from "#/lib/auth/model";

/**
 * Account API. Calls the `account` slice on `academy-server` (see that repo's
 * `documentation/phases/P0-foundation-server.md` for the endpoint contract). All read
 * paths return the `AccountProfile` view model; writes return the fresh record so the
 * cache updates without a second round-trip. The SSO cookie rides along via `apiFetch`.
 */

/** Own profile (prefills the edit form + the account header). `GET /accounts/me/profile`. */
export function myProfileQuery() {
	return queryOptions({
		queryKey: ["account", "profile", "me"] as const,
		queryFn: async (): Promise<AccountProfile> => {
			const res = await apiFetch<ApiEnvelope<unknown>>("/accounts/me/profile");
			return accountProfileSchema.parse(res.data);
		},
	});
}

/** A public profile by academy user id (STU-02 / SPN-02). `GET /accounts/:id/profile`. */
export function profileQuery(userId: string) {
	return queryOptions({
		queryKey: ["account", "profile", userId] as const,
		queryFn: async (): Promise<AccountProfile> => {
			const res = await apiFetch<ApiEnvelope<unknown>>(
				`/accounts/${userId}/profile`,
			);
			return accountProfileSchema.parse(res.data);
		},
	});
}

/** Update own profile (STU-01 / SPN-01). `PATCH /accounts/me/profile`. */
export async function updateMyProfile(
	input: ProfileEdit,
): Promise<AccountProfile> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/accounts/me/profile", {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	return accountProfileSchema.parse(res.data);
}

/** Confirm the seeded role at onboarding (PLT-04). `POST /accounts/me/role`. */
export async function confirmRole(
	input: RoleConfirmInput,
): Promise<AcademyUser> {
	const res = await apiFetch<ApiEnvelope<unknown>>("/accounts/me/role", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return academyUserSchema.parse(res.data);
}

/**
 * Server sign-out — clears the `auth_token` cookie (PLT-05). Best-effort: the client
 * clears its own session cache regardless (see `auth.tsx → logout`), so a failure here
 * (e.g. endpoint not yet deployed) must not block signing out locally.
 */
export async function logoutRequest(): Promise<void> {
	try {
		await apiFetch("/auth/logout", { method: "POST" });
	} catch {
		// ignore — local sign-out still proceeds
	}
}
