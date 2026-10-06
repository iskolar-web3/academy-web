import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Reveal } from "#/components/landing/Reveal";
import { SignInPopover } from "#/components/landing/SignInPopover";
import { SectionHeading } from "#/components/landing/spine";
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
				<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{cards.map((project, i) => (
						<Reveal key={project.id} delay={i * 0.08}>
							<article className="card-surface flex h-full min-w-0 flex-col overflow-hidden">
								<div
									className="flex h-32 items-start p-4"
									style={{ background: project.cover }}
								>
									<span className="chip bg-[rgba(17,24,39,0.32)] text-white">
										{project.category}
									</span>
								</div>
								<div className="flex flex-1 flex-col p-5">
									<h3 className="mb-2 line-clamp-2 min-h-[3.5rem] break-words text-xl leading-tight text-foreground">
										{project.title}
									</h3>
									<p className="mb-5 line-clamp-3 min-h-[4.5rem] flex-1 text-base leading-relaxed text-content-soft">
										{project.pitch}
									</p>
									<div className="ruled-line mb-4" />
									<div className="flex items-center justify-between gap-3">
										<span className="min-w-0 truncate font-mono text-xs text-content-faint">
											{project.school}
										</span>
										<SignInPopover>
											<button
												type="button"
												className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm text-action hover:underline"
											>
												Sign in to explore{" "}
												<ArrowRight className="size-4" aria-hidden />
											</button>
										</SignInPopover>
									</div>
								</div>
							</article>
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
