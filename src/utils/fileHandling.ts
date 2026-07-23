/**
 * Client-side pre-upload checks (FR-S4) — UX only, not a security boundary. `file.type`
 * is whatever MIME string the browser/OS reports for the picked file and is trivially
 * spoofable (rename `evil.exe` to `evil.pdf`), so this only saves a round-trip for an
 * honest mistake. The server (`academy-server`'s `documents.ts` MIME/size checks) is the
 * real, untrusted-input enforcement point and MUST re-validate independently — never
 * assume a file reaching the server already passed a real check because it passed this
 * one. Shared by every document upload (thesis paper, grant proposal, pitch deck, vault
 * doc, badge evidence) — all land in the same `documents.ts` storage.
 */

const MAX_THESIS_MB = 15;
const THESIS_MIME_ALLOW = ["application/pdf"];

/** Returns an error message, or null if the file is acceptable. */
export function validateThesisFile(file: File): string | null {
	if (!THESIS_MIME_ALLOW.includes(file.type)) {
		return "File must be a PDF.";
	}
	if (file.size > MAX_THESIS_MB * 1024 * 1024) {
		return `File must be under ${MAX_THESIS_MB} MB.`;
	}
	return null;
}
