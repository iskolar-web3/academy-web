import { MOCK_PROJECTS } from "#/lib/discover/mock";
import type { Category, Project, ProjectStatus } from "#/lib/project/model";

/**
 * CLIENT-ONLY mock store. Seeded deterministically from the discover mock so SSR and the
 * first client render agree; user actions mutate this module-level array after hydration
 * (never during render). Replaced by real `academy-server` calls in P1 — see `./api.ts`.
 */

const STATUS_SEED: ProjectStatus[] = [
	"published",
	"under_review",
	"returned",
	"draft",
	"withdrawn",
];

function seed(): Project[] {
	return MOCK_PROJECTS.slice(0, 5).map((p, i) => {
		const status = STATUS_SEED[i];
		const isThesis = p.type === "thesis";
		return {
			id: p.id,
			title: p.title,
			category: p.category as Category,
			type: isThesis ? "thesis_capstone" : "idea",
			pitch: p.pitch,
			purpose: p.purpose,
			tech: p.tech,
			links: {
				demo: "https://demo.example.com",
				repo: "https://github.com/example/repo",
				video: "https://youtu.be/example",
			},
			status,
			isTeam: p.members.length > 1,
			members: p.members.map((m, mi) => ({
				id: `${p.id}-m${mi}`,
				name: m.name,
				contribution: m.role,
				linkedUserId: mi === 0 ? null : `u-${p.id}-${mi}`,
				consent:
					mi === 0 ? "not_required" : mi % 2 === 0 ? "accepted" : "pending",
			})),
			ownership: {
				declared: true,
				thesisPaperName: isThesis ? "thesis-paper.pdf" : null,
			},
			returnedNote:
				status === "returned"
					? "The demo link returned a 404 during review. Please fix it and resubmit."
					: null,
			updatedDays: p.days,
			upvotes: p.upvotes,
			hue: p.hue,
			school: p.school,
		} satisfies Project;
	});
}

let store: Project[] = seed();
let counter = 100;

export function listProjects(): Project[] {
	return store.map((p) => structuredClone(p));
}

export function getProjectById(id: string): Project | undefined {
	const found = store.find((p) => p.id === id);
	return found ? structuredClone(found) : undefined;
}

export function insertProject(project: Omit<Project, "id">): Project {
	counter += 1;
	const created: Project = {
		...structuredClone(project),
		id: `new-${counter}`,
	};
	store = [created, ...store];
	return structuredClone(created);
}

export function replaceProject(id: string, next: Project): void {
	store = store.map((p) =>
		p.id === id ? { ...structuredClone(next), id } : p,
	);
}

export function deleteProject(id: string): void {
	store = store.filter((p) => p.id !== id);
}
