/**
 * Client-side pre-upload checks (FR-S4). Runs before any upload so bad files are caught
 * without a round-trip. The real upload (thesis paper → Lumen vault) lands in P1 server.
 */

const MAX_THESIS_MB = 15;
const THESIS_MIME_ALLOW = ["application/pdf"];

/** Returns an error message, or null if the thesis paper is acceptable. */
export function validateThesisFile(file: File): string | null {
	if (!THESIS_MIME_ALLOW.includes(file.type)) {
		return "Thesis paper must be a PDF.";
	}
	if (file.size > MAX_THESIS_MB * 1024 * 1024) {
		return `File must be under ${MAX_THESIS_MB} MB.`;
	}
	return null;
}
