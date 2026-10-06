export function LandingFooter() {
	return (
		<footer className="border-t border-line bg-surface-card">
			<div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
				<div className="flex items-center gap-3">
					<img src="/logo-academy.svg" alt="" className="h-12 w-auto" />
				</div>
				<nav
					aria-label="Explore Academy"
					className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-action"
				>
					<a
						className="underline-offset-4 hover:underline"
						href="#recent-projects"
					>
						Recent projects
					</a>
					<a className="underline-offset-4 hover:underline" href="#tbi-map">
						TBI partnerships
					</a>
					<a className="underline-offset-4 hover:underline" href="#faq">
						FAQ
					</a>
				</nav>
				<p className="font-mono text-sm text-content-faint">
					© 2026 iSkolar Academy. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
