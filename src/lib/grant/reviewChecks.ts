import type { GrantRequest } from "#/lib/grant/model";

export type GrantCheckStatus = "pass" | "pending" | "attention";

export interface GrantCheck {
	id: string;
	label: string;
	status: GrantCheckStatus;
	evidence: string;
}

export interface GrantCheckSummary {
	pass: number;
	pending: number;
	attention: number;
	label: string;
}

function hasEnoughContext(grant: GrantRequest): boolean {
	return grant.title.trim().length >= 8 && grant.purpose.trim().length >= 48;
}

export function buildGrantChecks(grant: GrantRequest): GrantCheck[] {
	const hasProposal = Boolean(grant.proposalName);
	const hasSchool = Boolean(grant.school.trim());
	const purpose = grant.purpose.toLowerCase();
	const possibleHumanSubjects = [
		"survey",
		"interview",
		"patient",
		"student data",
		"respondent",
	].some((needle) => purpose.includes(needle));

	return [
		{
			id: "proposal",
			label: "Title proposal",
			status: hasProposal ? "pass" : "attention",
			evidence: hasProposal
				? `${grant.proposalName} is stored in the document vault.`
				: "Upload the accepted title proposal PDF.",
		},
		{
			id: "structure",
			label: "Research structure",
			status: hasEnoughContext(grant) ? "pass" : "attention",
			evidence: hasEnoughContext(grant)
				? "Title and funding purpose have enough context for review."
				: "Add a clearer abstract, method, or funding purpose summary.",
		},
		{
			id: "institution",
			label: "School endorsement",
			status: hasProposal && hasSchool ? "pending" : "attention",
			evidence:
				hasProposal && hasSchool
					? `${grant.school} is attached to this request; adviser-domain verification is next.`
					: "Attach the proposal and school context before endorsement checks.",
		},
		{
			id: "citations",
			label: "Citation / DOI check",
			status: hasProposal ? "pending" : "attention",
			evidence: hasProposal
				? "Ready for backend citation and DOI resolution."
				: "The uploaded proposal is needed before citation checks can run.",
		},
		{
			id: "similarity",
			label: "Similarity review",
			status: hasProposal ? "pending" : "attention",
			evidence: hasProposal
				? "Queued for a licensed/open similarity provider decision."
				: "Similarity review needs the proposal document.",
		},
		{
			id: "ethics",
			label: "Ethics routing",
			status: possibleHumanSubjects ? "pending" : "pass",
			evidence: possibleHumanSubjects
				? "Potential human-subjects language found; route for ethics clearance review."
				: "No human-subjects signal detected from the submitted summary.",
		},
		{
			id: "ownership",
			label: "Ownership declaration",
			status: grant.ownershipDeclared ? "pass" : "attention",
			evidence: grant.ownershipDeclared
				? "Student ownership declaration is submitted."
				: "Confirm copyright and credited external work.",
		},
	];
}

export function summarizeGrantChecks(checks: GrantCheck[]): GrantCheckSummary {
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
				? `${summary.pending} queued`
				: "Ready",
	};
}
