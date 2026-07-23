import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { useMyProfile } from "#/hooks/account/useProfile";
import { useGrantMutations } from "#/hooks/grant/useGrantMutations";
import { emptyGrantFormValues, grantFormToInput } from "#/lib/grant/helper";
import { type GrantFormValues, grantFormSchema } from "#/lib/grant/model";
import { CATEGORIES } from "#/lib/project/model";
import { validateThesisFile } from "#/utils/fileHandling";

const inputCls =
	"h-[46px] w-full rounded-[10px] border border-line bg-surface-card px-[14px] text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const fieldLabelCls = "mb-[7px] text-[13px] text-content-muted";

/**
 * "Request a grant" — a 1:1 port of the design-template CREATE GRANT REQUEST: one page
 * (no draft, no multi-step wizard — the template's own single "Publish grant request"
 * button), two sections (Details, Required document), then publish.
 *
 * Reference-pass corrections: **Category** is a free-text placeholder in the static
 * template ("CleanTech") but reuses the fixed `CATEGORIES` list per the plan's settled
 * decision. **School** is read-only, prefilled from the student's own profile (not
 * re-typed). The proposal PDF and the create call are **one** multipart request
 * (`createGrantRequest`) — there's no separate upload step the user sees, matching the
 * template's single button even though grants have no draft state to attach a file to
 * first (unlike the project submit flow).
 */
export function GrantForm() {
	const navigate = useNavigate();
	const { data: profile } = useMyProfile();
	const { create } = useGrantMutations();
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	const { register, watch, setValue, handleSubmit } = useForm<GrantFormValues>({
		resolver: zodResolver(grantFormSchema),
		defaultValues: emptyGrantFormValues(),
	});

	const proposalName = watch("proposalName");
	const ownershipDeclared = watch("ownershipDeclared");

	const onPickFile = (picked: File | undefined) => {
		if (!picked) return;
		const err = validateThesisFile(picked);
		if (err) {
			setFileError(err);
			return;
		}
		setFileError(null);
		setValue("proposalName", picked.name);
		setFile(picked);
	};

	// Routed through RHF's handleSubmit so grantFormSchema's length limits (title,
	// purpose, techText, teamNote) actually run — they were previously declared via
	// the resolver but never invoked, since this used to read getValues() directly.
	const onPublish = handleSubmit(
		async (v) => {
			const input = grantFormToInput(v);
			// The schema allows a blank category/purpose (matches the lax-draft
			// pattern elsewhere) — grants have no draft state, so these are still
			// required at publish time, same as before.
			if (!input.title || !input.category || !input.purpose) {
				toast.error("Fill in the grant details before publishing.");
				return;
			}
			// `targetRaw` is a free-text string ("abc" passes a bare non-empty check) —
			// validate the parsed number instead, since grants have no draft state to
			// silently coerce a bad amount to 0 in.
			if (input.target <= 0) {
				toast.error("Enter a valid target amount.");
				return;
			}
			if (!ownershipDeclared) {
				toast.error("Confirm the ownership declaration.");
				return;
			}
			if (!file) {
				toast.error("Upload the scanned title proposal (PDF).");
				return;
			}
			try {
				const created = await create.mutateAsync({
					input,
					file,
				});
				toast.success("Grant request published");
				navigate({ to: "/grants/$grantId", params: { grantId: created.id } });
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong.",
				);
			}
		},
		(errors) => {
			const firstMessage = Object.values(errors)[0]?.message;
			toast.error(firstMessage ?? "Fix the highlighted fields.");
		},
	);

	return (
		<div className="flex flex-col gap-[18px]">
			<div className="card-surface rounded-2xl p-[22px]">
				<div className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60">
					Details
				</div>
				<div className="flex flex-col gap-3.5">
					<div>
						<div className={fieldLabelCls}>Thesis title</div>
						<input
							className={inputCls}
							placeholder="e.g. Solar-powered water purifier for coastal towns"
							{...register("title")}
						/>
					</div>
					<div className="flex gap-3.5">
						<div className="flex-1">
							<div className={fieldLabelCls}>Category</div>
							<select className={inputCls} {...register("category")}>
								<option value="">Select…</option>
								{CATEGORIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>
						<div className="flex-1">
							<div className={fieldLabelCls}>School</div>
							<input
								className={`${inputCls} text-content-soft`}
								value={profile?.org || ""}
								readOnly
							/>
						</div>
					</div>
					<div>
						<div className={fieldLabelCls}>Tech stack</div>
						<input
							className={inputCls}
							placeholder="Hardware, Solar, Embedded"
							{...register("techText")}
						/>
					</div>
					<div>
						<div className={fieldLabelCls}>What the funds are for</div>
						<textarea
							className="min-h-[84px] w-full resize-y rounded-[10px] border border-line bg-surface-card px-[14px] py-[11px] text-[15px] text-content-heading outline-none focus:border-action"
							placeholder="Research, equipment, fieldwork..."
							{...register("purpose")}
						/>
					</div>
					<div className="flex gap-3.5">
						<div className="flex-1">
							<div className={fieldLabelCls}>Target amount</div>
							<div className="relative">
								<span className="-translate-y-1/2 absolute top-1/2 left-[14px] text-[15px] text-content-ghost">
									₱
								</span>
								<input
									className={`${inputCls} pl-[30px]`}
									placeholder="180,000"
									{...register("targetRaw")}
								/>
							</div>
						</div>
						<div className="flex-1">
							<div className={fieldLabelCls}>Individual or team</div>
							<input
								className={inputCls}
								placeholder="Team"
								{...register("teamNote")}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="card-surface rounded-2xl p-[22px]">
				<div className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60">
					Required document
				</div>
				<div className="flex items-center gap-3 rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-4">
					<span className="flex w-6 flex-none items-center justify-center text-[18px] text-action">
						▤
					</span>
					<div className="flex-1">
						<div className="text-[14.5px] text-content-heading">
							{proposalName || "Scanned accepted title proposal (PDF)"}
						</div>
						<div className="mt-0.5 font-mono text-[11.5px] text-content-faint">
							Signed by your professors, stored in the Lumen document vault
						</div>
						{fileError ? (
							<div className="mt-1 text-[11.5px] text-danger">{fileError}</div>
						) : null}
					</div>
					<label className="flex h-[38px] cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-4 text-[13px] text-action hover:bg-surface-sunken">
						<Upload className="mr-1.5 size-3.5" aria-hidden />
						{proposalName ? "Replace" : "Upload"}
						<input
							type="file"
							accept="application/pdf"
							className="hidden"
							onChange={(e) => onPickFile(e.target.files?.[0])}
						/>
					</label>
				</div>
				<label
					htmlFor="grant-ownership-declared"
					className="mt-3.5 flex cursor-pointer items-start gap-3"
				>
					<Checkbox
						id="grant-ownership-declared"
						className="mt-0.5"
						checked={ownershipDeclared}
						onCheckedChange={(v) => setValue("ownershipDeclared", v === true)}
					/>
					<span className="text-[14px] leading-normal text-content-strong">
						I declare I hold the copyright to this work; external assets are
						credited and licensed.
					</span>
				</label>
			</div>

			<Button
				size="lg"
				disabled={create.isPending}
				onClick={onPublish}
				className="h-[50px] rounded-xl text-[16px] shadow-none"
			>
				{create.isPending ? "Publishing…" : "Publish grant request"}
			</Button>
			<p className="text-center font-mono text-[12px] text-content-faint">
				No review gate. Sponsors can fund it as soon as it's live.
			</p>
		</div>
	);
}
