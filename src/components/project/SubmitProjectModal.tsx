import { zodResolver } from "@hookform/resolvers/zod";
import { Github, MonitorPlay, Play, Upload, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "#/components/ui/dialog";
import { useSession } from "#/hooks/auth/useSession";
import { useProjectMutations } from "#/hooks/project/useProjectMutations";
import { thesisPaperUrl } from "#/lib/project/api";
import {
	emptyFormValues,
	formToProjectInput,
	isValidUrl,
	projectToFormValues,
	triggersReReview,
} from "#/lib/project/helper";
import {
	CATEGORIES,
	type Project,
	type ProjectFormValues,
	projectFormSchema,
} from "#/lib/project/model";
import { cn } from "#/lib/utils";
import { validateThesisFile } from "#/utils/fileHandling";

/**
 * Submit-a-project wizard — a 1:1 port of the design-template SUBMIT WIZARD MODAL: a 760px
 * modal with a 5-step numbered stepper (Details · MVP · Team · Ownership · Review). Opened
 * from the dashboard "+ Submit a project" action to create, and reused **prefilled** as the
 * edit surface (STU-11) when a `project` is passed. Reuses the project form schema, the MVP
 * gate, and `useProjectMutations`. Closes on ✕ / backdrop / Escape.
 */

const STEPS = ["Details", "MVP", "Team", "Ownership", "Review"] as const;

const inputCls =
	"h-[46px] w-full rounded-[10px] border border-line bg-surface-card px-[14px] text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const fieldLabelCls = "mb-[7px] text-[13px] text-content-muted";
const helperCls = "mb-4 text-[14px] leading-[1.5] text-content-soft";

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "S"
	);
}

export function SubmitProjectModal({
	onClose,
	project,
}: {
	onClose: () => void;
	/** When provided, the wizard opens prefilled as the edit surface (STU-11). */
	project?: Project;
}) {
	const editing = !!project;
	const { user } = useSession();
	const { create, update, submit, resubmit, uploadThesis } =
		useProjectMutations();
	const [step, setStep] = useState(0);
	// A returning editor already consented at creation.
	const [consented, setConsented] = useState(editing);
	const [fileError, setFileError] = useState<string | null>(null);
	// The raw picked file, held only until it's uploaded on submit — a project may not exist
	// yet (create path), so the upload can't fire until we have an id.
	const [thesisFile, setThesisFile] = useState<File | null>(null);

	const form = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: project ? projectToFormValues(project) : emptyFormValues(),
	});
	const { register, watch, setValue, control, getValues } = form;
	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const links = watch("links");
	const type = watch("type");
	const category = watch("category");
	const pitch = watch("pitch");
	const thesisPaperName = watch("thesisPaperName");
	const ownershipDeclared = watch("ownershipDeclared");
	const name = user?.displayName || user?.iskolarUserId || "You";

	const busy =
		create.isPending ||
		update.isPending ||
		submit.isPending ||
		resubmit.isPending ||
		uploadThesis.isPending;
	const isLast = step === STEPS.length - 1;

	// Editing a published project's title/category/MVP links sends it back to review (STU-11).
	const willReReview =
		!!project &&
		project.status === "published" &&
		triggersReReview(project, formToProjectInput(getValues()));

	// Submission gate — matches the fields the template wizard collects (a live demo and a
	// public repo are required; the demo video is optional; ownership + consent declared).
	const gateIssues: string[] = [];
	if (!category) gateIssues.push("Pick a category");
	if ((pitch ?? "").trim().length < 8) gateIssues.push("Add a one-line pitch");
	if (!isValidUrl(links?.demo ?? ""))
		gateIssues.push("Add a valid live demo URL");
	if (!isValidUrl(links?.repo ?? ""))
		gateIssues.push("Add a valid public repository URL");
	if (!ownershipDeclared) gateIssues.push("Confirm the ownership declaration");
	if (!consented) gateIssues.push("Consent to review & public showcase");
	if (type === "thesis_capstone" && !thesisPaperName)
		gateIssues.push("Upload the thesis / capstone paper");

	const onPickFile = (file: File | undefined) => {
		if (!file) return;
		const err = validateThesisFile(file);
		if (err) {
			setFileError(err);
			return;
		}
		setFileError(null);
		setValue("thesisPaperName", file.name);
		setThesisFile(file);
	};

	const onSubmitProject = async () => {
		if (gateIssues.length > 0) return;
		const input = formToProjectInput(getValues());
		// mutateAsync re-throws (unlike mutate), so this chain owns its catch: surface the
		// server's envelope message (422 gate / 403 owner / network) as a toast and keep
		// the modal open so nothing typed is lost.
		try {
			if (project) {
				await update.mutateAsync({ id: project.id, input });
				// A newly picked file uploads after the save so it lands on the record
				// that now has the latest ownership/type; re-review below re-checks it.
				if (thesisFile) {
					await uploadThesis.mutateAsync({ id: project.id, file: thesisFile });
				}
				// Draft/returned/withdrawn re-enter review explicitly; a published edit
				// re-reviews itself server-side when MVP-critical fields change.
				if (project.status === "draft" || project.status === "submitted") {
					await submit.mutateAsync(project.id);
				} else if (
					project.status === "returned" ||
					project.status === "withdrawn"
				) {
					await resubmit.mutateAsync(project.id);
				}
				toast.success(
					willReReview ? "Saved — sent back to review" : "Changes saved",
				);
				onClose();
				return;
			}
			const created = await create.mutateAsync(input);
			// The draft now has an id — the upload can only happen from here on.
			if (thesisFile) {
				await uploadThesis.mutateAsync({ id: created.id, file: thesisFile });
			}
			await submit.mutateAsync(created.id);
			toast.success("Project submitted for review");
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong.");
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				aria-describedby={undefined}
				className="isk-scroll flex max-h-[90vh] w-[760px] max-w-[calc(100vw-3rem)] flex-col overflow-auto"
			>
				{/* Header */}
				<div className="sticky top-0 z-[2] flex items-center justify-between rounded-t-[18px] border-[#eef1fa] border-b bg-surface-overlay px-7 py-[22px]">
					<DialogTitle>
						{editing ? "Edit project" : "Submit a project"}
					</DialogTitle>
					<DialogClose asChild>
						<button
							type="button"
							aria-label="Close"
							className="flex size-[34px] items-center justify-center rounded-[9px] border border-info-bd bg-surface-card text-content-muted transition-colors hover:bg-surface-sunken"
						>
							<X className="size-4" aria-hidden />
						</button>
					</DialogClose>
				</div>

				{/* Stepper */}
				<div className="flex items-center px-7 pt-5 pb-1.5">
					{STEPS.map((label, i) => {
						const done = i < step;
						const active = i === step;
						return (
							<div
								key={label}
								className="flex flex-1 items-center last:flex-none"
							>
								<div className="flex flex-none items-center gap-[9px]">
									<span
										className={`flex size-[26px] items-center justify-center rounded-full font-mono text-[12px] ${
											done || active
												? "bg-action text-white"
												: "bg-[#e3ebfb] text-content-ghost"
										}`}
									>
										{i + 1}
									</span>
									<span
										className={`hidden text-[13px] sm:block ${
											active ? "text-content-heading" : "text-content-faint"
										}`}
									>
										{label}
									</span>
								</div>
								{i < STEPS.length - 1 ? (
									<div className="flex flex-1 items-center gap-[7px] px-[11px]">
										<div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#e3ebfb]">
											<div
												className="h-full rounded-full bg-action transition-all"
												style={{ width: done ? "100%" : "0%" }}
											/>
										</div>
										<span className="text-[14px] text-[#c3d0f2]">›</span>
									</div>
								) : null}
							</div>
						);
					})}
				</div>

				{/* Body */}
				<div className="min-h-[236px] px-7 pt-[18px] pb-2">
					{step === 0 ? (
						<div className="flex flex-col gap-4">
							<div>
								<div className={fieldLabelCls}>Project title</div>
								<input
									className={inputCls}
									placeholder="e.g. AralBot"
									{...register("title")}
								/>
							</div>
							<div>
								<div className={fieldLabelCls}>One-line pitch</div>
								<input
									className={inputCls}
									placeholder="What does it do, in a sentence?"
									{...register("pitch")}
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
									<div className={fieldLabelCls}>Type</div>
									<select className={inputCls} {...register("type")}>
										<option value="idea">Idea / prototype</option>
										<option value="thesis_capstone">Thesis / capstone</option>
									</select>
								</div>
							</div>
						</div>
					) : null}

					{step === 1 ? (
						<div>
							<p className={helperCls}>
								Every published project must clear the MVP gate. Add at least a
								live demo and a public repo.
							</p>
							<div className="flex flex-col gap-3.5">
								{(
									[
										{
											key: "demo",
											Icon: MonitorPlay,
											ph: "Live demo URL (required)",
										},
										{
											key: "repo",
											Icon: Github,
											ph: "Public repository URL (required)",
										},
										{
											key: "video",
											Icon: Play,
											ph: "Demo video URL (optional)",
										},
									] as const
								).map(({ key, Icon, ph }) => {
									const value = links?.[key] ?? "";
									return (
										<div key={key} className="flex items-center gap-3">
											<span className="flex w-8 flex-none justify-center text-action">
												<Icon
													className="size-5"
													strokeWidth={1.6}
													aria-hidden
												/>
											</span>
											<input
												className={`h-11 flex-1 rounded-[10px] border bg-surface-card px-[14px] text-[14.5px] text-content-heading outline-none transition-colors focus:border-action ${
													value && !isValidUrl(value)
														? "border-danger"
														: "border-line"
												}`}
												placeholder={ph}
												{...register(`links.${key}`)}
											/>
										</div>
									);
								})}
							</div>
						</div>
					) : null}

					{step === 2 ? (
						<div>
							<p className={helperCls}>
								Add teammates and note who did what. Each member confirms their
								own contribution.
							</p>
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-3 rounded-[11px] border border-[#eef1fa] px-3.5 py-3">
									<span className="flex size-[38px] flex-none items-center justify-center rounded-[10px] bg-action text-white">
										{initialsOf(name)}
									</span>
									<div className="flex-1">
										<div className="text-[15px] text-content-heading">
											{name} (you)
										</div>
										<div className="text-[12.5px] text-content-faint">Lead</div>
									</div>
									<span className="rounded-md bg-success-bg px-2.5 py-1 text-[12px] text-success">
										Confirmed
									</span>
								</div>

								{fields.map((field, i) => (
									<div
										key={field.id}
										className="flex flex-col gap-2.5 rounded-[11px] border border-[#eef1fa] p-3.5 sm:flex-row sm:items-center"
									>
										<input
											className={`${inputCls} sm:flex-1`}
											placeholder="Name / iSkolar ID"
											{...register(`members.${i}.name`)}
										/>
										<input
											className={`${inputCls} sm:flex-1`}
											placeholder="Contribution"
											{...register(`members.${i}.contribution`)}
										/>
										<button
											type="button"
											onClick={() => {
												remove(i);
												if (fields.length <= 1) setValue("isTeam", false);
											}}
											aria-label="Remove member"
											className="flex size-9 flex-none items-center justify-center rounded-[9px] border border-info-bd text-content-muted hover:bg-surface-sunken"
										>
											<X className="size-4" aria-hidden />
										</button>
									</div>
								))}

								<button
									type="button"
									onClick={() => {
										append({ name: "", contribution: "", linked: true });
										setValue("isTeam", true);
									}}
									className="h-[46px] rounded-[10px] border border-[#c3d0f2] border-dashed bg-surface-sunken text-[14.5px] text-action transition-colors hover:bg-surface-tint"
								>
									+ Invite a teammate by iSkolar ID
								</button>
							</div>
						</div>
					) : null}

					{step === 3 ? (
						<div>
							<p className={helperCls}>
								Declare ownership and integrity. This is recorded with your
								submission.
							</p>
							<div className="flex flex-col gap-3">
								<label
									htmlFor="ownership-declared"
									className="flex cursor-pointer items-start gap-3 rounded-[11px] border border-[#eef1fa] p-3.5"
								>
									<Checkbox
										id="ownership-declared"
										className="mt-1"
										checked={ownershipDeclared}
										onCheckedChange={(v) =>
											setValue("ownershipDeclared", v === true)
										}
									/>
									<span className="text-[14px] leading-[1.5] text-content-strong">
										This is original student work; external code/assets are
										credited and licensed.
									</span>
								</label>
								<label
									htmlFor="consent-showcase"
									className="flex cursor-pointer items-start gap-3 rounded-[11px] border border-[#eef1fa] p-3.5"
								>
									<Checkbox
										id="consent-showcase"
										className="mt-1"
										checked={consented}
										onCheckedChange={(v) => setConsented(v === true)}
									/>
									<span className="text-[14px] leading-[1.5] text-content-strong">
										I consent to Academy review and to my name being shown on
										the public showcase.
									</span>
								</label>

								{type === "thesis_capstone" ? (
									<div className="flex items-center gap-[11px] rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-3.5">
										<Upload
											className="size-[18px] flex-none text-action"
											aria-hidden
										/>
										<div className="flex-1">
											<div className="text-[14px] text-content-heading">
												{thesisPaperName ?? "Thesis paper (PDF)"}
												{editing &&
												project.ownership.thesisPaperName &&
												!thesisFile ? (
													<a
														href={thesisPaperUrl(project.id)}
														target="_blank"
														rel="noreferrer"
														className="ml-2 text-[12.5px] text-action underline"
													>
														View
													</a>
												) : null}
											</div>
											<div className="mt-0.5 font-mono text-[11.5px] text-content-faint">
												Required for thesis / capstone, stored in the Lumen
												document vault
											</div>
											{fileError ? (
												<div className="mt-1 text-[11.5px] text-danger">
													{fileError}
												</div>
											) : null}
										</div>
										<label
											className={cn(
												"flex h-9 cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-action hover:bg-surface-sunken",
												uploadThesis.isPending &&
													"pointer-events-none opacity-60",
											)}
										>
											{uploadThesis.isPending
												? "Uploading…"
												: thesisPaperName
													? "Replace"
													: "Upload"}
											<input
												type="file"
												accept="application/pdf"
												className="hidden"
												disabled={uploadThesis.isPending}
												onChange={(e) => onPickFile(e.target.files?.[0])}
											/>
										</label>
									</div>
								) : null}
							</div>
						</div>
					) : null}

					{step === 4 ? (
						<div className="py-[18px] text-center">
							{gateIssues.length === 0 ? (
								<>
									<div className="mx-auto mb-4 text-[40px] text-action">↗</div>
									<div className="mb-2 text-[19px] text-content-heading">
										{editing ? "Save your changes" : "Ready to submit"}
									</div>
									<p className="mx-auto max-w-[440px] text-[14px] leading-[1.55] text-content-soft">
										{editing
											? willReReview
												? "You changed the title, category, or an MVP link — saving sends this published project back to the review queue."
												: "Your changes are saved without a new review."
											: "Your project goes to the Academy review queue. Reviewers check that the MVP runs and the purpose is clear, usually within 2 business days."}
									</p>
								</>
							) : (
								<div className="mx-auto max-w-[440px] text-left">
									<p className="mb-2 text-[15px] text-content-heading">
										Fix these before submitting:
									</p>
									<ul className="list-disc space-y-1 pl-5 text-[13.5px] text-content-body">
										{gateIssues.map((issue) => (
											<li key={issue}>{issue}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					) : null}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-7 pt-[18px] pb-6">
					<Button
						variant="secondary"
						size="lg"
						onClick={() => setStep((s) => Math.max(0, s - 1))}
						className={cn("rounded-[10px] px-5", step === 0 && "invisible")}
					>
						← Back
					</Button>
					{isLast ? (
						<Button
							size="lg"
							disabled={busy}
							onClick={onSubmitProject}
							className="rounded-[10px] px-[26px] text-[15px] shadow-none"
						>
							{busy ? "Saving…" : editing ? "Save changes" : "Submit project"}
						</Button>
					) : (
						<Button
							size="lg"
							onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
							className="rounded-[10px] px-[26px] text-[15px] shadow-none"
						>
							Continue →
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
