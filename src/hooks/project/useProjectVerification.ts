import { useQuery } from "@tanstack/react-query";
import { projectVerificationQuery } from "#/lib/project/api";

export function useProjectVerification(projectId: string, enabled = true) {
	return useQuery(projectVerificationQuery(projectId, enabled));
}
