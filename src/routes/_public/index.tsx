import { createFileRoute } from "@tanstack/react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Hero } from "#/components/landing/Hero";
import { HowItWorks } from "#/components/landing/HowItWorks";
import { LandingCta } from "#/components/landing/LandingCta";
import { LandingFaq } from "#/components/landing/LandingFaq";
import { LandingFooter } from "#/components/landing/LandingFooter";
import { LandingHeader } from "#/components/landing/LandingHeader";
import { PartnerWall } from "#/components/landing/PartnerWall";
import { RecentProjectsPreview } from "#/components/landing/RecentProjectsPreview";
import { TbiMapSection } from "#/components/landing/TbiMapSection";
import { ValueProps } from "#/components/landing/ValueProps";
import { useLandingReveal } from "#/hooks/landing/useLandingReveal";
import { landingHead } from "#/lib/landing/seo";

export const Route = createFileRoute("/_public/")({
	head: () => landingHead,
	component: Landing,
});

// Statically false in production builds, so the panel's chunk is never emitted there.
const LandingTweakPanel = import.meta.env.DEV
	? lazy(() => import("#/components/landing/LandingTweakPanel"))
	: null;

/**
 * Visitor landing (_public). Per PRD FR-N3 / PLT-06, an unauthenticated visitor sees the
 * marketing landing + the newest-published teaser (card only). Layout, grounds and motion
 * follow the approved "A · Ledger" template (design-maxxing). Every motion piece honours
 * prefers-reduced-motion.
 */
function Landing() {
	const rootRef = useRef<HTMLDivElement>(null);
	const [showTweaks, setShowTweaks] = useState(false);
	useLandingReveal(rootRef);

	// Lenis smooth scroll — landing only, mirroring the iSkolar reference. Client-only
	// (effect), skipped for reduced-motion users, torn down on route leave. `anchors`
	// keeps in-page links (skip link, footer nav) on the smooth path; Lenis already reads
	// the html `scroll-padding-top: 88px` (styles.css), so no extra offset here.
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const lenis = new Lenis({ autoRaf: true, anchors: true });
		return () => lenis.destroy();
	}, []);

	useEffect(() => {
		if (import.meta.env.DEV) {
			setShowTweaks(new URLSearchParams(window.location.search).has("dev"));
		}
	}, []);

	return (
		<div className="lp" ref={rootRef}>
			<a className="skip" href="#main">
				Skip to content
			</a>
			<LandingHeader />
			<main id="main">
				<Hero />
				<PartnerWall />
				<ValueProps />
				<HowItWorks />
				<TbiMapSection />
				<RecentProjectsPreview />
				<LandingCta />
				<LandingFaq />
			</main>
			<LandingFooter />
			{LandingTweakPanel && showTweaks ? (
				<Suspense fallback={null}>
					<LandingTweakPanel rootRef={rootRef} />
				</Suspense>
			) : null}
		</div>
	);
}
