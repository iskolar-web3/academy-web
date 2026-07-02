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
			<div className="card-surface overflow-hidden rounded-[18px]">
				<div className="h-[70px] bg-[linear-gradient(135deg,#3a52a6,#607ef2)]" />
				<div className="-mt-[34px] px-[22px] pb-[22px] text-center">
					<span className="inline-flex size-[68px] items-center justify-center rounded-[20px] border-4 border-white bg-action text-2xl text-white shadow-[0_8px_18px_rgba(31,42,82,0.18)]">
						{profile.initials}
					</span>
					<div className="mt-3 text-[19px] text-content-heading">
						{profile.name}
					</div>
					<div className="mt-[3px] font-mono text-[12px] text-content-faint">
						{profile.role}
					</div>
					{profile.school ? (
						<div className="mt-2 text-[13px] text-action">{profile.school}</div>
					) : null}
					<div className="mt-[3px] font-mono text-[11.5px] text-content-ghost">
						{profile.since}
					</div>

					{profile.skills.length > 0 ? (
						<>
							<div className="my-4 h-px bg-[#eef1fa]" />
							<div className="mb-4 flex flex-wrap justify-center gap-1.5">
								{profile.skills.map((skill) => (
									<span
										key={skill}
										className="rounded-full border border-info-bd bg-[#eef3ff] px-[9px] py-1 font-mono text-[11px] text-action"
									>
										{skill}
									</span>
								))}
							</div>
						</>
					) : (
						<div className="my-4 h-px bg-[#eef1fa]" />
					)}

					<Link
						to="/u/$userId"
						params={{ userId: profile.userId }}
						className="btn btn-secondary h-[42px] w-full text-[14px]"
					>
						View public profile
					</Link>
				</div>
			</div>
		</aside>
	);
}
