import { Link } from "@tanstack/react-router";
import { Reveal } from "#/components/landing/Reveal";

export function LandingCta() {
	return (
		<section className="container-page pb-16">
			<Reveal className="card-surface ruled-paper relative overflow-hidden px-8 py-14 text-center">
				<h2 className="mx-auto max-w-xl text-balance text-4xl leading-tight text-foreground">
					Ready to put your work in front of the people who can fund it?
				</h2>
				<p className="mx-auto mt-4 max-w-md text-lg text-content-soft">
					One iSkolar account gets you in. Showcase a project, request a grant,
					or start scouting talent.
				</p>
				<div className="mt-7 flex justify-center">
					<Link to="/login" className="btn btn-primary">
						Sign in with iSkolar
					</Link>
				</div>
			</Reveal>
		</section>
	);
}
