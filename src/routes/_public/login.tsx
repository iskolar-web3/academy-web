import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "#/auth";
import { ssoLoginUrl } from "#/lib/auth/api";

/**
 * Sign-in entry (PLT-02). The real login is iSkolar-main's hosted SSO — set
 * `VITE_ISKOLAR_SSO_URL` and the button redirects there. academy-server itself only
 * verifies the `auth_token` cookie (`GET /auth/session`), so in local dev you mint a
 * token (academy-server: `pnpm exec tsx src/dev/mint-token.ts <userId> <role>`), set it
 * as the cookie, then "Check session" validates it against the server.
 *
 * The "Dev preview" block is a TEMPORARY scaffold to review each role's screens without
 * auth. Remove it once real SSO + guards are wired.
 */
export const Route = createFileRoute("/_public/login")({
	component: Login,
});

function Login() {
	const { isSignedIn, refresh } = useAuth();
	const [checking, setChecking] = useState(false);
	const [checked, setChecked] = useState(false);

	const onSignIn = async () => {
		const sso = ssoLoginUrl();
		if (sso) {
			window.location.href = sso;
			return;
		}
		// Dev: no hosted SSO configured — validate whatever cookie is set.
		setChecking(true);
		await refresh();
		setChecking(false);
		setChecked(true);
	};

	return (
		<div className="container-page flex min-h-screen flex-col items-center justify-center gap-10 py-16">
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
					<Link to="/student/home" className="btn btn-primary mt-6 w-full">
						Continue to Academy
					</Link>
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
					<p className="mt-2 text-xs text-danger">
						No valid iSkolar session found. Mint a dev token and set the{" "}
						<code>auth_token</code> cookie, then try again.
					</p>
				) : (
					<p className="mt-2 text-xs text-content-faint">
						You'll be redirected to iSkolar to sign in.
					</p>
				)}
			</div>

			<div className="card-surface w-full max-w-md p-6">
				<p className="eyebrow mb-4">Dev preview — no auth yet</p>
				<p className="mb-4 text-sm text-content-soft">
					Jump straight into a role area to review its design.
				</p>
				<div className="grid grid-cols-2 gap-3">
					<Link to="/student/home" className="btn btn-secondary">
						View as Student
					</Link>
					<Link to="/sponsor/home" className="btn btn-secondary">
						View as Sponsor
					</Link>
					<Link to="/admin/dashboard" className="btn btn-secondary">
						View as Admin
					</Link>
					<Link to="/role-select" className="btn btn-secondary">
						Onboarding
					</Link>
				</div>
			</div>
		</div>
	);
}
