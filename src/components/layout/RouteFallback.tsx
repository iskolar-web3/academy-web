/**
 * Full-screen loading placeholder rendered by a guarded layout while the session is
 * being validated (and during SSR / first client render). Deterministic markup so the
 * server render and the first client render are identical — no hydration mismatch.
 */
export function RouteFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-3">
				<span className="size-9 animate-spin-ds rounded-full border-2 border-line border-t-action" />
				<span className="font-mono text-[11px] uppercase tracking-[0.22em] text-content-faint">
					Loading
				</span>
			</div>
		</div>
	);
}
