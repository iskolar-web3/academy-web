import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { Hero } from "#/components/landing/Hero";
import { HowItWorks } from "#/components/landing/HowItWorks";
import { LandingCta } from "#/components/landing/LandingCta";
import { LandingFooter } from "#/components/landing/LandingFooter";
import { LandingHeader } from "#/components/landing/LandingHeader";
import { RecentProjectsPreview } from "#/components/landing/RecentProjectsPreview";
import { ValueProps } from "#/components/landing/ValueProps";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "iSkolar Academy — Student work, built to be seen & funded" },
			{
				name: "description",
				content:
					"Showcase built MVPs, fund starting theses with grants, and connect with investors who scout real student projects. A subsidiary of iSkolar.",
			},
		],
	}),
	component: Landing,
});

/**
 * Visitor landing (_public). Per PRD FR-N3 / PLT-06, an unauthenticated visitor sees
 * the marketing landing + a top-3 most-recent teaser (card only). Compact stacked
 * sections; motion carries the personality (kinetic hero, zoom-on-scroll, 3D card tilt).
 */
function Landing() {
	return (
		<MotionConfig reducedMotion="user">
			<div className="min-h-screen bg-background">
				<LandingHeader />
				<main>
					<Hero />
					<ValueProps />
					<HowItWorks />
					<RecentProjectsPreview />
					<LandingCta />
				</main>
				<LandingFooter />
			</div>
		</MotionConfig>
	);
}
