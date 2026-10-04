import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useSignInAction } from "#/hooks/auth/useSignInAction";
import { isGoogleAuthEnabled } from "#/lib/auth/api";

const FEATURES = [
	"Showcase your MVP to real sponsors",
	"Request grants for a starting thesis",
	"Get scouted by investors and recruiters",
];

export function SignInPopover({ children }: { children: ReactNode }) {
	const { isSignedIn, checking, checked, onSignIn, onContinue } =
		useSignInAction();
	const googleAuthEnabled = isGoogleAuthEnabled();

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent align="end" className="w-96 px-6 py-6">
				<div className="flex items-center gap-2.5">
					<img
						src="/logo-academy.png"
						alt=""
						aria-hidden
						className="h-8 w-auto"
					/>
					<span className="text-[13px] uppercase tracking-[0.16em] text-action">
						Academy
					</span>
				</div>

				<h2 className="mt-4 text-[19px] text-content-heading">
					Sign in to continue
				</h2>
				<p className="mt-1.5 text-[13.5px] leading-[1.5] text-content-soft">
					{googleAuthEnabled
						? "Use your Google account to access Academy."
						: "Local authentication is ready for development testing."}
				</p>

				<ul className="mt-4 flex flex-col gap-2">
					{FEATURES.map((feature) => (
						<li
							key={feature}
							className="flex items-start gap-2 text-[13px] text-content-muted"
						>
							<span className="mt-[3px] size-1.5 flex-none rounded-full bg-action" />
							{feature}
						</li>
					))}
				</ul>

				<div className="my-4 h-px bg-[#eef1fa]" />

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
						className="btn btn-primary h-12 w-full"
					>
						{checking
							? "Checking..."
							: googleAuthEnabled
								? "Continue with Google"
								: "Check local session"}
					</button>
				)}

				{checked && !isSignedIn ? (
					<p className="mt-3 text-xs text-danger">
						No local session found. Mint a dev token and set the{" "}
						<code>auth_token</code> cookie, then try again.
					</p>
				) : (
					<p className="mt-3 text-center font-mono text-[11px] text-content-faint">
						{googleAuthEnabled
							? "You'll be redirected to Google to sign in."
							: "Use a local dev token to test sign-in."}
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}
