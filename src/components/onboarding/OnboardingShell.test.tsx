// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingShell } from "./OnboardingShell";

afterEach(cleanup);

beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		},
	);
});

describe("signup marketing choice", () => {
	it("starts unchecked and lets the user continue without subscribing", () => {
		const onSubmit = vi.fn();
		render(
			<OnboardingShell onSubmit={onSubmit} pending={false}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		const checkbox = screen.getByRole("checkbox", {
			name: /Notify me about new scholarships, opportunities, and iSkolar updates/,
		});
		expect(checkbox.getAttribute("aria-checked")).toBe("false");
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).toHaveBeenCalledWith(false);
	});

	it("submits the explicit opt-in and supports changing it back", () => {
		const onSubmit = vi.fn();
		render(
			<OnboardingShell onSubmit={onSubmit} pending={false}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		const checkbox = screen.getByRole("checkbox", {
			name: /Notify me about new scholarships, opportunities, and iSkolar updates/,
		});
		fireEvent.click(checkbox);
		expect(checkbox.getAttribute("aria-checked")).toBe("true");
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).toHaveBeenLastCalledWith(true);
		fireEvent.click(checkbox);
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).toHaveBeenLastCalledWith(false);
	});

	it("retains the choice when saving fails and prevents changes during saving", () => {
		const onSubmit = vi.fn();
		const view = render(
			<OnboardingShell onSubmit={onSubmit} pending={false}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		fireEvent.click(screen.getByRole("checkbox"));
		view.rerender(
			<OnboardingShell onSubmit={onSubmit} pending={false} error="Try again">
				<p>Signup details</p>
			</OnboardingShell>,
		);
		expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
			"true",
		);
		view.rerender(
			<OnboardingShell onSubmit={onSubmit} pending={true}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		expect(screen.getByRole("checkbox").hasAttribute("disabled")).toBe(true);
	});
});
