import { useAuth } from "#/auth";

/** Read the current session from the AuthProvider. Thin wrapper (PLT-01). */
export function useSession() {
	const { user, role, isLoading, isSignedIn, refresh } = useAuth();
	return { user, role, isLoading, isSignedIn, refresh };
}
