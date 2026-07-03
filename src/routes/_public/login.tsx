import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "#/auth";
import { getDefaultPathOfRole } from "#/lib/api";
import { ssoLoginUrl } from "#/lib/auth/api";

/**
 * Sign-in entry (PLT-02). The real login is iSkolar-main's hosted SSO — set
 * `VITE_ISKOLAR_SSO_URL` and the button redirects there. academy-server itself only
 * verifies the `auth_token` cookie (`GET /auth/session`), so in local dev you mint a
 * token (academy-server: `pnpm exec tsx src/dev/mint-token.ts <userId> <role>`), set it
 * as the cookie, then "Sign in with iSkolar" validates it and routes you by role.
 */
export const Route = createFileRoute("/_public/login")({
	component: Login,
});

function Login() {
	const { user, role, isSignedIn, refresh } = useAuth();
	const navigate = useNavigate();
	const [checking, setChecking] = useState(false);
	const [checked, setChecked] = useState(false);

	// Where a signed-in user belongs: their role area, or onboarding if unconfirmed.
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

	return (
		<div className="container-page flex min-h-screen flex-col items-center justify-center py-16">
			<div className="max-w-md text-center">
				<img
					src="/logo-academy.png"
					alt="iSkolar Academy"
					className="mx-auto h-14 w-auto"
				/>
				<h1 className="mt-6 text-3xl text-content-heading">
					Sign in to iSkolar Academy
				</h1>
				<p className="mt-3 text-content-soft">
					Academy uses your iSkolar account. You'll be redirected to iSkolar to
					sign in.
				</p>

				{isSignedIn ? (
					<button
						type="button"
						onClick={() => navigate({ to: target })}
						className="btn btn-primary mt-6 w-full"
					>
						Continue to Academy
					</button>
				) : (
					<button
						type="button"
						onClick={onSignIn}
						disabled={checking}
						className="btn btn-primary mt-6 w-full"
					>
						{checking ? "Checking…" : "Sign in with iSkolar"}
					</button>
				)}

				{checked && !isSignedIn ? (
					<p className="mt-3 text-xs text-danger">
						No valid iSkolar session found. Mint a dev token and set the{" "}
						<code>auth_token</code> cookie, then try again.
					</p>
				) : (
					<p className="mt-3 text-xs text-content-faint">
						You'll be redirected to iSkolar to sign in.
					</p>
				)}
			</div>
		</div>
	);
}
