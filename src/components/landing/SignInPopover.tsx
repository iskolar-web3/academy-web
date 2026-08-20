import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useSignInAction } from "#/hooks/auth/useSignInAction";

/**
 * Sign-in entry used by every "Sign in" button on the landing page: a popover
 * anchored below the trigger (not a centered modal), over `useSignInAction`. There is
 * no separate `/login` page.
 */
const FEATURES = [
	"Showcase your MVP to real sponsors",
	"Request grants for a starting thesis",
	"Get scouted by investors and recruiters",
];

export function SignInPopover({ children }: { children: ReactNode }) {
	const { isSignedIn, checking, checked, onSignIn, onContinue } =
		useSignInAction();

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
					Academy uses your iSkolar account — one login gets you in, no separate
					password to manage.
				</p>

				<ul className="mt-4 flex flex-col gap-2">
					{FEATURES.map((f) => (
						<li
							key={f}
							className="flex items-start gap-2 text-[13px] text-content-muted"
						>
							<span className="mt-[3px] size-1.5 flex-none rounded-full bg-action" />
							{f}
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
						{checking ? "Checking…" : "Sign in with iSkolar"}
					</button>
				)}

				{checked && !isSignedIn ? (
					<p className="mt-3 text-xs text-danger">
						No valid iSkolar session found. Mint a dev token and set the{" "}
						<code>auth_token</code> cookie, then try again.
					</p>
				) : (
					<p className="mt-3 text-center font-mono text-[11px] text-content-faint">
						You'll be redirected to iSkolar to sign in.
					</p>
				)}
			</PopoverContent>
		</Popover>
	);
}
