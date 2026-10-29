import { SignInPopover } from "#/components/landing/SignInPopover";

/**
 * Slim public top bar for the visitor landing — logo + a single sign-in entry.
 * Sign-in opens a popover anchored below this button — there's no separate `/login`
 * page; guards/logout redirect back to the landing page instead.
 */
export function LandingHeader() {
	return (
		<header className="site-header">
			<div className="wrap">
				<img src="/combination-mark.svg" alt="Academy" />
				<SignInPopover>
					<button type="button" className="lp-btn lp-btn-secondary">
						Sign in
					</button>
				</SignInPopover>
			</div>
		</header>
	);
}
