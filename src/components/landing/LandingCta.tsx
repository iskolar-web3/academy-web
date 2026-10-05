import { Reveal } from "#/components/landing/Reveal";
import { SignInPopover } from "#/components/landing/SignInPopover";

export function LandingCta() {
	return (
		<section className="container-page pb-20">
			<Reveal className="card-surface ruled-paper relative overflow-hidden px-8 py-16 text-center sm:py-20">
				<h2 className="mx-auto max-w-xl text-balance text-4xl leading-tight text-foreground">
					Find your next opportunity on Academy
				</h2>
				<p className="mx-auto mt-4 max-w-md text-lg text-content-soft">
					Showcase a project, share a thesis grant proposal, or discover student
					talent.
				</p>
				<div className="mt-9 flex justify-center">
					<SignInPopover>
						<button type="button" className="btn btn-primary">
							Get started
						</button>
					</SignInPopover>
				</div>
			</Reveal>
		</section>
	);
}
