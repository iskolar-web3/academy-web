import { type ApiEnvelope, apiUpload } from "#/lib/api";
import type { BadgeKind } from "#/lib/badge/model";

/**
 * Grant a Verified Builder badge (ADM-07). Multipart, same one-request shape as P4's grant
 * proposal upload: `data` (JSON `{projectId, kind}`) + `file` (evidence, PDF — reuses the
 * shared `documents.ts` allow-list, same as thesis papers and grant proposals). Sets
 * `project.verified = true` server-side and stores the evidence via `documents.ts`
 * (folder `'credentials'`).
 */
export async function grantBadge(
	projectId: string,
	kind: BadgeKind,
	file: File,
): Promise<{ key: string }> {
	const formData = new FormData();
	formData.append("data", JSON.stringify({ projectId, kind }));
	formData.append("file", file);
	const res = await apiUpload<ApiEnvelope<{ key: string }>>(
		"/badges",
		formData,
	);
	return res.data;
}
