import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "#/components/ui/dialog";
import { useSubscriptionMutations } from "#/hooks/subscription/useSubscriptionMutations";
import type { PlanInfo } from "#/lib/subscription/model";

/**
 * Tier-subscribe simulated checkout (SPN-12) — the same pattern as the grant fund flow
 * (`GrantFundPanel`), but as a modal: click a tier, this confirm dialog opens (real
 * features/price), Authorize triggers a ~1.8s "Redirecting to PayMongo…" pause, then
 * `subscribeToTier()` (simulated internals, real DB row) resolves to success. Cancel or
 * close makes no change. Requested explicitly as a modal (not inline like the grant fund
 * flow) — same confirm-redirect-complete shape, one level up in a dialog instead of a
 * page rail.
 */
export function TierConfirmModal({
	plan,
	onClose,
}: {
	plan: PlanInfo;
	onClose: () => void;
}) {
	const [step, setStep] = useState<"confirm" | "redirecting" | "success">(
		"confirm",
	);
	const { subscribe } = useSubscriptionMutations();

	const onAuthorize = () => {
		setStep("redirecting");
		window.setTimeout(async () => {
			try {
				await subscribe.mutateAsync(plan.key);
				setStep("success");
			} catch (err) {
				setStep("confirm");
				toast.error(
					err instanceof Error ? err.message : "Something went wrong.",
				);
			}
		}, 1800);
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				aria-describedby={undefined}
				className="w-[420px] max-w-[calc(100vw-3rem)] p-7"
			>
				{step === "success" ? (
					<div className="pt-2 pb-1 text-center">
						<div className="mx-auto mb-3.5 flex size-14 items-center justify-center rounded-full bg-success-bg text-[26px] text-success">
							✓
						</div>
						<DialogTitle className="mb-2 text-[19px]">
							You're on {plan.name}
						</DialogTitle>
						<p className="mx-auto mb-[18px] max-w-[280px] text-[13.5px] leading-normal text-content-soft">
							Your plan change is recorded and captured securely through the
							platform.
						</p>
						<DialogClose asChild>
							<Button
								variant="secondary"
								size="lg"
								className="w-full rounded-xl"
							>
								Done
							</Button>
						</DialogClose>
					</div>
				) : step === "redirecting" ? (
					<div className="flex flex-col items-center gap-3 py-8 text-center">
						<DialogTitle className="sr-only">Redirecting</DialogTitle>
						<Loader2
							className="size-7 animate-spin text-action"
							aria-hidden
							strokeWidth={1.8}
						/>
						<p className="text-[14px] text-content-soft">
							Redirecting to PayMongo…
						</p>
					</div>
				) : (
					<>
						<DialogTitle className="mb-1 text-[19px]">
							Upgrade to {plan.name}
						</DialogTitle>
						<div className="mb-4 font-mono text-[13px] text-content-faint">
							{plan.price}
						</div>
						<div className="mb-5 flex flex-col gap-2.5">
							{plan.features.map((f) => (
								<div
									key={f}
									className="flex items-start gap-2 text-[13.5px] text-content-strong"
								>
									<span className="mt-0.5 text-success">✓</span>
									{f}
								</div>
							))}
						</div>
						<div className="flex items-center gap-2.5">
							<DialogClose asChild>
								<Button variant="secondary" size="lg" className="flex-1">
									Cancel
								</Button>
							</DialogClose>
							<Button size="lg" onClick={onAuthorize} className="flex-1">
								Authorize
							</Button>
						</div>
						<p className="mt-3 text-center font-mono text-[11.5px] leading-normal text-content-faint">
							Prototype — no real payment is taken.
						</p>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
