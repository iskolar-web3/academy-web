import { queryOptions } from "@tanstack/react-query";
import { hueFromString, triggersReReview } from "#/lib/project/helper";
import {
	deleteProject,
	getProjectById,
	insertProject,
	listProjects,
	replaceProject,
} from "#/lib/project/mock";
import type { Project, ProjectInput } from "#/lib/project/model";

/**
 * Project API — CLIENT-ONLY, backed by the in-memory mock store. Query keys + signatures
 * are final. TODO(P1/server): swap each body for `apiFetch(...)` against academy-server;
 * the hooks and UI won't change.
 */

export function myProjectsQuery() {
	return queryOptions({
		queryKey: ["project", "mine"] as const,
		queryFn: async (): Promise<Project[]> => listProjects(),
	});
}

export function projectQuery(id: string) {
	return queryOptions({
		queryKey: ["project", id] as const,
		queryFn: async (): Promise<Project> => {
			const p = getProjectById(id);
			if (!p) throw new Error("Project not found");
			return p;
		},
	});
}

export async function createDraft(input: ProjectInput): Promise<Project> {
	return insertProject({
		...input,
		status: "draft",
		returnedNote: null,
		updatedDays: 0,
		upvotes: 0,
		hue: hueFromString(input.title || "project"),
		school: "",
	});
}

/** Save edits. If a published project's MVP-critical fields change, re-enter review. */
export async function updateProject(
	id: string,
	input: ProjectInput,
): Promise<void> {
	const current = getProjectById(id);
	if (!current) throw new Error("Project not found");
	const reReview =
		current.status === "published" && triggersReReview(current, input);
	replaceProject(id, {
		...current,
		...input,
		status: reReview ? "under_review" : current.status,
		updatedDays: 0,
	});
}

export async function submitProject(id: string): Promise<void> {
	const current = getProjectById(id);
	if (!current) throw new Error("Project not found");
	replaceProject(id, { ...current, status: "submitted", updatedDays: 0 });
}

export async function resubmitProject(id: string): Promise<void> {
	const current = getProjectById(id);
	if (!current) throw new Error("Project not found");
	replaceProject(id, {
		...current,
		status: "submitted",
		returnedNote: null,
		updatedDays: 0,
	});
}

export async function withdrawProject(id: string): Promise<void> {
	const current = getProjectById(id);
	if (!current) throw new Error("Project not found");
	replaceProject(id, { ...current, status: "withdrawn", updatedDays: 0 });
}

export async function deleteDraft(id: string): Promise<void> {
	deleteProject(id);
}
