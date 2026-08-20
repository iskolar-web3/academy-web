import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "#/auth";
import { getDefaultPathOfRole } from "#/lib/api";
import { ssoLoginUrl } from "#/lib/auth/api";

/**
 * Sign-in action state (PLT-02) behind the landing-page sign-in popover
 * (`SignInPopover`) — the SSO-redirect/dev-cookie-check flow. There is no separate
 * `/login` page; every sign-in entry point on the landing page opens the popover.
 */
export function useSignInAction() {
	const { user, role, isSignedIn, refresh } = useAuth();
	const navigate = useNavigate();
	const [checking, setChecking] = useState(false);
	const [checked, setChecked] = useState(false);

	const target = user?.roleConfirmed
		? getDefaultPathOfRole(role)
		: "/role-select";

	const onSignIn = async () => {
		const sso = ssoLoginUrl();
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

	const onContinue = () => navigate({ to: target });

	return { isSignedIn, checking, checked, onSignIn, onContinue };
}
