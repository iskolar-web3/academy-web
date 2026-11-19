import { Check, Heart, UserRound } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { PublishedProjectPreview } from "#/components/landing/PublishedProjectPreview";

export const STAGE_PILLS = ["Draft", "In review", "Published"] as const;
export const DEMO_URL = "demo.yourproject.app";
export const REPO_URL = "github.com/you/project";
export const AVATAR_COUNT = 6;
const CHECK_LABELS = ["Demo loads", "Repository is public", "Details complete"];

export interface CardView {
	stage: 0 | 1 | 2;
	/** How many review checks are ticked (0–3). */
	checks: number;
	stamp: boolean;
	/** How many sponsor avatars have popped in (0–AVATAR_COUNT). */
	avatars: number;
	toast: boolean;
	pressed: boolean;
	/** The Submit button has been clicked and shows its confirmed state. */
	submitted: boolean;
}

/** Element handles the animated stage needs to aim the cursor and type into fields. */
export interface CardRefs {
	demoField: Ref<HTMLDivElement>;
	demoText: Ref<HTMLSpanElement>;
	repoField: Ref<HTMLDivElement>;
	repoText: Ref<HTMLSpanElement>;
	submit: Ref<HTMLSpanElement>;
}

interface JourneyCardProps {
	view: CardView;
	/** Present on the animated stage; absent for the static per-step cards. */
	refs?: CardRefs;
}

/** A region that collapses to nothing (grid rows 1fr → 0fr) when `open` is false. */
function Fold({ open, children }: { open: boolean; children: ReactNode }) {
	return (
		<div className="hj-fold" data-open={open}>
			<div>{children}</div>
		</div>
	);
}

/**
 * The mini project card shared by the animated journey and the static fallback. On the
 * stage every extra (form, checks, avatars, toast) is always mounted and toggled by state
 * so it can animate; the static cards render only what their stage shows. Once published,
 * the form folds away and the card shows the project as Discover lists it.
 */
export function JourneyCard({ view, refs }: JourneyCardProps) {
	const isStatic = !refs;
	const published = view.stage === 2;
	const form = (
		<Fold open={!published}>
			<div className="hj-field" ref={refs?.demoField}>
				<span className="hj-label">Demo URL</span>
				<span className="hj-input">
					<span ref={refs?.demoText}>{isStatic ? DEMO_URL : null}</span>
				</span>
			</div>
			<div className="hj-field" ref={refs?.repoField}>
				<span className="hj-label">Repository</span>
				<span className="hj-input">
					<span ref={refs?.repoText}>{isStatic ? REPO_URL : null}</span>
				</span>
			</div>
			<span
				className="hj-submit"
				data-pressed={view.pressed}
				data-submitted={view.submitted}
				ref={refs?.submit}
			>
				{view.submitted ? (
					<>
						<Check strokeWidth={3} />
						Submitted
					</>
				) : (
					"Submit"
				)}
			</span>
		</Fold>
	);

	return (
		<div className="hj-unit">
			<div className="hj-card">
				{isStatic && published ? null : (
					<Fold open={!published}>
						<span className="hj-thumb" />
					</Fold>
				)}
				<div className="hj-title-row">
					<span className="hj-title">Your project</span>
					<span className="hj-pill" data-stage={view.stage}>
						{STAGE_PILLS[view.stage]}
					</span>
				</div>
				{isStatic && published ? null : form}
				{isStatic && !published ? null : (
					<Fold open={published}>
						<PublishedProjectPreview hideTitle />
					</Fold>
				)}
				{isStatic && !view.stamp ? null : (
					<span className="hj-stamp" data-on={view.stamp}>
						Approved
					</span>
				)}
			</div>
			{isStatic && view.checks === 0 ? null : (
				<ul className="hj-checks">
					{CHECK_LABELS.map((label, i) => (
						<li key={label} data-on={view.checks > i}>
							<span className="hj-tick">
								<Check strokeWidth={3} />
							</span>
							{label}
						</li>
					))}
				</ul>
			)}
			{isStatic && view.avatars === 0 ? null : (
				<div className="hj-avatars">
					{Array.from({ length: AVATAR_COUNT }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative list.
						<span key={i} className="hj-av" data-on={view.avatars > i}>
							<UserRound />
						</span>
					))}
				</div>
			)}
			{isStatic && !view.toast ? null : (
				<span className="hj-toast" data-on={view.toast}>
					<Heart />
					Sponsor interested
				</span>
			)}
		</div>
	);
}
