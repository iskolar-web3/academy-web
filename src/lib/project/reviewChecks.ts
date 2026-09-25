import { isValidUrl, requiresDocumentUpload } from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";
import type { ProjectVerificationCheck } from "#/lib/project/verification";

export type ReviewCheckStatus = "pass" | "pending" | "attention";

export interface ReviewCheck {
	id: string;
	label: string;
	status: ReviewCheckStatus;
	evidence: string;
}

export interface ReviewCheckSummary {
	pass: number;
	pending: number;
	attention: number;
	label: string;
}

export function verificationChecksToReviewChecks(
	checks: ProjectVerificationCheck[],
): ReviewCheck[] {
	return checks.map((check) => ({
		id: check.id,
		label: check.label,
		status:
			check.status === "pass"
				? "pass"
				: check.status === "attention" || check.status === "error"
					? "attention"
					: "pending",
		evidence: check.evidence,
	}));
}

function acceptedOrQueued(
	project: Project,
	evidence: string,
): ReviewCheckStatus {
	return project.status === "published"
		? "pass"
		: evidence
			? "pending"
			: "attention";
}

function githubRepoParts(repo: string): string[] {
	try {
		const url = new URL(repo);
		if (!url.hostname.includes("github.com")) return [];
		return url.pathname.split("/").filter(Boolean);
	} catch {
		return [];
	}
}

export function buildReviewChecks(project: Project): ReviewCheck[] {
	const hasDemo = isValidUrl(project.links.demo);
	const hasRepo = isValidUrl(project.links.repo);
	const githubParts = githubRepoParts(project.links.repo);
	const hasVideo = isValidUrl(project.links.video);
	const needsDocument = requiresDocumentUpload(project.type);
	const pendingMembers = project.members.filter((m) => m.consent === "pending");
	const declinedMembers = project.members.filter(
		(m) => m.consent === "declined",
	);

	return [
		{
			id: "demo",
			label: "Demo liveness",
			status: hasDemo
				? acceptedOrQueued(project, project.links.demo)
				: "attention",
			evidence: hasDemo
				? project.status === "published"
					? "Accepted during Academy review."
					: "URL captured; Academy review will verify the running demo."
				: "Add a working live demo URL before review.",
		},
		{
			id: "repo",
			label: "Repository access",
			status: hasRepo
				? acceptedOrQueued(project, project.links.repo)
				: "attention",
			evidence: hasRepo
				? githubParts.length >= 2
					? "GitHub repository captured; Academy review will verify access."
					: "Repository URL is present; public access still needs review."
				: "Add a public repository URL.",
		},
		{
			id: "repo-meta",
			label: "README / license",
			status:
				project.status === "published"
					? "pass"
					: hasRepo && githubParts.length >= 2
						? "pending"
						: "attention",
			evidence:
				project.status === "published"
					? "Accepted during Academy review; README and license automation is next."
					: hasRepo && githubParts.length >= 2
						? "A public GitHub URL is ready for README and license review."
						: "Use a public repo link so metadata can be checked.",
		},
		{
			id: "purpose",
			label: "Purpose clarity",
			status: project.purpose.trim().length >= 48 ? "pass" : "attention",
			evidence:
				project.purpose.trim().length >= 48
					? "Purpose statement has enough detail for review."
					: "Add a clearer purpose statement for the reviewer.",
		},
		{
			id: "ownership",
			label: "Ownership declaration",
			status: project.ownership.declared ? "pass" : "attention",
			evidence: project.ownership.declared
				? "Student ownership declaration is submitted."
				: "Confirm original work and credited collaborators.",
		},
		{
			id: "supporting-doc",
			label: needsDocument ? "Supporting document" : "Supporting document",
			status: needsDocument
				? project.ownership.thesisPaperName
					? "pass"
					: "attention"
				: "pass",
			evidence: needsDocument
				? project.ownership.thesisPaperName
					? `${project.ownership.thesisPaperName} is attached.`
					: "Attach the required paper or pitch deck."
				: "Not required for this project type.",
		},
		{
			id: "team-consent",
			label: "Team consent",
			status: declinedMembers.length
				? "attention"
				: pendingMembers.length
					? "pending"
					: "pass",
			evidence: project.isTeam
				? declinedMembers.length
					? `${declinedMembers.length} member credit needs cleanup.`
					: pendingMembers.length
						? `${pendingMembers.length} member invite pending.`
						: "All visible team credits are clear."
				: "Solo project; no member consent needed.",
		},
		{
			id: "demo-video",
			label: "Demo video",
			status: hasVideo ? "pass" : "pending",
			evidence: hasVideo
				? "Video walkthrough link is present."
				: "Optional, but helps reviewers verify faster.",
		},
	];
}

export function summarizeReviewChecks(
	checks: ReviewCheck[],
): ReviewCheckSummary {
	const summary = checks.reduce(
		(acc, check) => {
			acc[check.status] += 1;
			return acc;
		},
		{ pass: 0, pending: 0, attention: 0 },
	);

	return {
		...summary,
		label: summary.attention
			? `${summary.attention} needs action`
			: summary.pending
				? `${summary.pending} awaiting review`
				: "Accepted",
	};
}

export function projectMatchScore(project: Project): number {
	const checks = summarizeReviewChecks(buildReviewChecks(project));
	const verifiedBoost = project.verified ? 8 : 0;
	const tractionBoost = Math.min(project.upvotes, 12);
	const recencyBoost = Math.max(0, 8 - project.updatedDays);
	return checks.pass * 4 + verifiedBoost + tractionBoost + recencyBoost;
}
