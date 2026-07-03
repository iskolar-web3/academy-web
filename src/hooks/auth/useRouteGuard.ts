import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "#/auth";
import { getDefaultPathOfRole } from "#/lib/api";
import type { AcademyRole } from "#/lib/auth/model";

/**
 * Client-side route guard (PLT-05, defense-in-depth). Real enforcement is the server's
 * `requireRole()`; this only shapes the UX so a visitor/wrong-role never *sees* a
 * protected shell.
 *
 * It runs on the client only. While the session is loading — including the entire server
 * render and the first client render, which both report `isLoading` via the mount-gated
 * AuthProvider — it returns `allowed: false`, so the layout renders a stable fallback and
 * SSR markup matches the first client render (no hydration mismatch). Once the session
 * resolves it either admits the route or fires a redirect from an effect.
 */

type GuardMode =
	/** Any signed-in, role-confirmed user (the shared `_app` shell). */
	| { kind: "signed-in" }
	/** A specific confirmed role (student / sponsor / admin shells). */
	| { kind: "role"; role: AcademyRole }
	/** Signed in but role NOT yet confirmed (the `_onboarding` shell). */
	| { kind: "onboarding" };

export function useRouteGuard(mode: GuardMode): { allowed: boolean } {
	const { user, role, isLoading, isSignedIn } = useAuth();
	const navigate = useNavigate();

	let allowed = false;
	let redirectTo: string | null = null;

	if (!isLoading) {
		if (!isSignedIn) {
			redirectTo = "/login";
		} else if (mode.kind === "onboarding") {
			// Already confirmed → they don't belong in onboarding; bounce to their area.
			if (user?.roleConfirmed) redirectTo = getDefaultPathOfRole(role);
			else allowed = true;
		} else if (!user?.roleConfirmed) {
			redirectTo = "/role-select";
		} else if (mode.kind === "role" && role !== mode.role) {
			redirectTo = getDefaultPathOfRole(role);
		} else {
			allowed = true;
		}
	}

	useEffect(() => {
		if (redirectTo) navigate({ to: redirectTo });
	}, [redirectTo, navigate]);

	return { allowed };
}
