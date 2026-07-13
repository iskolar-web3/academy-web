import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { useGrantMutations } from "#/hooks/grant/useGrantMutations";
import type { GrantRequest } from "#/lib/grant/model";

/**
 * The sponsor "request to grant" flow — a 1:1 port of the design-template GRANT DETAIL +
 * FUND FLOW sticky rail's sponsor state (`grantReqOpen` → `grantReqSubmitted`). Reference-
 * pass correction: the template's form also asks for "Your name"/"Company / fund", but the
 * sponsor's identity is already known from their session/profile (same reasoning as SPN-07's
 * org gate) — re-typing it would just duplicate data we already have, so only Reason +
 * Amount are collected here.
 *
 * Simulated checkout (see `next-steps-lumen-p4-p5.md`): Authorize → a client-side
 * "Redirecting to PayMongo…" pause (~1.8s) → a **real** `POST /grants/:id/fund` writes a
 * real `grant_contribution` row server-side (`provider: 'simulated'`) → success. This is a
 * prototype of the real flow, not a placeholder — every contribution here is real,
 * inspectable state, just not backed by an actual PayMongo charge yet.
 */
export function GrantFundPanel({ grant }: { grant: GrantRequest }) {
	const [step, setStep] = useState<"idle" | "redirecting" | "success">("idle");
	const [reason, setReason] = useState("");
	const [amountRaw, setAmountRaw] = useState("");
	const { fund } = useGrantMutations();

	const onSubmit = () => {
		const amount = Number(amountRaw.replace(/[^0-9.]/g, "")) || 0;
		if (amount <= 0) {
			toast.error("Enter an amount to grant.");
			return;
		}
		setStep("redirecting");
		window.setTimeout(async () => {
			try {
				await fund.mutateAsync({ id: grant.id, amount, reason: reason.trim() });
				setStep("success");
			} catch (err) {
				setStep("idle");
				toast.error(
					err instanceof Error ? err.message : "Something went wrong.",
				);
			}
		}, 1800);
	};

	if (step === "success") {
		return (
			<div className="pt-2 pb-1 text-center">
				<div className="mx-auto mb-3.5 flex size-14 items-center justify-center rounded-full bg-success-bg text-[26px] text-success">
					✓
				</div>
				<div className="mb-2 text-[19px] text-content-heading">
					Request submitted
				</div>
				<p className="mx-auto mb-[18px] max-w-[280px] text-[13.5px] leading-normal text-content-soft">
					Your contribution to <b>{grant.title}</b> is recorded and captured
					securely through the platform, added to the running total. Find the
					receipt in your funded grants.
				</p>
				<Button
					asChild
					variant="secondary"
					size="lg"
					className="w-full rounded-xl"
				>
					<Link to="/grants">Back to grants</Link>
				</Button>
			</div>
		);
	}

	if (step === "redirecting") {
		return (
			<div className="flex flex-col items-center gap-3 py-8 text-center">
				<Loader2
					className="size-7 animate-spin text-action"
					aria-hidden
					strokeWidth={1.8}
				/>
				<p className="text-[14px] text-content-soft">
					Redirecting to PayMongo…
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-3.5 font-mono text-[11.5px] uppercase tracking-[0.18em] text-action/60">
				Request to grant
			</div>
			<div className="flex flex-col gap-[11px]">
				<textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Reason for interest"
					className="min-h-[78px] w-full resize-y rounded-[11px] border border-line bg-surface-card px-[14px] py-[11px] text-[14.5px] text-content-heading outline-none focus:border-action"
				/>
				<div className="relative">
					<span className="-translate-y-1/2 absolute top-1/2 left-[14px] text-[15px] text-content-ghost">
						₱
					</span>
					<input
						value={amountRaw}
						onChange={(e) => setAmountRaw(e.target.value)}
						placeholder="Amount to grant"
						className="h-[46px] w-full rounded-[11px] border border-line bg-surface-card py-0 pr-[14px] pl-[30px] text-[15px] text-content-heading outline-none focus:border-action"
					/>
				</div>
			</div>
			<Button
				size="lg"
				onClick={onSubmit}
				className="mt-4 h-12 w-full rounded-xl text-[15.5px]"
			>
				Submit request
			</Button>
			<p className="mt-[11px] text-center font-mono text-[12px] leading-normal text-content-faint">
				Prototype — no real payment is taken. You'll confirm before any payment
				is charged.
			</p>
		</div>
	);
}
