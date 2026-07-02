import { Link, useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	Bell,
	Check,
	Heart,
	Lock,
	LogOut,
	Settings,
	User,
} from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { useAuth } from "#/auth";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Signed-in top header — a 1:1 port of the design-template HEADER: logo, role-aware
 * center nav, a notification popover, and a user pill that opens the account dropdown.
 * Both popovers close on outside-click or Escape. `role` defaults to the live session
 * role (used by the shared `_app` shell); role shells pass their own role.
 */

interface NavItem {
	label: string;
	to: string;
}

const NAV: Record<AcademyRole, NavItem[]> = {
	[AcademyRole.Student]: [
		{ label: "Discover", to: "/discover" },
		{ label: "Grants", to: "/grants" },
		{ label: "My Projects", to: "/student/home" },
	],
	[AcademyRole.Sponsor]: [
		{ label: "Discover", to: "/discover" },
		{ label: "Deal-flow", to: "/sponsor/home" },
		{ label: "Grants", to: "/grants" },
	],
	[AcademyRole.Admin]: [
		{ label: "Review Queue", to: "/admin/dashboard" },
		{ label: "Discover", to: "/discover" },
	],
};

const ROLE_LABEL: Record<AcademyRole, string> = {
	[AcademyRole.Student]: "Student",
	[AcademyRole.Sponsor]: "Sponsor",
	[AcademyRole.Admin]: "Admin",
};

/** Mock notifications until the P3 notification model lands. Static → SSR-safe. */
const NOTIFICATIONS: {
	id: string;
	Icon: ComponentType<{ className?: string }>;
	tone: string;
	text: string;
	when: string;
}[] = [
	{
		id: "n1",
		Icon: Check,
		tone: "text-success",
		text: "AralBot was approved and is now live on the showcase.",
		when: "2m ago",
	},
	{
		id: "n2",
		Icon: Heart,
		tone: "text-action",
		text: "A sponsor showed interest in TindaLink.",
		when: "1h ago",
	},
	{
		id: "n3",
		Icon: AlertTriangle,
		tone: "text-danger",
		text: "CampusRide was returned — fix the demo link.",
		when: "2d ago",
	},
];

/** First letters of the first two words — "Jasmine Reyes" → "JR". */
function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "G"
	);
}

const popoverCls =
	"absolute top-[52px] right-0 z-50 origin-top-right animate-pop-in rounded-[18px] border border-[#e3ebfb] bg-[rgba(255,255,255,0.96)] p-2 shadow-pop backdrop-blur-md";
const menuItemCls =
	"flex w-full items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-left text-[14.5px] text-content transition-colors hover:bg-surface-sunken";

type OpenMenu = null | "profile" | "notifications";

export function RoleNav({ role }: { role?: AcademyRole }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState<OpenMenu>(null);

	// Close whichever popover is open on Escape.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(null);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	const activeRole = role ?? user?.academyRole ?? AcademyRole.Student;
	const name = user?.displayName || user?.iskolarUserId || "Guest";
	// School is placeholder until the profile API lands (STU-01).
	const subtitle = `${ROLE_LABEL[activeRole]} · UP Diliman`;

	const onLogout = async () => {
		setOpen(null);
		await logout();
		navigate({ to: "/login" });
	};

	return (
		<header className="sticky top-0 z-40 border-line border-b bg-[rgba(248,250,255,0.86)] backdrop-blur-md">
			<div className="container-page flex h-[66px] items-center justify-between">
				<Link to="/" className="flex items-center gap-[11px]">
					<img src="/logo-academy.png" alt="" className="h-[38px] w-auto" />
					<span className="text-base uppercase tracking-[0.16em] text-action">
						Academy
					</span>
				</Link>

				<nav className="hidden items-center gap-1.5 md:flex">
					{NAV[activeRole].map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="flex h-[38px] items-center rounded-[9px] px-[15px] font-sans text-[14.5px] transition-colors"
							activeProps={{ className: "bg-[#e3ebfb] text-action" }}
							inactiveProps={{
								className: "text-content-muted hover:bg-surface-tint",
							}}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					{open ? (
						<button
							type="button"
							aria-label="Close menu"
							className="fixed inset-0 z-40 cursor-default"
							onClick={() => setOpen(null)}
						/>
					) : null}

					{/* Notifications */}
					<div className="relative">
						<button
							type="button"
							title="Notifications"
							aria-expanded={open === "notifications"}
							onClick={() =>
								setOpen((o) => (o === "notifications" ? null : "notifications"))
							}
							className={`relative flex size-[42px] items-center justify-center rounded-[12px] border bg-surface-card text-action transition duration-150 hover:bg-surface-sunken active:scale-90 ${open === "notifications" ? "border-action" : "border-line"}`}
						>
							<Bell
								className={`size-[19px] transition-transform ${open === "notifications" ? "-rotate-12" : ""}`}
								strokeWidth={1.6}
								aria-hidden
							/>
							{NOTIFICATIONS.length > 0 ? (
								<span className="-top-1 -right-1 absolute flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#f7faff] bg-danger px-1 font-mono text-[10px] text-white">
									{NOTIFICATIONS.length}
								</span>
							) : null}
						</button>

						{open === "notifications" ? (
							<div className={`${popoverCls} w-[316px]`}>
								<div className="flex items-center justify-between px-3 pt-2 pb-2">
									<span className="text-[15px] text-content-heading">
										Notifications
									</span>
									<span className="font-mono text-[11px] text-action">
										{NOTIFICATIONS.length} new
									</span>
								</div>
								<div className="mx-1.5 mb-1 h-px bg-[#eef1fa]" />
								{NOTIFICATIONS.map((n) => (
									<div
										key={n.id}
										className="flex gap-[11px] rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface-sunken"
									>
										<span
											className={`flex w-[26px] flex-none justify-center ${n.tone}`}
										>
											<n.Icon className="size-[18px]" />
										</span>
										<div className="min-w-0">
											<div className="text-[13.5px] text-content-strong leading-snug">
												{n.text}
											</div>
											<div className="mt-0.5 font-mono text-[11px] text-content-ghost">
												{n.when}
											</div>
										</div>
									</div>
								))}
								<div className="mx-1.5 mt-1 mb-0.5 h-px bg-[#eef1fa]" />
								<button
									type="button"
									className="w-full rounded-[10px] px-3 py-2.5 text-center text-[13.5px] text-action transition-colors hover:bg-surface-sunken"
								>
									See all notifications →
								</button>
							</div>
						) : null}
					</div>

					{/* Account */}
					<div className="relative">
						<button
							type="button"
							aria-expanded={open === "profile"}
							onClick={() =>
								setOpen((o) => (o === "profile" ? null : "profile"))
							}
							className={`flex h-[42px] items-center gap-[9px] rounded-[12px] border bg-surface-card py-0 pr-2 pl-[15px] transition duration-150 hover:bg-surface-sunken active:scale-[0.97] ${open === "profile" ? "border-action" : "border-line"}`}
						>
							<span className="hidden text-[13.5px] text-content-heading sm:block">
								{name}
							</span>
							<span className="flex size-[30px] items-center justify-center rounded-[9px] bg-action text-[12.5px] text-white">
								{initialsOf(name)}
							</span>
						</button>

						{open === "profile" ? (
							<div className={`${popoverCls} w-[272px]`}>
								<div className="flex items-center gap-3 px-3 pt-2 pb-3.5">
									<span className="flex size-[46px] flex-none items-center justify-center rounded-[13px] bg-action text-[17px] text-white">
										{initialsOf(name)}
									</span>
									<div className="min-w-0">
										<div className="truncate text-[15.5px] text-content-heading">
											{name}
										</div>
										<div className="font-mono text-[12px] text-content-faint">
											{subtitle}
										</div>
									</div>
								</div>
								<div className="mx-1.5 mb-1.5 h-px bg-[#eef1fa]" />

								{/* Primary nav — shown here only when the header's center nav is hidden. */}
								<div className="md:hidden">
									{NAV[activeRole].map((item) => (
										<Link
											key={item.to}
											to={item.to}
											onClick={() => setOpen(null)}
											className={menuItemCls}
											activeProps={{ className: "text-action" }}
										>
											{item.label}
										</Link>
									))}
									<div className="mx-1.5 my-1.5 h-px bg-[#eef1fa]" />
								</div>

								<Link
									to="/student/profile"
									onClick={() => setOpen(null)}
									className={menuItemCls}
								>
									<User className="size-[18px] text-action" aria-hidden />
									Profile
								</Link>
								<button type="button" className={menuItemCls}>
									<Settings className="size-[18px] text-action" aria-hidden />
									Settings
								</button>
								<button
									type="button"
									className={menuItemCls}
									onClick={() => setOpen("notifications")}
								>
									<Bell className="size-[18px] text-action" aria-hidden />
									Notifications
									<span className="ml-auto rounded-full bg-action px-2 py-0.5 font-mono text-[11px] text-white">
										{NOTIFICATIONS.length}
									</span>
								</button>
								{activeRole === AcademyRole.Student ? (
									<button type="button" className={menuItemCls}>
										<Lock className="size-[18px] text-action" aria-hidden />
										My pitch vaults
									</button>
								) : null}

								<div className="mx-1.5 my-1.5 h-px bg-[#eef1fa]" />
								<button
									type="button"
									onClick={onLogout}
									className="flex w-full items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-left text-[14.5px] text-danger transition-colors hover:bg-danger-bg"
								>
									<LogOut className="size-[18px]" aria-hidden />
									Log out
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</header>
	);
}
