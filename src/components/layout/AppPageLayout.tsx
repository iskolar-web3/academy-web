import type { ReactNode } from "react";

/**
 * Shared 3-column page shell (discover / grants / grant detail / sponsor home /
 * student home — never settings, profile-edit, or notifications). Left is the
 * role-specific panel (the sponsor evidence rail for sponsors, the student profile card for
 * students), with the page content beside it.
 * Stacks to a single column below `lg`, same responsive pattern the dashboard
 * already used for its two-column grid.
 */
export function AppPageLayout({
	left,
	children,
	hideLeftOnMobile = false,
}: {
	left: ReactNode;
	children: ReactNode;
	hideLeftOnMobile?: boolean;
}) {
	return (
		<div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
			<div className={hideLeftOnMobile ? "hidden min-w-0 lg:block" : "min-w-0"}>
				{left}
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}
