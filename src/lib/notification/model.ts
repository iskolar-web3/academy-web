import { z } from "zod";

/**
 * Notification domain (PLT-07) — types + wire schema. The server renders the display
 * strings (`title`, `body`, `ageLabel`) and the presentation `tone`; the client derives
 * the icon, tile color, and link target per `type` (see `NotificationItem`), mirroring the
 * design-template NOTIFICATIONS PAGE row model (icon · tone · bg · title · body · when ·
 * unread · go-target).
 *
 * P3 emits: `sponsor_interest` (STU-12), `review_decision` (P2 retro-wire), `member_invite`
 * (STU-08). Forward types from the template seed (`upvote_milestone`, `grant_funded` P4,
 * `vault_request` P5) are in the union so the renderer is ready when their phases land.
 */

export const NOTIFICATION_TYPES = [
	"sponsor_interest",
	"review_decision",
	"member_invite",
	"upvote_milestone",
	"grant_funded",
	"vault_request",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Presentation tone (template's per-row tone/bg pairs) — server-owned intent. */
export const NOTIFICATION_TONES = [
	"action",
	"highlight",
	"success",
	"danger",
] as const;
export type NotificationTone = (typeof NOTIFICATION_TONES)[number];

export const notificationSchema = z.object({
	id: z.string(),
	type: z.enum(NOTIFICATION_TYPES),
	tone: z.enum(NOTIFICATION_TONES),
	title: z.string(),
	body: z.string(),
	/** Server-computed relative label ("4h ago") — deterministic per response (SSR-safe). */
	ageLabel: z.string(),
	unread: z.boolean(),
	/** Entity references for link targets + invite responses. */
	projectId: z.string().nullable(),
	actorUserId: z.string().nullable(),
	actorName: z.string().nullable(),
	memberId: z.string().nullable(),
});
export type AcademyNotification = z.infer<typeof notificationSchema>;

export const notificationListSchema = z.array(notificationSchema);
