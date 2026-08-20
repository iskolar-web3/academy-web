import { useQuery } from "@tanstack/react-query";
import { projectQuery } from "#/lib/project/api";

/** A single owned project by id. */
export function useProject(id: string) {
	return useQuery(projectQuery(id));
}
