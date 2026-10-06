import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { useEffect } from "react";
import { Hero } from "#/components/landing/Hero";
import { HowItWorks } from "#/components/landing/HowItWorks";
import { LandingCta } from "#/components/landing/LandingCta";
import { LandingFaq } from "#/components/landing/LandingFaq";
import { LandingFooter } from "#/components/landing/LandingFooter";
import { LandingHeader } from "#/components/landing/LandingHeader";
import { RecentProjectsPreview } from "#/components/landing/RecentProjectsPreview";
import { TbiMapSection } from "#/components/landing/TbiMapSection";
import { ValueProps } from "#/components/landing/ValueProps";
import { landingHead } from "#/lib/landing/seo";

export const Route = createFileRoute("/_public/")({
	head: () => landingHead,
	component: Landing,
});

/**
 * Visitor landing (_public). Per PRD FR-N3 / PLT-06, an unauthenticated visitor sees
 * the marketing landing + a top-3 most-recent teaser (card only). Compact stacked
 * sections; motion carries the personality (kinetic hero, zoom-on-scroll, 3D card tilt,
 * lenis smooth scroll — landing only, mirroring the iSkolar reference).
 */
function Landing() {
	// Client-only (effect) and skipped for reduced-motion users; torn down on route leave.
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const lenis = new Lenis({ autoRaf: true });
		return () => lenis.destroy();
	}, []);

	return (
		<MotionConfig reducedMotion="user">
			<div className="min-h-screen bg-background">
				<LandingHeader />
				<main>
					<Hero />
					<ValueProps />
					<HowItWorks />
					<TbiMapSection />
					<RecentProjectsPreview />
					<LandingCta />
					<LandingFaq />
				</main>
				<LandingFooter />
			</div>
		</MotionConfig>
	);
}
