import { AcademyRole } from "#/lib/auth/model";

/**
 * Shared HTTP layer. Cross-cutting (root `lib/`, not a domain slice) — every domain's
 * `api.ts` calls through `apiFetch`. TODO(P0/server): finalize the response envelope and
 * the §3 token contract before relying on this in production.
 */

export const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export interface ApiEnvelope<T> {
	message: string;
	data: T;
}

/** Base fetch wrapper — always sends the iSkolar SSO cookie. */
export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const res = await fetch(`${BACKEND_URL}${path}`, {
		credentials: "include",
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	const text = await res.text();
	const body = text ? JSON.parse(text) : null;
	if (!res.ok) {
		throw new Error(body?.message ?? `HTTP ${res.status}`);
	}
	return body as T;
}

/**
 * Multipart upload wrapper — a sibling of `apiFetch` for file uploads (document/thesis/etc.).
 * No `Content-Type` header: the browser sets the multipart boundary. Same envelope parsing
 * and error surfacing as `apiFetch`.
 */
export async function apiUpload<T>(
	path: string,
	formData: FormData,
): Promise<T> {
	const res = await fetch(`${BACKEND_URL}${path}`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});
	const text = await res.text();
	const body = text ? JSON.parse(text) : null;
	if (!res.ok) {
		throw new Error(body?.message ?? `HTTP ${res.status}`);
	}
	return body as T;
}

/** Post-auth landing path for a role (null → onboarding). Used by guards + login. */
export function getDefaultPathOfRole(role: AcademyRole | null): string {
	switch (role) {
		case AcademyRole.Student:
			return "/student/home";
		case AcademyRole.Sponsor:
			return "/sponsor/home";
		case AcademyRole.Admin:
			return "/admin/dashboard";
		default:
			return "/role-select";
	}
}
