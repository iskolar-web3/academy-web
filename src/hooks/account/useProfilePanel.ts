import type { StudentProfileCardModel } from "#/components/account/StudentProfileCard";
import { useMyProfile } from "#/hooks/account/useProfile";
import { roleLabel } from "#/lib/account/model";

/** First letters of the first two words — "Jasmine Reyes" → "JR". */
function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	const letters = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
	return letters.join("") || "?";
}

/**
 * Builds the non-sponsor left-panel model (student and admin — sponsors get
 * `SponsorRail` instead) from the real profile (P0's `GET /accounts/me/profile`), so
 * every page that shows the panel — not just `/student/home` — reflects the same
 * onboarded name/school/skills. Returns `null` while the profile is still loading.
 */
export function useProfilePanel(): StudentProfileCardModel | null {
	const { data: profile } = useMyProfile();
	if (!profile) return null;

	return {
		userId: profile.academyUserId,
		name: profile.displayName,
		initials: initialsOf(profile.displayName),
		role: roleLabel(profile.role, profile.sponsorKind),
		school: profile.org,
		since: "iSkolar Academy member",
		skills: profile.skills,
	};
}
