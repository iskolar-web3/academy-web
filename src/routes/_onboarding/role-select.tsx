import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, HandCoins, Search, Shield, Users } from "lucide-react";
import { useState } from "react";
import { getDefaultPathOfRole } from "#/lib/api";
import { AcademyRole, SponsorKind } from "#/lib/auth/model";

/**
 * Role confirmation (PLT-04). The role is seeded from iSkolar; here the user confirms it
 * (and a sponsor picks a sub-kind). Submit is MOCK — it just routes into the role area.
 * TODO(P0): persist via `lib/account/api.ts → confirmRole()` before navigating.
 */
export const Route = createFileRoute("/_onboarding/role-select")({
	component: RoleSelect,
});

const ROLES = [
	{
		role: AcademyRole.Student,
		Icon: Users,
		title: "Student",
		body: "Showcase your projects, request grants for a starting thesis, and get scouted.",
	},
	{
		role: AcademyRole.Sponsor,
		Icon: HandCoins,
		title: "Sponsor",
		body: "Back theses, fund published work, and scout the people behind real MVPs.",
	},
	{
		role: AcademyRole.Admin,
		Icon: Shield,
		title: "Admin",
		body: "Review submissions, run the quality gate, and moderate the showcase.",
	},
];

const SPONSOR_KINDS = [
	{ kind: SponsorKind.Investor, Icon: HandCoins, title: "Investor" },
	{ kind: SponsorKind.Recruiter, Icon: Search, title: "Recruiter" },
	{ kind: SponsorKind.Employer, Icon: Briefcase, title: "Employer" },
];

function RoleSelect() {
	const navigate = useNavigate();
	const [role, setRole] = useState<AcademyRole | null>(null);
	const [kind, setKind] = useState<SponsorKind | null>(null);

	const needsKind = role === AcademyRole.Sponsor;
	const canContinue = role !== null && (!needsKind || kind !== null);

	const onContinue = () => {
		if (!role) return;
		// TODO(P0): await confirmRole({ role, kind }) before navigating.
		navigate({ to: getDefaultPathOfRole(role) });
	};

	return (
		<div className="mx-auto max-w-4xl text-center">
			<h1 className="text-4xl text-content-heading">Welcome to Academy</h1>
			<p className="mt-2 text-lg text-content-soft">
				Confirm how you'll use the platform.
			</p>

			<div className="mt-10 grid gap-5 sm:grid-cols-3">
				{ROLES.map(({ role: r, Icon, title, body }) => {
					const active = role === r;
					return (
						<button
							key={r}
							type="button"
							onClick={() => {
								setRole(r);
								setKind(null);
							}}
							className={`card-surface flex flex-col items-center p-6 text-center transition-all ${
								active ? "ring-2 ring-action" : "hover:-translate-y-1"
							}`}
						>
							<span
								className={`inline-flex size-16 items-center justify-center rounded-full ${
									active
										? "bg-action text-on-action"
										: "bg-surface-tint text-action"
								}`}
							>
								<Icon className="size-8" strokeWidth={1.5} aria-hidden />
							</span>
							<h2 className="mt-4 text-xl text-content-heading">{title}</h2>
							<p className="mt-2 text-sm text-content-soft">{body}</p>
						</button>
					);
				})}
			</div>

			{needsKind ? (
				<div className="mt-8">
					<p className="eyebrow mb-4 justify-center">Sponsor type</p>
					<div className="grid gap-4 sm:grid-cols-3">
						{SPONSOR_KINDS.map(({ kind: k, Icon, title }) => {
							const active = kind === k;
							return (
								<button
									key={k}
									type="button"
									onClick={() => setKind(k)}
									className={`card-surface flex items-center justify-center gap-3 p-4 transition-all ${
										active ? "ring-2 ring-action" : "hover:-translate-y-1"
									}`}
								>
									<Icon
										className="size-5 text-action"
										strokeWidth={1.5}
										aria-hidden
									/>
									<span className="text-content-heading">{title}</span>
								</button>
							);
						})}
					</div>
				</div>
			) : null}

			<button
				type="button"
				onClick={onContinue}
				disabled={!canContinue}
				className="btn btn-primary mt-10 px-16 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Continue
			</button>
		</div>
	);
}
