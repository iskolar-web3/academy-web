import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Reveal } from "#/components/landing/Reveal";
import { SignInPopover } from "#/components/landing/SignInPopover";
import { SectionHeading } from "#/components/landing/spine";
import { BACKEND_URL } from "#/lib/api";
import { publicTeaserQuery } from "#/lib/discover/api";
import { toProjectCardData } from "#/lib/discover/model";

/**
 * Top-3 most-recent teaser (PLT-06) — the visitor's capped preview, read from the public
 * `GET /discover/teaser` endpoint (card only; the full gallery stays behind sign-in).
 * SSR-safe: the first render (server and client alike) shows the section shell; cards
 * fill in when the query resolves.
 */
export function RecentProjectsPreview() {
	const { data, isPending, isError } = useQuery({
		...publicTeaserQuery(),
		enabled: typeof window !== "undefined",
	});
	const cards = (data ?? []).slice(0, 3).map(toProjectCardData);

	return (
		<section id="recent-projects" className="container-page scroll-mt-24 py-16">
			<SectionHeading
				label="Fresh from the showcase"
				title="Recently published"
			/>

			{isPending ? (
				<output className="mt-10 block text-center text-content-soft">
					Loading recent projects…
				</output>
			) : isError ? (
				<output className="mt-10 block text-center text-content-soft">
					Recent projects could not be loaded. Please try again later.
				</output>
			) : cards.length > 0 ? (
				<div className="mt-10 grid justify-center gap-6 sm:grid-cols-[repeat(auto-fit,minmax(258px,340px))]">
					{cards.map((project, i) => (
						<Reveal key={project.id} delay={i * 0.08} className="h-full">
							<SignInPopover>
								<button
									type="button"
									aria-label={`Sign in to explore ${project.title}`}
									className="card-surface block h-full w-full min-w-0 overflow-hidden rounded-[15px] text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-action hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
								>
									{project.imageUrl ? (
										<div className="flex justify-center bg-surface-card px-4 pt-4">
											<img
												src={`${BACKEND_URL}${project.imageUrl}`}
												alt={`${project.title} project image`}
												className="aspect-square w-full max-w-56 object-contain"
											/>
										</div>
									) : null}
									<div className="p-4">
										<span
											className="block truncate text-[18px] leading-tight text-content-heading"
											title={project.title}
										>
											{project.title}
										</span>
										<span className="mt-1 block truncate text-[12px] text-content-faint">
											{project.school}
										</span>
										<span className="mt-3 line-clamp-3 text-[14px] leading-normal text-content-soft">
											{project.pitch}
										</span>
									</div>
								</button>
							</SignInPopover>
						</Reveal>
					))}
				</div>
			) : (
				<p className="mt-10 text-center text-content-soft">
					No projects have been published yet. Check back for new student work.
				</p>
			)}

			<div className="mt-10 flex flex-col items-center gap-4 text-center">
				<p className="text-base text-content-soft">
					Sign in to search and filter the project showcase.
				</p>
				<SignInPopover>
					<button
						type="button"
						className="btn btn-secondary inline-flex items-center gap-2"
					>
						Explore the showcase <ArrowRight className="size-4" aria-hidden />
					</button>
				</SignInPopover>
			</div>
		</section>
	);
}
