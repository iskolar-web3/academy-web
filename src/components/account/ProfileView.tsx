import { Link, useRouter } from "@tanstack/react-router";
import { type AccountProfile, roleLabel } from "#/lib/account/model";
import type { ShowcaseProject } from "#/lib/discover/model";
import { statusChipClass } from "#/lib/project/helper";

/**
 * Public profile page (STU-02 / SPN-02) — a 1:1 port of the design-template PROFILE VIEW
 * PAGE: gradient banner, an overlapping avatar tile, name / headline / organization, and
 * a two-column body (About + role work on the left; stats + skills in the aside). Purely
 * presentational — it takes the `AccountProfile` view model so it renders the same for a
 * mock, the signed-in user's own profile, or someone else's.
 *
 * The student "work" card renders the template's two-column published-project rows
 * (title · status pill · category · age) from the live showcase projection (STU-02);
 * funded grants join it in P4.
 */

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

function formatRaised(raised: number): string {
	if (raised >= 1000) return `₱${Math.round(raised / 1000)}k`;
	return `₱${raised.toLocaleString("en-US")}`;
}

const panelCls =
	"rounded-2xl border border-line bg-surface-card px-6 py-[22px]";
const asideLabelCls =
	"mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60";

export function ProfileView({
	profile,
	canEdit,
	work,
}: {
	profile: AccountProfile;
	canEdit?: boolean;
	/** The user's published showcase work (STU-02) — students only. */
	work?: ShowcaseProject[];
}) {
	const router = useRouter();
	const editTo =
		profile.role === "student"
			? "/student/profile"
			: profile.role === "sponsor"
				? "/sponsor/profile"
				: null;

	const stats = [
		{
			label: "projects",
			value: profile.stats.projects.toLocaleString("en-US"),
		},
		{ label: "upvotes", value: profile.stats.upvotes.toLocaleString("en-US") },
		{ label: "raised", value: formatRaised(profile.stats.raised) },
	];

	const workLabel = profile.role === "sponsor" ? "Backed work" : "Projects";

	return (
		<main className="-mx-[clamp(1.5rem,4vw,3rem)] -mt-10 pb-20">
			<div className="relative h-[210px] bg-[linear-gradient(135deg,#3a52a6,#607ef2)]">
				<button
					type="button"
					onClick={() => router.history.back()}
					className="absolute top-[18px] left-6 h-[38px] rounded-[11px] bg-white/20 px-4 text-[14px] text-white backdrop-blur-md transition-colors hover:bg-white/30"
				>
					← Back
				</button>
			</div>

			<div className="mx-auto max-w-[1340px] px-[clamp(1.5rem,4vw,3rem)]">
				<div className="relative z-[2] -mt-11 flex flex-wrap items-end gap-[22px]">
					<span className="flex size-32 flex-none items-center justify-center rounded-[32px] border-[5px] border-[#eef4ff] bg-action text-[42px] text-white shadow-[0_12px_28px_rgba(31,42,82,0.22)]">
						{profile.avatarUrl ? (
							<img
								src={profile.avatarUrl}
								alt={profile.displayName}
								className="size-full rounded-[27px] object-cover"
							/>
						) : (
							initialsOf(profile.displayName)
						)}
					</span>
					<div className="min-w-[240px] flex-1 pb-2">
						<h1 className="text-[30px] leading-[1.15] text-content-heading">
							{profile.displayName}
						</h1>
						{profile.headline ? (
							<p className="mt-[5px] text-[15.5px] text-content-muted">
								{profile.headline}
							</p>
						) : null}
						<p className="mt-1 font-mono text-[13px] text-content-faint">
							{roleLabel(profile.role, profile.sponsorKind)}
							{profile.org ? ` · ${profile.org}` : ""}
						</p>
					</div>
					{canEdit && editTo ? (
						<Link to={editTo} className="btn btn-primary h-11">
							Edit profile
						</Link>
					) : null}
				</div>

				<div className="mt-7 grid items-start gap-[26px] lg:grid-cols-[1fr_340px]">
					<div className="flex flex-col gap-5">
						<section className={panelCls}>
							<h2 className="mb-2.5 text-[18px] text-content-heading">About</h2>
							<p className="text-[15px] leading-[1.6] text-content-strong">
								{profile.bio || "No bio yet."}
							</p>
						</section>

						<section className={panelCls}>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-[18px] text-content-heading">
									{workLabel}
								</h2>
								<span className="font-mono text-[12.5px] text-content-faint">
									Showcase &amp; grants
								</span>
							</div>
							{work && work.length > 0 ? (
								<div className="grid gap-3.5 sm:grid-cols-2">
									{work.map((p) => (
										<Link
											key={p.id}
											to="/projects/$projectId"
											params={{ projectId: p.id }}
											className="rounded-[13px] border border-[#e3ebfb] px-[15px] py-[13px] transition-colors hover:bg-surface-sunken"
										>
											<div className="mb-[5px] flex items-center justify-between gap-2">
												<span className="truncate text-[15.5px] text-content-heading">
													{p.title}
												</span>
												<span
													className={`flex-none rounded-[6px] px-2 py-0.5 font-mono text-[11px] ${statusChipClass("published")}`}
												>
													Published
												</span>
											</div>
											<div className="font-mono text-[11.5px] text-content-faint">
												{p.category || "Uncategorized"} ·{" "}
												{p.updatedDays === 0
													? "today"
													: `${p.updatedDays}d ago`}
											</div>
										</Link>
									))}
								</div>
							) : (
								<p className="rounded-xl border border-info-bd bg-surface-sunken p-5 text-sm text-content-soft">
									{profile.role === "student"
										? "No published projects yet."
										: "Published projects and funded grants appear here as this account backs work (P4)."}
								</p>
							)}
						</section>
					</div>

					<aside className="flex flex-col gap-5">
						<div className={panelCls}>
							<div className="flex gap-2.5">
								{stats.map((s) => (
									<div key={s.label} className="flex-1 text-center">
										<div className="text-[22px] text-action">{s.value}</div>
										<div className="font-mono text-[10.5px] text-content-faint">
											{s.label}
										</div>
									</div>
								))}
							</div>
						</div>

						{profile.role === "student" && profile.skills.length > 0 ? (
							<div className={panelCls}>
								<div className={asideLabelCls}>Skills</div>
								<div className="flex flex-wrap gap-[7px]">
									{profile.skills.map((skill) => (
										<span
											key={skill}
											className="rounded-full border border-info-bd bg-[#eef3ff] px-2.5 py-1 font-mono text-[11.5px] text-action"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						) : null}
					</aside>
				</div>
			</div>
		</main>
	);
}
