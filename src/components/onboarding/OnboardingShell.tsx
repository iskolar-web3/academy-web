import type { ReactNode } from "react";
import { useState } from "react";
import { Checkbox } from "#/components/ui/checkbox";

export function OnboardingShell({
	children,
	onSubmit,
	pending,
	error,
	onBack,
	subtitle,
}: {
	children: ReactNode;
	onSubmit: (marketingOptIn: boolean) => void;
	pending: boolean;
	error?: string;
	/** Shown above the heading for sponsor's 3-way branch only. */
	onBack?: () => void;
	subtitle?: string;
}) {
	const [marketingOptIn, setMarketingOptIn] = useState(false);

	return (
		<main className="mx-auto max-w-[560px]">
			{onBack ? (
				<button
					type="button"
					onClick={onBack}
					className="mb-4 text-[13px] text-action"
				>
					Change type
				</button>
			) : null}
			<div className="mb-8 text-center">
				<div className="mb-3.5 inline-flex items-center gap-[11px]">
					<span className="font-mono text-[11.5px] uppercase tracking-[0.24em] text-action/60">
						Almost there
					</span>
				</div>
				<h1 className="mb-2 text-[34px] text-content-heading">
					Tell us the basics
				</h1>
				<p className="text-[15.5px] leading-[1.55] text-content-muted">
					{subtitle ??
						"A couple of details so people can recognize you on Academy."}
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit(marketingOptIn);
				}}
				className="card-surface flex flex-col gap-4 rounded-2xl px-7 py-7"
			>
				{children}

				<label
					htmlFor="marketing-opt-in"
					className="flex min-h-11 w-full cursor-pointer items-start gap-2.5 py-1 text-left"
				>
					<Checkbox
						id="marketing-opt-in"
						name="marketingOptIn"
						checked={marketingOptIn}
						onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
						disabled={pending}
						aria-labelledby="marketing-opt-in-label"
						aria-describedby="marketing-opt-in-description"
						className="mt-1 size-4"
					/>
					<span className="min-w-0">
						<span
							id="marketing-opt-in-label"
							className="block text-sm leading-6 text-content-body"
						>
							Notify me about new scholarships, opportunities, and iSkolar
							updates.
						</span>
						<span
							id="marketing-opt-in-description"
							className="mt-0.5 block text-xs leading-5 text-content-muted"
						>
							Optional. You can change this anytime.
						</span>
					</span>
				</label>

				<button
					type="submit"
					disabled={pending}
					className="btn btn-primary mt-2 h-12 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{pending ? "Saving…" : "Continue"}
				</button>

				{error ? (
					<p className="text-center text-sm text-danger">
						Couldn't save: {error}
					</p>
				) : null}
			</form>
		</main>
	);
}
