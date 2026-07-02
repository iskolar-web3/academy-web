import { useQuery } from "@tanstack/react-query";
import { myProjectsQuery } from "#/lib/project/api";

/** Dashboard list of the signed-in student's projects (STU-09). */
export function useMyProjects() {
	return useQuery(myProjectsQuery());
}
