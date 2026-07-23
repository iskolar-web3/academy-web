import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "#/auth";
import { useConfirmRole } from "#/hooks/auth/useConfirmRole";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Role confirmation (PLT-04) — a port of the design-template ONBOARDING screen: an eyebrow,
 * a heading, and a vertical list of role cards. Confirming persists the role via
 * `POST /accounts/me/role` (`useConfirmRole`), which flips `roleConfirmed` so the guard lets
 * the user into their area. One click per role. Basic-info (name + school/org) is the next
 * onboarding step for everyone — a sponsor picks a subscription tier after that.
 */
export const Route = createFileRoute("/_onboarding/role-select")({
	component: RoleSelect,
});

interface RoleCard {
	role: AcademyRole;
	initial: string;
	bg: string;
	label: string;
	desc: string;
}

const ROLE_CARDS: RoleCard[] = [
	{
		role: AcademyRole.Student,
		initial: "St",
		bg: "#3a52a6",
		label: "Student",
		desc: "Showcase your projects, request grants for a starting thesis, and get scouted.",
	},
	{
		role: AcademyRole.Sponsor,
		initial: "Sp",
		bg: "#607ef2",
		label: "Sponsor",
		desc: "Back theses, fund published work, and scout the people behind real MVPs.",
	},
	{
		role: AcademyRole.Admin,
		initial: "Ad",
		bg: "#1f2a52",
		label: "Admin",
		desc: "Review submissions, run the quality gate, and moderate the showcase.",
	},
];

function RoleSelect() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const confirm = useConfirmRole();

	// Role already confirmed (e.g. back button) — this step is done, move on.
	useEffect(() => {
		if (user?.roleConfirmed) navigate({ to: "/basic-info" });
	}, [user?.roleConfirmed, navigate]);

	const onRole = (role: AcademyRole) => {
		confirm.mutate(
			{ role, kind: null },
			{ onSuccess: () => navigate({ to: "/basic-info" }) },
		);
	};

	const busy = confirm.isPending;

	return (
		<main className="mx-auto max-w-[760px]">
			<div className="mb-8 text-center">
				<div className="mb-3.5 inline-flex items-center gap-[11px]">
					<span className="h-0.5 w-[30px] bg-action/50" />
					<span className="font-mono text-[11.5px] uppercase tracking-[0.24em] text-action/60">
						Welcome to Academy
					</span>
					<span className="h-0.5 w-[30px] bg-action/50" />
				</div>
				<h1 className="mb-2 text-[34px] text-content-heading">
					Confirm how you'll use Academy
				</h1>
				<p className="text-[15.5px] leading-[1.55] text-content-muted">
					You're signed in through iSkolar. Your role is seeded from your
					account, confirm it to continue.
				</p>
			</div>

			<div className="flex flex-col gap-3.5">
				{ROLE_CARDS.map((r) => (
					<button
						key={r.role}
						type="button"
						disabled={busy}
						onClick={() => onRole(r.role)}
						className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface-card px-[22px] py-5 text-left transition-all hover:-translate-y-0.5 hover:border-action disabled:cursor-not-allowed disabled:opacity-60"
					>
						<span
							className="flex size-[52px] flex-none items-center justify-center rounded-[15px] text-[20px] text-white"
							style={{ background: r.bg }}
						>
							{r.initial}
						</span>
						<div className="flex-1">
							<div className="text-[19px] text-content-heading">{r.label}</div>
							<div className="mt-0.5 text-[13.5px] text-content-faint">
								{r.desc}
							</div>
						</div>
						<span className="text-[20px] text-action">→</span>
					</button>
				))}
			</div>

			{confirm.isError ? (
				<p className="mt-4 text-center text-sm text-danger">
					Couldn't confirm your role — {(confirm.error as Error).message}
				</p>
			) : null}
		</main>
	);
}
