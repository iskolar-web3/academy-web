import { useQuery } from "@tanstack/react-query";
import { notificationsQuery } from "#/lib/notification/api";

/** The caller's notification list + unread count (PLT-07). */
export function useNotifications() {
	const query = useQuery(notificationsQuery());
	const unread = (query.data ?? []).filter((n) => n.unread).length;
	return { ...query, unread };
}
