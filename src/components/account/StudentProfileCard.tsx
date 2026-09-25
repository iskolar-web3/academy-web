import { Link } from "@tanstack/react-router";

/**
 * Student dashboard profile sidebar — a 1:1 port of the design-template STUDENT
 * DASHBOARD profile card (gradient header, rounded avatar, name/role/school, skills,
 * and a link to the public profile).
 */

export interface StudentProfileCardModel {
	userId: string;
	name: string;
	initials: string;
	role: string;
	school: string;
	since: string;
	skills: string[];
}

export function StudentProfileCard({
	profile,
}: {
	profile: StudentProfileCardModel;
}) {
	return (
		<aside className="flex flex-col gap-4 lg:sticky lg:top-[84px]">
			<div className="rounded-[14px] border border-line bg-surface-card p-[18px] shadow-card">
				<div className="flex items-start gap-3.5">
					<span className="inline-flex size-[54px] flex-none items-center justify-center rounded-[14px] border border-info-bd bg-surface-tint text-[18px] text-action">
						{profile.initials}
					</span>
					<div className="min-w-0 flex-1">
						<div className="truncate text-[17px] text-content-heading">
							{profile.name}
						</div>
						<div className="mt-0.5 text-[13px] text-content-soft">
							{profile.role}
						</div>
						{profile.school ? (
							<div className="mt-2 text-[13px] leading-snug text-action">
								{profile.school}
							</div>
						) : null}
					</div>
				</div>

				<div className="mt-4 rounded-[10px] border border-line bg-surface-sunken/55 px-3 py-2.5">
					<div className="font-mono text-[10.5px] text-content-faint">
						{profile.since}
					</div>
				</div>

				{profile.skills.length > 0 ? (
					<div className="mt-4 flex flex-wrap gap-1.5">
						{profile.skills.slice(0, 5).map((skill) => (
							<span key={skill} className="chip chip--tech">
								{skill}
							</span>
						))}
					</div>
				) : null}

				<Link
					to="/u/$userId"
					params={{ userId: profile.userId }}
					className="btn btn-secondary mt-5 h-10 w-full text-[13.5px]"
				>
					View public profile
				</Link>
			</div>
		</aside>
	);
}
