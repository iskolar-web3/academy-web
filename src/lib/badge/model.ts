/**
 * Verified Builder badge domain (ADM-07, P5). Additive trust signal — never gates
 * publishing, ownership stays self-declared (FR-V4). Source is settled per
 * `documents/iskolar-academy-plan.md` §9.15's own recommendation: manual admin grant in
 * v1, automated deploy-ping/repo-parsing later — not re-decided here.
 */

export const BADGE_KINDS = [
	"verified_deploy",
	"hackathon",
	"capstone",
	"repo_signal",
] as const;
export type BadgeKind = (typeof BADGE_KINDS)[number];

export const BADGE_KIND_LABELS: Record<BadgeKind, string> = {
	verified_deploy: "Verified live deploy",
	hackathon: "Hackathon win",
	capstone: "Capstone / thesis defense",
	repo_signal: "Repo signal",
};
