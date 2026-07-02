/**
 * Public profile renderer (STU-02 / SPN-02). Presentational only — it takes a plain
 * view-model so it works with mock data now and the real `lib/account` query later.
 * The "Published work" section is a stub until P1/P3 land project data.
 */

export interface ProfileLink {
	label: string;
	href: string;
}

export interface ProfileViewModel {
	displayName: string;
	/** e.g. "Student · UP Diliman" or "Sponsor · Investor". */
	role: string;
	/** Short headline: specialty / focus. */
	headline: string;
	avatarUrl?: string | null;
	location?: string;
	bio: string;
	skills: string[];
	links?: ProfileLink[];
}

function initials(name: string): string {
	return name
		.split(" ")
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function ProfileView({ profile }: { profile: ProfileViewModel }) {
	return (
		<div className="mx-auto max-w-3xl">
			<div className="card-surface flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
				<div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-tint text-2xl font-semibold text-action">
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.displayName}
							className="size-full object-cover"
						/>
					) : (
						initials(profile.displayName)
					)}
				</div>

				<div className="flex-1">
					<span className="chip chip--category">{profile.role}</span>
					<h1 className="mt-3 text-3xl text-content-heading">
						{profile.displayName}
					</h1>
					<p className="mt-1 text-lg text-content-soft">{profile.headline}</p>
					{profile.location ? (
						<p className="mt-1 text-sm text-content-faint">
							{profile.location}
						</p>
					) : null}

					{profile.links && profile.links.length > 0 ? (
						<div className="mt-4 flex flex-wrap gap-3">
							{profile.links.map((link) => (
								<a
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="text-sm text-action underline-offset-4 hover:underline"
								>
									{link.label}
								</a>
							))}
						</div>
					) : null}
				</div>
			</div>

			{profile.bio ? (
				<section className="mt-6">
					<h2 className="eyebrow mb-3">About</h2>
					<p className="text-base leading-relaxed text-content-body">
						{profile.bio}
					</p>
				</section>
			) : null}

			{profile.skills.length > 0 ? (
				<section className="mt-6">
					<h2 className="eyebrow mb-3">Skills</h2>
					<div className="flex flex-wrap gap-2">
						{profile.skills.map((skill) => (
							<span key={skill} className="chip chip--tech">
								{skill}
							</span>
						))}
					</div>
				</section>
			) : null}

			<section className="mt-6">
				<h2 className="eyebrow mb-3">Published work</h2>
				<div className="card-surface p-6 text-sm text-content-soft">
					Published projects appear here once the showcase ships (P1 / P3).
				</div>
			</section>
		</div>
	);
}
