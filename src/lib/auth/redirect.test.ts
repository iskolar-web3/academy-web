// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
	isSafeRedirectPath,
	rememberPostSignInRedirect,
	takePostSignInRedirect,
} from "./redirect";

afterEach(() => sessionStorage.clear());

describe("post-sign-in redirect", () => {
	it("accepts only same-origin paths", () => {
		expect(isSafeRedirectPath("/student/projects/new")).toBe(true);
		expect(isSafeRedirectPath("//evil.example")).toBe(false);
		expect(isSafeRedirectPath("https://evil.example")).toBe(false);
		expect(isSafeRedirectPath("/\\evil.example")).toBe(false);
		expect(isSafeRedirectPath("/%2F%2Fevil.example")).toBe(false);
		expect(isSafeRedirectPath("/%5Cevil.example")).toBe(false);
		expect(isSafeRedirectPath("/%0d%0aevil")).toBe(false);
		expect(isSafeRedirectPath("/\tevil")).toBe(false);
	});

	it("returns the remembered path once", () => {
		rememberPostSignInRedirect("/student/projects/new");
		expect(takePostSignInRedirect()).toBe("/student/projects/new");
		expect(takePostSignInRedirect()).toBeNull();
	});

	it("ignores unsafe paths", () => {
		rememberPostSignInRedirect("https://evil.example");
		expect(takePostSignInRedirect()).toBeNull();
	});
});
