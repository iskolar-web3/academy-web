/**
 * Post-sign-in destination (e.g. Submit Project → `/student/projects/new`). The hosted
 * SSO and the Google OAuth start route both take it as `?redirect=`; academy-server's
 * Google callback honours it only for a user who is already fully onboarded (onboarding
 * is never skipped). A first-time user lands on onboarding instead, so the target is
 * also kept in sessionStorage and picked up by the route guard once the user is admitted
 * to an app area.
 */
const STORAGE_KEY = "academy:post-sign-in-redirect";

// biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control chars is the point.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function isPlainRelativePath(path: string): boolean {
	return (
		path.startsWith("/") &&
		!path.startsWith("//") &&
		!path.includes("\\") &&
		!CONTROL_CHARS.test(path)
	);
}

/**
 * Only same-origin absolute paths — never `//host`, a backslash, a full URL, or a control
 * character, checked on the decoded form too (`/%2F%2Fhost`). Mirrors academy-server's
 * `safeRedirectPath` (`account/model.ts`).
 */
export function isSafeRedirectPath(path: string): boolean {
	if (!isPlainRelativePath(path)) {
		return false;
	}
	try {
		return isPlainRelativePath(decodeURIComponent(path));
	} catch {
		return false;
	}
}

export function rememberPostSignInRedirect(path: string): void {
	if (!isSafeRedirectPath(path)) {
		return;
	}
	try {
		sessionStorage.setItem(STORAGE_KEY, path);
	} catch {
		// Storage blocked (private mode): the user lands on their role home instead.
	}
}

/** Returns the pending destination once, then forgets it. */
export function takePostSignInRedirect(): string | null {
	try {
		const path = sessionStorage.getItem(STORAGE_KEY);
		sessionStorage.removeItem(STORAGE_KEY);
		return path && isSafeRedirectPath(path) ? path : null;
	} catch {
		return null;
	}
}
