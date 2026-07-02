import { createFileRoute, Link } from "@tanstack/react-router";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { MyProjectCard } from "#/components/project/MyProjectCard";
import { useSession } from "#/hooks/auth/useSession";
import { useMyProjects } from "#/hooks/project/useMyProjects";
import { dashboardStats } from "#/lib/project/helper";

/**
 * Student dashboard (STU-09) — a 1:1 build of the design-template STUDENT DASHBOARD:
 * a sticky profile sidebar, four stat tiles, and the owned-project list with lifecycle
 * pipeline trackers. Profile detail (school/skills) is placeholder until the profile API
 * lands (STU-01/02); the name comes from the live session.
 */
export const Route = createFileRoute("/student/home")({
	component: StudentHome,
});

/** First letters of the first two words — "test-student-1" → "TS". */
function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	const letters = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
	return letters.join("") || "S";
}

function StudentHome() {
	const { user } = useSession();
	const { data: projects = [], isLoading } = useMyProjects();
	const stats = dashboardStats(projects);

	const name = user?.displayName || user?.iskolarUserId || "Student";
	const profile = {
		userId: user?.iskolarUserId || "me",
		name,
		initials: initialsOf(name),
		role: "Student",
		// Placeholder profile detail until the profile API lands (STU-01/02).
		school: "UP Diliman",
		since: "iSkolar Academy member",
		skills: ["Machine Learning", "React Native", "Mobile", "UX"],
	};

	return (
		<div className="grid grid-cols-1 gap-7 lg:grid-cols-[282px_1fr] lg:items-start">
			<StudentProfileCard profile={profile} />

			<div>
				<div className="mb-[22px] flex items-center justify-end gap-2.5">
					<Link
						to="/student/projects/new"
						className="btn btn-primary h-[46px] px-5 text-[14.5px]"
					>
						+ Submit a project
					</Link>
				</div>

				<div className="mb-7 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
					{stats.map((stat) => (
						<div key={stat.label} className="card-surface p-4">
							<div className="text-[27px] text-action">{stat.value}</div>
							<div className="mt-[3px] font-mono text-[11.5px] text-content-faint">
								{stat.label}
							</div>
						</div>
					))}
				</div>

				{isLoading ? (
					<p className="text-content-soft">Loading…</p>
				) : projects.length === 0 ? (
					<div className="card-surface p-10 text-center">
						<p className="text-content-heading">No projects yet</p>
						<p className="mt-1 text-sm text-content-soft">
							Publish your first project to get it in front of sponsors.
						</p>
						<Link to="/student/projects/new" className="btn btn-primary mt-5">
							+ Submit a project
						</Link>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{projects.map((project) => (
							<MyProjectCard key={project.id} project={project} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
