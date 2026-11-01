import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "#/auth";
import { getDefaultPathOfRole } from "#/lib/api";
import {
	googleLoginUrl,
	isGoogleAuthEnabled,
	ssoLoginUrl,
} from "#/lib/auth/api";
import { rememberPostSignInRedirect } from "#/lib/auth/redirect";

/**
 * Sign-in action state (PLT-02) behind the landing-page sign-in popover
 * (`SignInPopover`) — the SSO-redirect/dev-cookie-check flow. There is no separate
 * `/login` page; every sign-in entry point on the landing page opens the popover.
 *
 * `redirectTo` (e.g. Submit Project → `/student/projects/new`) is where the user should
 * land after signing in, on every path: hosted SSO (`?redirect=`), Google OAuth, and the
 * dev cookie check. The route guard sends a not-yet-onboarded user through onboarding
 * first, then on to the remembered target.
 */
export function useSignInAction(redirectTo?: string) {
	const { user, role, isSignedIn, refresh } = useAuth();
	const navigate = useNavigate();
	const [checking, setChecking] = useState(false);
	const [checked, setChecked] = useState(false);

	const roleHome = user?.roleConfirmed
		? getDefaultPathOfRole(role)
		: "/role-select";
	const target = redirectTo ?? roleHome;

	const onSignIn = async () => {
		if (redirectTo) {
			rememberPostSignInRedirect(redirectTo);
		}
		if (isGoogleAuthEnabled()) {
			window.location.assign(googleLoginUrl(redirectTo));
			return;
		}

		const sso = ssoLoginUrl(redirectTo);
		if (sso) {
			window.location.href = sso;
			return;
		}
		// Dev: no hosted SSO configured — validate whatever cookie is set, then route.
		setChecking(true);
		await refresh();
		setChecking(false);
		setChecked(true);
	};

	const onContinue = () => {
		if (redirectTo) {
			rememberPostSignInRedirect(redirectTo);
		}
		navigate({ to: target });
	};

	return { isSignedIn, checking, checked, onSignIn, onContinue };
}
