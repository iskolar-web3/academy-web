import { useState } from "react";
import { toast } from "sonner";
import { useSubscriptionMutations } from "#/hooks/subscription/useSubscriptionMutations";
import type { Subscription } from "#/lib/subscription/model";

/**
 * Seat add/remove — real CRUD against `subscription.seats`, no confirm-modal ceremony
 * (adjusting seats within an already-chosen plan isn't itself a distinct money action, see
 * `next-steps-lumen-p4-p5.md`). Seats are a plain billed quantity, not a real multi-user
 * team feature — there's no sponsor-org-member system in this app, so there's no "N of M
 * used" claim to make; the template's "3 of 5 used" is a static mockup number with nothing
 * real behind it.
 */
export function SeatManager({ subscription }: { subscription: Subscription }) {
	const [editing, setEditing] = useState(false);
	const [seats, setSeats] = useState(String(subscription.seats));
	const { setSeats: mutate } = useSubscriptionMutations();

	const onSave = () => {
		const n = Number(seats);
		if (!Number.isInteger(n) || n < 1) {
			toast.error("Enter a valid seat count.");
			return;
		}
		mutate.mutate(n, {
			onSuccess: () => {
				toast.success("Seats updated");
				setEditing(false);
			},
		});
	};

	return (
		<div className="mb-6 rounded-2xl border border-line bg-surface-card p-[22px]">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<div className="text-[16px] text-content-heading">Seats</div>
					<div className="mt-0.5 font-mono text-[13px] text-content-faint">
						{subscription.seats} seat{subscription.seats === 1 ? "" : "s"}{" "}
						billed
					</div>
				</div>
				{editing ? (
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							value={seats}
							onChange={(e) => setSeats(e.target.value)}
							className="h-10 w-20 rounded-[10px] border border-line bg-surface-card px-3 text-[14px] text-content-heading outline-none focus:border-action"
						/>
						<button
							type="button"
							disabled={mutate.isPending}
							onClick={onSave}
							className="btn btn-primary h-10 disabled:opacity-60"
						>
							Save
						</button>
						<button
							type="button"
							onClick={() => {
								setSeats(String(subscription.seats));
								setEditing(false);
							}}
							className="btn btn-secondary h-10"
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setEditing(true)}
						className="btn btn-secondary h-10"
					>
						Manage seats
					</button>
				)}
			</div>
		</div>
	);
}
