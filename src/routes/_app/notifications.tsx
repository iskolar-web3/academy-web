import { createFileRoute } from "@tanstack/react-router";
import {
	NotificationItem,
	NotificationsEmpty,
} from "#/components/notification/NotificationItem";
import { Button } from "#/components/ui/button";
import { useNotificationMutations } from "#/hooks/notification/useNotificationMutations";
import { useNotifications } from "#/hooks/notification/useNotifications";

/**
 * Notifications page (PLT-07) — a 1:1 port of the design-template NOTIFICATIONS PAGE:
 * an 860px column, "Notifications" + unread count header beside a "Mark all read" action,
 * and one bordered card listing every notification (unread rows tinted, each linking to
 * its entity). Any signed-in role; reached from the header bell's "See all notifications".
 */
export const Route = createFileRoute("/_app/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	const { data, isLoading, isError, unread } = useNotifications();
	const { read, readAll } = useNotificationMutations();
	const notifications = data ?? [];

	return (
		<main className="mx-auto max-w-[860px]">
			<div className="mb-[22px] flex items-center justify-between">
				<div>
					<h1 className="text-[30px] text-action">Notifications</h1>
					<div className="mt-1 font-mono text-[13px] text-content-faint">
						{unread} unread
					</div>
				</div>
				<Button
					variant="secondary"
					size="sm"
					disabled={readAll.isPending || unread === 0}
					onClick={() => readAll.mutate()}
					className="h-10 rounded-[11px] px-4 text-[13.5px] text-action"
				>
					Mark all read
				</Button>
			</div>

			<div className="overflow-hidden rounded-2xl border border-line bg-surface-card">
				{isLoading ? (
					<NotificationsEmpty>Loading notifications…</NotificationsEmpty>
				) : isError ? (
					<NotificationsEmpty>
						Couldn’t load notifications. Try again.
					</NotificationsEmpty>
				) : notifications.length === 0 ? (
					<NotificationsEmpty />
				) : (
					notifications.map((n) => (
						<NotificationItem
							key={n.id}
							notification={n}
							onActivate={() => {
								if (n.unread) read.mutate(n.id);
							}}
						/>
					))
				)}
			</div>
		</main>
	);
}
