import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useSignInAction } from "#/hooks/auth/useSignInAction";
import { isGoogleAuthEnabled, ssoLoginUrl } from "#/lib/auth/api";

function GoogleLogo() {
	return (
		<span className="inline-flex size-7 shrink-0 items-center justify-center">
			<svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
				<path
					fill="#EA4335"
					d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
				/>
				<path
					fill="#4285F4"
					d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.68 46.98 24.55z"
				/>
				<path
					fill="#FBBC05"
					d="M10.53 28.59A14.43 14.43 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.5 2.56 10.78l7.97-6.19z"
				/>
				<path
					fill="#34A853"
					d="M24 48c6.48 0 11.92-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
				/>
			</svg>
		</span>
	);
}

export function SignInPopover({ children }: { children: ReactNode }) {
	const { isSignedIn, checking, checked, onSignIn, onContinue } =
		useSignInAction();
	const googleAuthEnabled = isGoogleAuthEnabled();
	const ssoEnabled = Boolean(ssoLoginUrl());

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[min(24rem,calc(100vw-2rem))] px-5 py-5 sm:px-6 sm:py-6"
			>
				<div className="flex h-16 items-center">
					<img
						src="/combination-mark.svg"
						alt="Academy"
						className="h-10 w-auto"
					/>
				</div>

				<h2 className="mt-2 text-[19px] text-content-heading">
					Sign in to continue
				</h2>
				<div className="mt-5">
					{isSignedIn ? (
						<button
							type="button"
							onClick={onContinue}
							className="btn btn-primary h-12 w-full"
						>
							Continue to Academy
						</button>
					) : (
						<button
							type="button"
							onClick={onSignIn}
							disabled={checking}
							className="btn btn-primary flex h-12 w-full items-center justify-center gap-2"
						>
							{checking ? (
								"Checking..."
							) : googleAuthEnabled ? (
								<>
									<GoogleLogo /> Continue with Google
								</>
							) : ssoEnabled ? (
								"Continue with iSkolar"
							) : (
								"Check local session"
							)}
						</button>
					)}
				</div>

				{checked && !isSignedIn ? (
					<p className="mt-3 text-xs text-danger">
						No local session found. Mint a dev token and set the{" "}
						<code>auth_token</code> cookie, then try again.
					</p>
				) : null}
			</PopoverContent>
		</Popover>
	);
}
