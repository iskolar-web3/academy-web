import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { useGrantMutations } from "#/hooks/grant/useGrantMutations";
import { formatPeso } from "#/lib/grant/helper";
import type { GrantRequest } from "#/lib/grant/model";

/**
 * The sponsor "request to grant" flow — a 1:1 port of the design-template GRANT DETAIL +
 * FUND FLOW sticky rail's sponsor state (`grantReqOpen` → `grantReqSubmitted`). Reference-
 * pass correction: the template's form also asks for "Your name"/"Company / fund", but the
 * sponsor's identity is already known from their session/profile (same reasoning as SPN-07's
 * org gate) — re-typing it would just duplicate data we already have, so only Reason +
 * Amount are collected here.
 *
 * Simulated checkout (see `next-steps-lumen-p4-p5.md`): Submit → a **mock PayMongo checkout
 * screen** (the `"checkout"` step below — order summary, a GCash/Card method toggle, a
 * "Pay" button; styled with its own header bar to read as a distinct gateway page, not a
 * plain confirm dialog) → Pay → a multi-stage processing pause (`PROCESSING_STAGES`) → a
 * **real** `POST /grants/:id/fund` writes a real `grant_contribution` row server-side
 * (`provider: 'simulated'`) → success. This is a prototype of the real flow, not a
 * placeholder — every contribution here is real, inspectable state, just not backed by an
 * actual PayMongo charge yet.
 */
const PROCESSING_STAGES = [
	"Verifying payment method…",
	"Processing payment…",
	"Finalizing your contribution…",
] as const;
const PROCESSING_STAGE_MS = 900;

type PaymentMethod = "gcash" | "card";

export function GrantFundPanel({ grant }: { grant: GrantRequest }) {
	const [step, setStep] = useState<
		"idle" | "checkout" | "processing" | "success"
	>("idle");
	const [method, setMethod] = useState<PaymentMethod>("gcash");
	const [stageIndex, setStageIndex] = useState(0);
	const [reason, setReason] = useState("");
	const [amountRaw, setAmountRaw] = useState("");
	const { fund } = useGrantMutations();

	const amount = Number(amountRaw.replace(/[^0-9.]/g, "")) || 0;

	const onSubmit = () => {
		if (amount <= 0) {
			toast.error("Enter an amount to grant.");
			return;
		}
		setStep("checkout");
	};

	const onPay = () => {
		setStep("processing");
		setStageIndex(0);
		for (let i = 1; i < PROCESSING_STAGES.length; i++) {
			window.setTimeout(() => setStageIndex(i), i * PROCESSING_STAGE_MS);
		}
		window.setTimeout(async () => {
			try {
				await fund.mutateAsync({
					id: grant.id,
					amount,
					reason: reason.trim(),
				});
				setStep("success");
			} catch (err) {
				setStep("checkout");
				toast.error(
					err instanceof Error ? err.message : "Something went wrong.",
				);
			}
		}, PROCESSING_STAGES.length * PROCESSING_STAGE_MS);
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

	if (step === "checkout") {
		return (
			<div className="-m-6 overflow-hidden rounded-[16px] bg-[#f4f5fb]">
				<div className="flex items-center gap-2 border-line border-b bg-white px-4 py-2.5">
					<span className="text-[12px] text-content-faint" aria-hidden>
						🔒
					</span>
					<span className="font-mono text-[11.5px] text-content-faint">
						checkout.paymongo.com
					</span>
					<button
						type="button"
						onClick={() => setStep("idle")}
						className="ml-auto text-[13px] text-content-faint hover:text-content-soft"
					>
						Cancel
					</button>
				</div>

				<div className="px-5 py-5">
					<div className="mb-4 flex items-center gap-1.5">
						<span className="size-2 rounded-full bg-[#0b5fff]" aria-hidden />
						<span className="text-[15px] text-content-heading">
							Pay<span className="text-[#0b5fff]">Mongo</span>
						</span>
						<span className="ml-1.5 text-[11.5px] text-content-faint">
							Secure Checkout
						</span>
					</div>

					<div className="mb-4 rounded-xl border border-line bg-white p-3.5">
						<div className="flex items-baseline justify-between">
							<span className="text-[13px] text-content-soft">
								Grant contribution
							</span>
							<span className="text-[19px] text-content-heading">
								<b>{formatPeso(amount)}</b>
							</span>
						</div>
						<div className="mt-1 text-[12.5px] text-content-faint">
							To {grant.title}
						</div>
						{reason.trim() ? (
							<div className="mt-1.5 text-[12.5px] leading-normal text-content-soft">
								“{reason.trim()}”
							</div>
						) : null}
					</div>

					<div className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-content-faint">
						Payment method
					</div>
					<div className="mb-4 flex gap-2">
						<button
							type="button"
							onClick={() => setMethod("gcash")}
							className={`flex-1 rounded-[10px] border px-3 py-2.5 text-[13.5px] transition-colors ${
								method === "gcash"
									? "border-[#0b5fff] bg-[#eaf1ff] text-content-heading"
									: "border-line bg-white text-content-soft hover:bg-surface-tint"
							}`}
						>
							GCash
						</button>
						<button
							type="button"
							onClick={() => setMethod("card")}
							className={`flex-1 rounded-[10px] border px-3 py-2.5 text-[13.5px] transition-colors ${
								method === "card"
									? "border-[#0b5fff] bg-[#eaf1ff] text-content-heading"
									: "border-line bg-white text-content-soft hover:bg-surface-tint"
							}`}
						>
							Card
						</button>
					</div>

					{method === "gcash" ? (
						<div className="mb-5 rounded-xl border border-dashed border-line bg-white p-3.5 text-[12.5px] leading-normal text-content-soft">
							You'll be asked to approve this payment in the GCash app.
						</div>
					) : (
						<div className="mb-5 flex flex-col gap-2">
							<input
								readOnly
								value="4242 4242 4242 4242"
								className="h-[42px] w-full rounded-[10px] border border-line bg-white px-3.5 text-[13.5px] text-content-faint"
							/>
							<div className="flex gap-2">
								<input
									readOnly
									value="12 / 28"
									className="h-[42px] w-1/2 rounded-[10px] border border-line bg-white px-3.5 text-[13.5px] text-content-faint"
								/>
								<input
									readOnly
									value="CVC"
									className="h-[42px] w-1/2 rounded-[10px] border border-line bg-white px-3.5 text-[13.5px] text-content-faint"
								/>
							</div>
						</div>
					)}

					<Button
						size="lg"
						onClick={onPay}
						className="h-12 w-full rounded-xl text-[15.5px]"
					>
						Pay {formatPeso(amount)}
					</Button>
					<p className="mt-3 text-center font-mono text-[11px] leading-normal text-content-faint">
						Prototype checkout — no real payment gateway is contacted.
					</p>
				</div>
			</div>
		);
	}

	if (step === "processing") {
		return (
			<div className="flex flex-col items-center gap-4 py-8 text-center">
				<Loader2
					className="size-7 animate-spin text-action"
					aria-hidden
					strokeWidth={1.8}
				/>
				<p className="text-[14px] text-content-soft">
					{PROCESSING_STAGES[stageIndex]}
				</p>
				<div className="flex items-center gap-1.5" aria-hidden>
					{PROCESSING_STAGES.map((stage, i) => (
						<span
							key={stage}
							className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
								i <= stageIndex ? "w-5 bg-action" : "w-1.5 bg-line"
							}`}
						/>
					))}
				</div>
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
				Prototype — no real payment is taken. You'll go through a mock PayMongo
				checkout before anything is recorded.
			</p>
		</div>
	);
}
