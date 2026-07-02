import { queryOptions } from "@tanstack/react-query";
import { type ApiEnvelope, apiFetch } from "#/lib/api";
import { type AcademyUser, academyUserSchema } from "#/lib/auth/model";

/**
 * Auth API. `GET /auth/session` is LIVE (academy-server `account/server.ts`): it verifies
 * the iSkolar `auth_token` cookie, JIT-provisions the `academy_user`, and returns it in
 * the `{ message, data }` envelope. Provisioning happens inside that call, so there is no
 * separate provision endpoint on the client.
 */

/**
 * Silent SSO session validation (PLT-01/03). Returns the signed-in `academy_user`, or
 * `null` when there is no valid token (401) or the server is unreachable — both mean
 * "treat as visitor" for the UI. The cookie rides along via `apiFetch` (credentials).
 */
export function validateSessionQuery() {
	return queryOptions({
		queryKey: ["auth", "session"] as const,
		queryFn: async (): Promise<AcademyUser | null> => {
			try {
				const res = await apiFetch<ApiEnvelope<unknown>>("/auth/session");
				return academyUserSchema.parse(res.data);
			} catch {
				return null;
			}
		},
		retry: false,
	});
}

/**
 * Redirect target for the REAL iSkolar login — iSkolar-main's hosted SSO, NOT
 * academy-server (which only verifies the token cookie). Returns "" until
 * `VITE_ISKOLAR_SSO_URL` is configured; in local dev, mint a token instead
 * (academy-server: `pnpm exec tsx src/dev/mint-token.ts <userId> <role>`).
 */
export function ssoLoginUrl(redirectTo = "/"): string {
	const base = import.meta.env.VITE_ISKOLAR_SSO_URL;
	if (!base) return "";
	return `${base}?redirect=${encodeURIComponent(redirectTo)}`;
}
