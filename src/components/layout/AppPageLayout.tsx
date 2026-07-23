import type { ReactNode } from "react";

/**
 * Shared 3-column page shell (discover / grants / grant detail / sponsor home /
 * student home — never settings, profile-edit, or notifications). Left is the
 * role-specific panel (`SponsorRail` for sponsors, the student profile card for
 * students), middle is the page's own content, right is the ad slot (`AdsPanel`).
 * Stacks to a single column below `lg`, same responsive pattern the dashboard
 * already used for its two-column grid.
 */
export function AppPageLayout({
	left,
	right,
	children,
}: {
	left: ReactNode;
	right: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="grid grid-cols-1 gap-7 lg:grid-cols-[280px_1fr_300px] lg:items-start">
			<div>{left}</div>
			<div className="min-w-0">{children}</div>
			<div>{right}</div>
		</div>
	);
}
