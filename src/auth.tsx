import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { logoutRequest } from "#/lib/account/api";
import { validateSessionQuery } from "#/lib/auth/api";
import type { AcademyRole, AcademyUser } from "#/lib/auth/model";

/**
 * Root auth context (cross-cutting). Reads the signed-in `academy_user` from the live
 * `GET /auth/session` endpoint (verify iSkolar cookie → JIT provision → record).
 *
 * The session query is gated on mount so the server render and the first client render
 * both show "visitor" (identical markup → no hydration mismatch); the real fetch runs
 * once on the client, where the `auth_token` cookie is available.
 */

interface AuthState {
	/** The live academy_user, or null for a visitor. */
	user: AcademyUser | null;
	/** Effective Academy role — null until the user confirms a role (→ onboarding). */
	role: AcademyRole | null;
	isLoading: boolean;
	isSignedIn: boolean;
	/** Re-validate the session (e.g. after setting a dev token cookie). */
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const { data, isLoading, refetch } = useQuery({
		...validateSessionQuery(),
		enabled: mounted,
	});

	const value = useMemo<AuthState>(() => {
		const user = mounted ? (data ?? null) : null;
		return {
			user,
			role: user?.roleConfirmed ? user.academyRole : null,
			isLoading: mounted ? isLoading : true,
			isSignedIn: user !== null,
			refresh: async () => {
				await refetch();
			},
			logout: async () => {
				// Best-effort server sign-out (clears the auth_token cookie), then drop the
				// local session so the UI reverts to "visitor" immediately regardless.
				await logoutRequest();
				queryClient.setQueryData(validateSessionQuery().queryKey, null);
			},
		};
	}, [data, isLoading, mounted, refetch, queryClient]);

	return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthState {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within <AuthProvider>");
	}
	return ctx;
}
