import { useState } from "react";
import { Switch } from "#/components/ui/switch";
import { useMarketingPreference } from "#/hooks/account/useMarketingPreference";
import {
	type MarketingPreferenceEdit,
	marketingEmailSchema,
} from "#/lib/account/model";

export function MarketingPreferenceSettings({
	accountId,
}: {
	accountId: string;
}) {
	const { preference, update } = useMarketingPreference(accountId);
	const [draft, setDraft] = useState<MarketingPreferenceEdit | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const enabled =
		draft?.marketingOptIn ?? preference.data?.marketingOptIn ?? false;
	const email = draft?.marketingEmail ?? preference.data?.marketingEmail ?? "";
	const unavailable = preference.isPending || preference.isError;
	const dirty =
		!!preference.data &&
		(enabled !== preference.data.marketingOptIn ||
			(enabled && email.trim() !== (preference.data.marketingEmail ?? "")));

	return (
		<section
			aria-labelledby="marketing-preference-heading"
			className="mb-4 rounded-2xl border border-line bg-surface-card px-5 py-4"
		>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					if (unavailable || update.isPending || !dirty) {
						return;
					}
					const input: MarketingPreferenceEdit = { marketingOptIn: enabled };
					if (enabled) {
						const parsed = marketingEmailSchema.safeParse(email);
						if (!parsed.success) {
							setEmailError(
								parsed.error.issues[0]?.message ??
									"Enter a valid email address.",
							);
							return;
						}
						input.marketingEmail = parsed.data;
					}
					update.mutate(input, {
						onSuccess: () => {
							setDraft(null);
							setEmailError(null);
						},
					});
				}}
			>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h2
							id="marketing-preference-heading"
							className="text-[15px] text-content-heading"
						>
							iSkolar email updates
						</h2>
						<p
							id="marketing-preference-description"
							className="mt-1 text-sm leading-6 text-content-muted"
						>
							New scholarships, opportunities, and iSkolar updates. Change your
							preference anytime.
						</p>
					</div>
					<Switch
						aria-labelledby="marketing-preference-heading"
						aria-describedby="marketing-preference-description"
						checked={enabled}
						disabled={unavailable || update.isPending}
						onCheckedChange={(marketingOptIn) => {
							setDraft({ marketingOptIn, marketingEmail: email });
							setEmailError(null);
							update.reset();
						}}
						className="mt-1"
					/>
				</div>
				{preference.isPending ? (
					<p role="status" className="mt-3 text-xs text-content-muted">
						Loading your preference…
					</p>
				) : null}
				{preference.isError ? (
					<div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
						<p role="alert" className="text-danger">
							Couldn't load your email preference.
						</p>
						<button
							type="button"
							onClick={() => preference.refetch()}
							disabled={preference.isFetching}
							className="min-h-11 text-action underline underline-offset-4 disabled:opacity-50"
						>
							Try again
						</button>
					</div>
				) : null}
				{enabled && preference.data ? (
					<div className="mt-4 max-w-md">
						<label
							htmlFor="settings-marketing-email"
							className="mb-1.5 block text-sm text-content-body"
						>
							Email for updates
						</label>
						<input
							id="settings-marketing-email"
							name="marketingEmail"
							type="email"
							autoComplete="email"
							maxLength={254}
							value={email}
							onChange={(event) => {
								setDraft({
									marketingOptIn: enabled,
									marketingEmail: event.target.value,
								});
								setEmailError(null);
								update.reset();
							}}
							onInvalid={(event) => {
								event.preventDefault();
								setEmailError("Enter a valid email address.");
							}}
							disabled={unavailable || update.isPending}
							aria-invalid={!!emailError}
							aria-describedby={
								emailError ? "settings-marketing-email-error" : undefined
							}
							className="h-12 w-full rounded-xl border border-line bg-surface-card px-4 text-[15px] text-content-heading outline-none focus:border-action disabled:opacity-60"
						/>
						{emailError ? (
							<p
								id="settings-marketing-email-error"
								role="alert"
								className="mt-1.5 text-xs text-danger"
							>
								{emailError}
							</p>
						) : null}
					</div>
				) : null}
				{update.isError ? (
					<p role="alert" className="mt-3 text-sm text-danger">
						Couldn't save your email preference. Your changes haven't been
						confirmed.
					</p>
				) : null}
				{dirty || update.isPending || update.isError ? (
					<button
						type="submit"
						disabled={unavailable || update.isPending}
						className="btn btn-primary mt-4 min-h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
					>
						{update.isPending
							? "Saving…"
							: update.isError
								? "Try again"
								: "Save preference"}
					</button>
				) : null}
				<p
					role="status"
					aria-live="polite"
					className="text-xs text-content-muted"
				>
					{update.isSuccess && !dirty ? (
						<span className="mt-3 block">Email preference saved.</span>
					) : null}
				</p>
			</form>
		</section>
	);
}
