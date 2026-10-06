import { SignInPopover } from "#/components/landing/SignInPopover";

/**
 * Slim public top bar for the visitor landing — logo + a single sign-in entry.
 * Sign-in opens a popover anchored below this button — there's no separate `/login`
 * page; guards/logout redirect back to the landing page instead.
 */
export function LandingHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-line bg-[rgba(248,250,255,0.86)] backdrop-blur-md">
			<div className="container-page flex h-18 items-center justify-between">
				<img src="/combination-mark.svg" alt="Academy" className="h-9 w-auto" />
				<SignInPopover>
					<button type="button" className="btn btn-secondary h-11 px-6 text-sm">
						Sign in
					</button>
				</SignInPopover>
			</div>
		</header>
	);
}
