import { BadgeCheck, Layers } from "lucide-react";

const TAGS = ["Web app", "Student-built"];

interface PublishedProjectPreviewProps {
	/** For hosts that already show the project title above the preview. */
	hideTitle?: boolean;
}

/**
 * A miniature of an approved project as it appears in the Discover gallery: cover,
 * title, school, one-line pitch, tags and the Verified mark. Placeholder content only.
 */
export function PublishedProjectPreview({
	hideTitle,
}: PublishedProjectPreviewProps) {
	return (
		<div className="pp">
			<span className="pp-cover">
				<span className="pp-glyph">
					<Layers />
				</span>
				<span className="pp-verified">
					<BadgeCheck />
					Verified
				</span>
			</span>
			<span className="pp-body">
				{hideTitle ? null : <span className="pp-title">Your project</span>}
				<span className="pp-school">Your university</span>
				<span className="pp-pitch">A working demo, ready for sponsors</span>
				<span className="pp-tags">
					{TAGS.map((tag) => (
						<span key={tag}>{tag}</span>
					))}
				</span>
			</span>
		</div>
	);
}
