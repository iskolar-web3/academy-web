import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FileText } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "#/auth";
import { SignInPopover } from "#/components/landing/SignInPopover";
import { usePublicTeaser } from "#/hooks/discover/usePublicTeaser";
import { BACKEND_URL } from "#/lib/api";
import type { ProjectCardData } from "#/lib/discover/model";

const SUBMIT_PROJECT_PATH = "/student/projects/new";

const BAND_ROWS = 4;
/** Unique cards per loop; each track renders them twice so translateX(-50%) loops seamlessly. */
const CARDS_PER_LOOP = 8;

/** One loop of a row: the published projects repeated to fill it, offset per row (as the hero does). */
function rowLoop(cards: ProjectCardData[], row: number): ProjectCardData[] {
	return Array.from(
		{ length: CARDS_PER_LOOP },
		(_, i) => cards[(i + row * 3) % cards.length],
	);
}

/** Front row size: always six wide, empty slots filled with skeleton cards. */
const SHELF_SIZE = 6;

function CardImage({ project }: { project: ProjectCardData }) {
	return (
		<span className="frame">
			{project.imageUrl ? (
				<img
					className="shot"
					src={`${BACKEND_URL}${project.imageUrl}`}
					alt=""
					loading="lazy"
					decoding="async"
				/>
			) : (
				<span className="shot" />
			)}
		</span>
	);
}

/** A published project in the front row; opens sign-in. */
function ShelfCard({ project }: { project: ProjectCardData }) {
	return (
		<li>
			<SignInPopover>
				<button
					type="button"
					className="rp-card"
					aria-label={`Sign in to explore ${project.title}`}
				>
					<CardImage project={project} />
					<span className="school">{project.school}</span>
					<span className="title">{project.title}</span>
					<span className="pitch">{project.summary}</span>
					<span className="go">
						Sign in to view
						<ArrowUpRight aria-hidden="true" />
					</span>
				</button>
			</SignInPopover>
		</li>
	);
}

function SkeletonCard() {
	return (
		<span className="rp-card is-skeleton" aria-hidden="true">
			<span className="frame">
				<span className="shot" />
			</span>
			<span className="ghost-line w40" />
			<span className="ghost-line w80" />
		</span>
	);
}

/** A decorative card in the background band. */
function BandCard({ project }: { project: ProjectCardData }) {
	return (
		<span className="rp-card">
			<CardImage project={project} />
			<span className="school">{project.school}</span>
			<span className="title">{project.title}</span>
		</span>
	);
}

/**
 * Background only: the hero's drifting carousel picked up again, tilted the other way and
 * faded, behind the front row. Decorative (aria-hidden, no pointer events); paused off
 * screen and static under reduced motion (CSS). Skeleton cards until projects load.
 */
function DriftBand({ cards }: { cards: ProjectCardData[] }) {
	const bandRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const band = bandRef.current;
		if (!band) {
			return;
		}
		const io = new IntersectionObserver(([entry]) => {
			band.classList.toggle("paused", !entry.isIntersecting);
		});
		io.observe(band);
		return () => io.disconnect();
	}, []);

	return (
		<div className="rp-band" ref={bandRef} aria-hidden="true">
			<div className="rp-plane">
				{Array.from({ length: BAND_ROWS }, (_, row) => {
					const loop = cards.length > 0 ? rowLoop(cards, row) : null;
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed rows.
						<div className="rp-row" key={row}>
							<div className="rp-track">
								{Array.from({ length: CARDS_PER_LOOP * 2 }, (_, i) => {
									const project = loop?.[i % CARDS_PER_LOOP];
									return project ? (
										// biome-ignore lint/suspicious/noArrayIndexKey: cards repeat by design.
										<BandCard key={i} project={project} />
									) : (
										// biome-ignore lint/suspicious/noArrayIndexKey: placeholders.
										<SkeletonCard key={i} />
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/** Placeholder count for the grants preview: one row at desktop, matching the project shelf. */
const GRANT_GHOSTS = ["g1", "g2", "g3", "g4", "g5", "g6"];

/**
 * Thesis grant proposals have no public listing yet (`GET /grants` needs sign-in), so this
 * shows a blurred row of document-style placeholder cards under a sign-in prompt. When a
 * public grants teaser exists, swap the placeholders for real cards.
 */
function GrantsPreview() {
	return (
		<div className="grants-preview">
			<div className="grants-head">
				<p className="kicker">Thesis grants</p>
				<h3 id="grants-title">Grant proposals</h3>
			</div>
			<div className="grants-stage">
				<ul className="shelf grants-ghost" aria-hidden="true">
					{GRANT_GHOSTS.map((id) => (
						<li key={id}>
							<span className="shelf-card">
								<span className="frame">
									<span className="shot grant-cover">
										<FileText />
									</span>
								</span>
								<span className="ghost-line w40" />
								<span className="ghost-line w80" />
								<span className="ghost-line w90" />
								<span className="ghost-line w60" />
							</span>
						</li>
					))}
				</ul>
				<div className="grants-note">
					<p>Thesis grant proposals are open to signed-in sponsors.</p>
					<SignInPopover>
						<button type="button" className="lp-btn lp-btn-primary">
							Sign in to browse grants
						</button>
					</SignInPopover>
				</div>
			</div>
		</div>
	);
}

/**
 * Newest published projects (PLT-06) — the visitor's capped preview from the public
 * `GET /discover/teaser`: a straight row of six cards (skeletons fill empty slots) over a
 * faded drifting band that continues the hero's carousel. The full gallery stays behind
 * sign-in.
 */
export function RecentProjectsPreview() {
	const { cards, isPending, isError } = usePublicTeaser();
	const { isSignedIn } = useAuth();

	return (
		<section
			className="section ground-canvas ground-dots rp-section"
			id="recent-projects"
			aria-labelledby="recent-title"
		>
			{/* The band sits behind the projects only; the grants block below is a different kind of result. */}
			<div className="rp-projects">
				<DriftBand cards={cards} />
				<div className="wrap">
					<div className="head">
						<span className="rule reveal" />
						<p className="kicker reveal">Fresh from the showcase</p>
						<h2 id="recent-title" className="display reveal">
							Recently published
						</h2>
					</div>

					{isError ? (
						<output className="shelf-status">
							Recent projects could not be loaded. Please try again later.
						</output>
					) : !isPending && cards.length === 0 ? (
						<p className="shelf-status">
							No projects have been published yet. Check back for new student
							work.
						</p>
					) : (
						<ul className="shelf">
							{cards.slice(0, SHELF_SIZE).map((project) => (
								<ShelfCard key={project.id} project={project} />
							))}
							{Array.from(
								{ length: Math.max(0, SHELF_SIZE - cards.length) },
								(_, k) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: fixed filler slots.
									<li key={k} aria-hidden="true">
										<SkeletonCard />
									</li>
								),
							)}
						</ul>
					)}
				</div>

				<div className="wrap">
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
								<Link
									to={SUBMIT_PROJECT_PATH}
									className="lp-btn lp-btn-primary"
								>
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
			</div>

			<div className="wrap">
				<GrantsPreview />
			</div>
		</section>
	);
}
