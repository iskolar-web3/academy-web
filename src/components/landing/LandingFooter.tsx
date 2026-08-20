export function LandingFooter() {
	return (
		<footer className="border-t border-line bg-surface-card">
			<div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
				<div className="flex items-center gap-3">
					<img src="/logo-academy.png" alt="" className="h-9 w-auto" />
					<span className="font-mono text-sm uppercase tracking-[0.16em] text-content-faint">
						A subsidiary of iSkolar
					</span>
				</div>
				<p className="font-mono text-sm text-content-faint">
					© 2026 iSkolar Academy. Showcase · Discover · Fund.
				</p>
			</div>
		</footer>
	);
}
