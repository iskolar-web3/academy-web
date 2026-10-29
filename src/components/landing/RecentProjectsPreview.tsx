import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useAuth } from "#/auth";
import { SignInPopover } from "#/components/landing/SignInPopover";
import { usePublicTeaser } from "#/hooks/discover/usePublicTeaser";
import { BACKEND_URL } from "#/lib/api";
import type { ProjectCardData } from "#/lib/discover/model";

const SUBMIT_PROJECT_PATH = "/student/projects/new";

function ShelfCard({
	project,
	index,
}: {
	project: ProjectCardData;
	index: number;
}) {
	return (
		<li>
			<SignInPopover>
				<button
					type="button"
					className="shelf-card"
					aria-label={`Sign in to explore ${project.title}`}
				>
					<span
						className="frame reveal"
						style={{ "--i": index } as CSSProperties}
					>
						{project.imageUrl ? (
							<img
								className="shot"
								src={`${BACKEND_URL}${project.imageUrl}`}
								alt={`${project.title} screenshot`}
								loading="lazy"
								decoding="async"
							/>
						) : (
							<span className="shot" />
						)}
					</span>
					<span className="school">{project.school}</span>
					<span className="title">{project.title}</span>
					<span className="pitch">{project.summary}</span>
				</button>
			</SignInPopover>
		</li>
	);
}

/**
 * Newest published projects (PLT-06) — the visitor's capped preview from the public
 * `GET /discover/teaser`, up to six uncarded, column-ruled entries. Renders exactly
 * what the server returns (no filler). The full gallery stays behind sign-in.
 */
export function RecentProjectsPreview() {
	const { cards, isPending, isError } = usePublicTeaser();
	const { isSignedIn } = useAuth();

	return (
		<section
			className="section ground-paper"
			id="recent-projects"
			aria-labelledby="recent-title"
		>
			<div className="wrap">
				<div className="head">
					<span className="rule reveal" />
					<p className="kicker reveal">Fresh from the showcase</p>
					<h2 id="recent-title" className="display reveal">
						Recently published
					</h2>
				</div>

				{isPending ? (
					<output className="shelf-status">Loading recent projects…</output>
				) : isError ? (
					<output className="shelf-status">
						Recent projects could not be loaded. Please try again later.
					</output>
				) : cards.length > 0 ? (
					<ul className="shelf">
						{cards.map((project, i) => (
							<ShelfCard key={project.id} project={project} index={i} />
						))}
					</ul>
				) : (
					<p className="shelf-status">
						No projects have been published yet. Check back for new student
						work.
					</p>
				)}

				<div className="recent-foot">
					<p>Sign in to search and filter the project showcase.</p>
					<div className="actions">
						<SignInPopover>
							<button type="button" className="lp-btn lp-btn-secondary">
								Explore the showcase{" "}
								<span className="arr" aria-hidden="true">
									→
								</span>
							</button>
						</SignInPopover>
						{isSignedIn ? (
							<Link to={SUBMIT_PROJECT_PATH} className="lp-btn lp-btn-primary">
								Submit Project
							</Link>
						) : (
							<SignInPopover redirectTo={SUBMIT_PROJECT_PATH}>
								<button type="button" className="lp-btn lp-btn-primary">
									Submit Project
								</button>
							</SignInPopover>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
