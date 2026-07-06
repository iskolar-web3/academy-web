import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "#/auth";
import { Switch } from "#/components/ui/switch";

/**
 * Settings (design-template SETTINGS PAGE) — a signed-in surface under `_app` (any role).
 * Go-live alerts toggle (Radix Switch, template geometry), digest/language rows,
 * account/privacy entries, and Log out. The account/privacy sub-pages aren't scoped yet
 * (inert); Log out uses the real auth flow.
 */
export const Route = createFileRoute("/_app/settings")({
	component: Settings,
});

const rowCls = "flex items-center justify-between px-5 py-4";
const linkRowCls =
	"flex w-full items-center justify-between px-5 py-4 text-left text-[15px] text-content-heading transition-colors hover:bg-surface-sunken";

function Settings() {
	const router = useRouter();
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [alerts, setAlerts] = useState(true);

	const onLogout = async () => {
		await logout();
		navigate({ to: "/login" });
	};

	return (
		<main className="mx-auto max-w-[860px]">
			<button
				type="button"
				onClick={() => router.history.back()}
				className="mb-[18px] text-[14.5px] text-action"
			>
				← Back
			</button>
			<h1 className="mb-[22px] text-[32px] text-action">Settings</h1>

			<div className="mb-4 overflow-hidden rounded-2xl border border-line bg-surface-card">
				<div className={`${rowCls} border-[#eef1fa] border-b`}>
					<div>
						<div className="text-[15px] text-content-heading">
							Go-live alerts
						</div>
						<div className="mt-0.5 font-mono text-[12px] text-content-faint">
							Notify me when watched work publishes
						</div>
					</div>
					<Switch checked={alerts} onCheckedChange={setAlerts} />
				</div>
				<div className={`${rowCls} border-[#eef1fa] border-b`}>
					<span className="text-[15px] text-content-heading">Email digest</span>
					<span className="font-mono text-[13px] text-action">Weekly</span>
				</div>
				<div className={rowCls}>
					<span className="text-[15px] text-content-heading">Language</span>
					<span className="font-mono text-[13px] text-action">English</span>
				</div>
			</div>

			<div className="mb-4 overflow-hidden rounded-2xl border border-line bg-surface-card">
				<button
					type="button"
					className={`${linkRowCls} border-[#eef1fa] border-b`}
				>
					<span>Account &amp; security</span>
					<span className="text-content-ghost">›</span>
				</button>
				<button type="button" className={linkRowCls}>
					<span>Privacy &amp; visibility</span>
					<span className="text-content-ghost">›</span>
				</button>
			</div>

			<button
				type="button"
				onClick={onLogout}
				className="h-12 rounded-xl border border-danger-bd bg-surface-card px-[22px] text-[15px] text-danger transition-colors hover:bg-danger-bg"
			>
				Log out
			</button>
		</main>
	);
}
