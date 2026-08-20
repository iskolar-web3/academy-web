import { toast } from "sonner";
import { useMyProfile } from "#/hooks/account/useProfile";
import {
	useExpressInterest,
	useMyInterests,
} from "#/hooks/interest/useInterest";
import { cn } from "#/lib/utils";

/**
 * One-tap sponsor interest (SPN-07) — the design-template PROJECT DETAIL treatment
 * exactly: a full-width action button, "I'm interested" → "✓ Interest sent"
 * (success fill/border once sent). Idempotent: the sent state comes from
 * `GET /interests/me`, and a re-tap does nothing. Gated on a minimally complete
 * sponsor profile (organization filled) — otherwise prompts to complete it.
 */
export function InterestButton({ projectId }: { projectId: string }) {
	const { data: profile } = useMyProfile();
	const { data: interests } = useMyInterests();
	const express = useExpressInterest();

	const sent = (interests ?? []).includes(projectId);

	const onClick = () => {
		if (sent || express.isPending) return;
		if (!profile?.org?.trim()) {
			toast.error(
				"Add your organization to your sponsor profile before expressing interest.",
			);
			return;
		}
		express.mutate(projectId, {
			onSuccess: () => toast.success("Interest sent"),
			onError: (err) => toast.error(err.message || "Something went wrong."),
		});
	};

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={express.isPending}
			aria-pressed={sent}
			className={cn(
				"mt-2.5 h-[46px] w-full rounded-[10px] text-[15px] transition-colors disabled:opacity-60",
				sent
					? "border border-success-bd bg-success-bg text-success"
					: "bg-action text-on-action hover:bg-action-hover",
			)}
		>
			{sent ? "✓ Interest sent" : "I'm interested"}
		</button>
	);
}
