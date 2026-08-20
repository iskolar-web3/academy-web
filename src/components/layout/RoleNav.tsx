import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CreditCard, Lock, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "#/auth";
import {
	NotificationItem,
	NotificationsEmpty,
} from "#/components/notification/NotificationItem";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useNotifications } from "#/hooks/notification/useNotifications";
import { AcademyRole } from "#/lib/auth/model";
import { cn } from "#/lib/utils";

/**
 * Signed-in top header — a 1:1 port of the design-template HEADER: logo, role-aware
 * center nav, a notification popover, and a user pill that opens the account dropdown.
 * Both popovers are Radix DropdownMenus (outside-click, Escape, keyboard nav, focus
 * return) kept under one controlled `open` state so the account menu's "Notifications"
 * entry can hand off to the notifications menu. `role` defaults to the live session
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

type OpenMenu = null | "profile" | "notifications";

export function RoleNav({ role }: { role?: AcademyRole }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = useState<OpenMenu>(null);
	const { data: notifData, unread } = useNotifications();
	// The dropdown shows the latest few (template scale); the page shows everything.
	const notifications = (notifData ?? []).slice(0, 4);

	const activeRole = role ?? user?.academyRole ?? AcademyRole.Student;
	const name = user?.displayName || user?.iskolarUserId || "Guest";
	const subtitle = ROLE_LABEL[activeRole];

	const onLogout = async () => {
		setOpen(null);
		await logout();
		navigate({ to: "/" });
	};

	return (
		<header className="sticky top-0 z-40 border-line border-b bg-[rgba(248,250,255,0.86)] backdrop-blur-md">
			<div className="container-page relative flex h-[66px] items-center justify-between">
				<Link to="/" className="flex items-center gap-[11px]">
					<img src="/logo-academy.png" alt="" className="h-[38px] w-auto" />
					<span className="text-base uppercase tracking-[0.16em] text-action">
						Academy
					</span>
				</Link>

				{/* Centered on the header itself, not just "between" the logo and the
				    account pill — those two sides are rarely the same width (a long
				    display name in the pill used to visibly drag this off-center). */}
				<nav className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 hidden items-center gap-1.5 md:flex">
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
					{/* Notifications */}
					<DropdownMenu
						open={open === "notifications"}
						onOpenChange={(o) => setOpen(o ? "notifications" : null)}
					>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								title="Notifications"
								className={cn(
									"relative flex size-[42px] items-center justify-center rounded-[12px] border bg-surface-card text-action transition duration-150 hover:bg-surface-sunken active:scale-90",
									open === "notifications" ? "border-action" : "border-line",
								)}
							>
								<Bell
									className={cn(
										"size-[19px] transition-transform",
										open === "notifications" && "-rotate-12",
									)}
									strokeWidth={1.6}
									aria-hidden
								/>
								{unread > 0 ? (
									<span className="-top-1 -right-1 absolute flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#f7faff] bg-danger px-1 font-mono text-[10px] text-white">
										{unread}
									</span>
								) : null}
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-[316px]">
							<div className="flex items-center justify-between px-3 pt-2 pb-2">
								<span className="text-[15px] text-content-heading">
									Notifications
								</span>
								<span className="font-mono text-[11px] text-action">
									{unread} new
								</span>
							</div>
							<DropdownMenuSeparator className="mb-1" />
							{notifications.length === 0 ? (
								<NotificationsEmpty />
							) : (
								notifications.map((n) => (
									<NotificationItem
										key={n.id}
										notification={n}
										compact
										onActivate={() => setOpen(null)}
									/>
								))
							)}
							<DropdownMenuSeparator className="mt-1 mb-0.5" />
							<DropdownMenuItem
								asChild
								className="justify-center text-[13.5px] text-action"
							>
								<Link to="/notifications">See all notifications →</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Account */}
					<DropdownMenu
						open={open === "profile"}
						onOpenChange={(o) => setOpen(o ? "profile" : null)}
					>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								title={name}
								className={cn(
									"flex size-[42px] flex-none items-center justify-center rounded-[12px] border bg-surface-card transition duration-150 hover:bg-surface-sunken active:scale-[0.97]",
									open === "profile" ? "border-action" : "border-line",
								)}
							>
								<span className="flex size-[30px] items-center justify-center rounded-[9px] bg-action text-[12.5px] text-white">
									{initialsOf(name)}
								</span>
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-[272px]">
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
							<DropdownMenuSeparator className="mb-1.5 mt-0" />

							{/* Primary nav — shown here only when the header's center nav is hidden. */}
							<div className="md:hidden">
								{NAV[activeRole].map((item) => (
									<DropdownMenuItem key={item.to} asChild>
										<Link
											to={item.to}
											activeProps={{ className: "text-action" }}
										>
											{item.label}
										</Link>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
							</div>

							<DropdownMenuItem asChild>
								<Link
									to="/u/$userId"
									params={{ userId: user?.academyUserId ?? "" }}
								>
									<User className="size-[18px] text-action" aria-hidden />
									Profile
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/settings">
									<Settings className="size-[18px] text-action" aria-hidden />
									Settings
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault();
									setOpen("notifications");
								}}
							>
								<Bell className="size-[18px] text-action" aria-hidden />
								Notifications
								{unread > 0 ? (
									<span className="ml-auto rounded-full bg-action px-2 py-0.5 font-mono text-[11px] text-white">
										{unread}
									</span>
								) : null}
							</DropdownMenuItem>
							{activeRole === AcademyRole.Student ? (
								<DropdownMenuItem asChild>
									<Link to="/student/vaults">
										<Lock className="size-[18px] text-action" aria-hidden />
										My pitch vaults
									</Link>
								</DropdownMenuItem>
							) : null}
							{activeRole === AcademyRole.Sponsor ? (
								<DropdownMenuItem asChild>
									<Link to="/sponsor/subscription">
										<CreditCard
											className="size-[18px] text-action"
											aria-hidden
										/>
										Subscription
									</Link>
								</DropdownMenuItem>
							) : null}

							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onSelect={onLogout}>
								<LogOut className="size-[18px]" aria-hidden />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
