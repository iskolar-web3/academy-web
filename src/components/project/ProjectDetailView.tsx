import { Code, MonitorPlay, Play } from "lucide-react";
import type { ReactNode } from "react";
import { useProjectImageSrc } from "#/hooks/project/useProjectImageSrc";
import { BACKEND_URL } from "#/lib/api";
import { thesisPaperUrl } from "#/lib/project/api";
import type { Project } from "#/lib/project/model";
import { PROJECT_TYPE_LABELS as TYPE_LABEL } from "#/lib/project/model";

/** Shared project detail for owners and showcase viewers. */
const sectionLabel = "font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint";

const MVP_LINKS = [
	{ key: "demo", Icon: MonitorPlay, label: "Live demo" },
	{ key: "repo", Icon: Code, label: "Repository" },
	{ key: "video", Icon: Play, label: "Demo video" },
] as const;

function initialsOf(name: string): string {
	return (
		name
			.split(/[^a-zA-Z0-9]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

export function ProjectDetailView({
	project,
	viewer,
	manage,
	interact,
}: {
	project: Project;
	viewer: "owner" | "sponsor" | "public" | "admin";
	manage?: ReactNode;
	interact?: ReactNode;
}) {
	const privateImageSrc = useProjectImageSrc(
		project.status === "published" ? null : project.imageUrl,
	);
	const imageSrc =
		project.status === "published" && project.imageUrl
			? `${BACKEND_URL}${project.imageUrl}`
			: privateImageSrc;
	const hasImage = Boolean(imageSrc);
	const links = MVP_LINKS.map((link) => ({
		...link,
		href: project.links[link.key],
	})).filter((link) => link.href);

	return (
		<div
			className={`card-surface mx-auto grid max-w-[1500px] min-w-0 overflow-hidden rounded-[18px] ${hasImage ? "md:grid-cols-[minmax(210px,260px)_minmax(0,1fr)] xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(250px,285px)]" : "md:grid-cols-[minmax(0,1fr)_minmax(240px,290px)]"}`}
		>
			{imageSrc ? (
				<div className="border-line border-b p-4 md:border-r md:border-b-0 xl:p-5">
					<div className="mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-[12px] bg-surface-card md:max-w-none">
						<img
							src={imageSrc}
							alt={`${project.title} project image`}
							className="size-full object-contain"
						/>
					</div>
				</div>
			) : null}

			<div className="min-w-0 p-5 sm:p-6">
				<div className="flex flex-wrap items-start gap-2">
					<h1 className="min-w-0 break-words text-[28px] leading-tight text-content-heading sm:text-[32px]">
						{project.title}
					</h1>
					{project.verified ? (
						<span className="rounded-[7px] border border-success-bd bg-success-bg px-2.5 py-1 text-[12px] text-verified">
							✔ Verified Builder
						</span>
					) : null}
				</div>
				<p className="mt-1 text-[13px] text-content-faint">
					{project.school || "iSkolar Academy"}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<span className="chip chip--category">
						{project.category || "Uncategorized"}
					</span>
					<span className="chip chip--type">{TYPE_LABEL[project.type]}</span>
				</div>

				<section className="mt-5">
					<h2 className={sectionLabel}>Overview</h2>
					<p className="mt-1.5 text-[16px] leading-[1.5] text-content-strong">
						{project.pitch || "No pitch provided"}
					</p>
				</section>

				<section className="mt-4">
					<h2 className={sectionLabel}>Purpose</h2>
					<p className="mt-1.5 text-[15px] leading-[1.5] text-content-strong">
						{project.purpose || "No purpose provided"}
					</p>
				</section>

				<div className="mt-5 grid gap-5 border-line border-t pt-4 sm:grid-cols-2">
					{project.tech.length > 0 ? (
						<section>
							<h2 className={sectionLabel}>Tech stack</h2>
							<div className="mt-2 flex flex-wrap gap-1.5">
								{project.tech.map((tech) => (
									<span key={tech} className="chip chip--category">
										{tech}
									</span>
								))}
							</div>
						</section>
					) : null}
					<section>
						<h2 className={sectionLabel}>
							{project.isTeam ? "Team & contributions" : "Ownership"}
						</h2>
						{project.isTeam && project.members.length > 0 ? (
							<div className="mt-2 grid gap-2">
								{project.members.map((member) => (
									<div key={member.id} className="flex min-w-0 items-center gap-2">
										<span className="flex size-8 flex-none items-center justify-center rounded-[8px] bg-action text-[11px] text-white">
											{initialsOf(member.name)}
										</span>
										<div className="min-w-0 text-[13px] leading-snug">
											<span className="text-content-heading">{member.name}</span>
											{member.contribution ? (
												<span className="text-content-faint"> · {member.contribution}</span>
											) : null}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="mt-2 text-[13px] leading-snug text-content-strong">
								Individual project
								{project.ownership.declared ? " · Ownership declared" : ""}
								{project.ownership.thesisPaperName ? (
									<>
										{" · "}
										<a
											href={thesisPaperUrl(project.id)}
											target="_blank"
											rel="noreferrer"
											className="text-action underline"
										>
											{project.ownership.thesisPaperName}
										</a>
									</>
								) : null}
							</p>
						)}
					</section>
				</div>
			</div>

			<aside
				className={`grid min-w-0 gap-4 border-line border-t p-5 md:p-6 xl:p-5 ${hasImage ? "md:col-span-2 md:grid-cols-2 xl:col-span-1 xl:block xl:border-t-0 xl:border-l" : "md:block md:border-t-0 md:border-l"}`}
			>
				{viewer !== "admin" ? (
					<div className="min-w-0 xl:mb-5">
						{viewer === "owner" ? manage : interact}
					</div>
				) : null}
				<section className="min-w-0">
					<h2 className={sectionLabel}>MVP links</h2>
					{links.length > 0 ? (
						<div className="mt-2 grid gap-2">
							{links.map(({ key, Icon, label, href }) => (
								<a
									key={key}
									href={href}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 rounded-[9px] border border-line bg-surface-card px-3 py-2 text-[13px] text-content-heading transition-colors hover:bg-surface-sunken"
								>
									<Icon className="size-4 flex-none text-action" aria-hidden />
									{label}
								</a>
							))}
						</div>
					) : (
						<p className="mt-2 text-[13px] text-content-soft">No links added yet.</p>
					)}
				</section>
			</aside>
		</div>
	);
}
