import { Link } from "@tanstack/react-router";

/**
 * Slim public top bar for the visitor landing — logo + a single sign-in entry.
 * Sign-in routes to the /login auth page, which redirects to iSkolar SSO.
 */
export function LandingHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-line bg-[rgba(248,250,255,0.86)] backdrop-blur-md">
			<div className="container-page flex h-18 items-center justify-between">
				<div className="flex items-center gap-2.5">
					<img
						src="/logo-academy.png"
						alt="iSkolar Academy"
						className="h-10 w-auto"
					/>
					<span className="text-lg uppercase tracking-[0.16em] text-action">
						Academy
					</span>
				</div>
				<Link to="/login" className="btn btn-secondary h-11 px-6 text-sm">
					Sign in
				</Link>
			</div>
		</header>
	);
}
