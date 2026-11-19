import { useEffect, useRef } from "react";
import { SignInPopover } from "#/components/landing/SignInPopover";

const SCROLLED_AFTER = 24;

/**
 * Floating frosted pill with the logo + a single sign-in entry. The `<header>` keeps
 * the old 72px of flow space so the hero sits exactly where it did; the pill itself is
 * fixed. Sign-in opens a popover anchored below the button — there's no separate
 * `/login` page; guards/logout redirect back to the landing page instead.
 */
export function LandingHeader() {
	const pillRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const pill = pillRef.current;
		if (!pill) {
			return;
		}
		const sync = () => {
			pill.toggleAttribute("data-scrolled", window.scrollY > SCROLLED_AFTER);
		};
		sync();
		window.addEventListener("scroll", sync, { passive: true });
		return () => window.removeEventListener("scroll", sync);
	}, []);

	return (
		<header className="site-header">
			<div className="header-pill" ref={pillRef}>
				<img src="/combination-mark.svg" alt="Academy" />
				<SignInPopover>
					<button type="button" className="lp-btn lp-btn-secondary">
						Sign in
					</button>
				</SignInPopover>
			</div>
		</header>
	);
}
