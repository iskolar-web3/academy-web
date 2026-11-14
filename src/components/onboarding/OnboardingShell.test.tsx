// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingShell } from "./OnboardingShell";

const auth = vi.hoisted(() => ({
	email: "learner@example.test" as string | null,
}));
vi.mock("#/auth", () => ({ useAuth: () => ({ user: { email: auth.email } }) }));

afterEach(cleanup);

beforeEach(() => {
	auth.email = "learner@example.test";
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
		expect(onSubmit).toHaveBeenLastCalledWith(true, "learner@example.test");
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

	it("collects an email only after opting in and requires it before subscribing", () => {
		auth.email = null;
		const onSubmit = vi.fn();
		render(
			<OnboardingShell onSubmit={onSubmit} pending={false}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		expect(screen.queryByLabelText("Email for updates")).toBeNull();
		fireEvent.click(screen.getByRole("checkbox"));
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole("alert").textContent).toBe(
			"Enter a valid email address.",
		);
		fireEvent.change(screen.getByLabelText("Email for updates"), {
			target: { value: "new@example.test" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).toHaveBeenCalledWith(true, "new@example.test");
	});

	it("lets an account without an email continue after opting back out", () => {
		auth.email = null;
		const onSubmit = vi.fn();
		render(
			<OnboardingShell onSubmit={onSubmit} pending={false}>
				<p>Signup details</p>
			</OnboardingShell>,
		);
		fireEvent.click(screen.getByRole("checkbox"));
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		fireEvent.click(screen.getByRole("checkbox"));
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		expect(onSubmit).toHaveBeenCalledWith(false);
	});
});
