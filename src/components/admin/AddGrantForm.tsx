import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Upload } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { type FieldPath, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { useSession } from "#/hooks/auth/useSession";
import {
	useCreateAdminGrant,
	useStudentSearch,
} from "#/hooks/grant/useAdminGrants";
import { formatPeso } from "#/lib/grant/helper";
import {
	ADMIN_GRANT_CONFIG,
	type AdminGrantFormValues,
	adminGrantFormSchema,
	type StudentSearchHit,
	studentSearchHitSchema,
} from "#/lib/grant/model";
import { toast } from "#/lib/toast";
import { cn } from "#/lib/utils";
import { validateThesisFile } from "#/utils/fileHandling";

const inputCls =
	"h-[46px] w-full rounded-[10px] border border-line bg-surface-card px-[14px] text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const textareaCls =
	"w-full resize-y rounded-[10px] border border-line bg-surface-card px-[14px] py-[11px] text-[15px] text-content-heading outline-none focus:border-action";
const fieldLabelCls = "mb-[7px] block text-[13px] text-content-muted";
const requiredLabelCls = `${fieldLabelCls} after:ml-1 after:text-danger after:content-['*']`;
const errorCls = "mt-1 text-[12px] text-danger";

const STEPS = ["Student", "Details", "Document", "Review"] as const;
const LAST_STEP = STEPS.length - 1;

// Fields validated before leaving each step. Step 2 (Document) checks the file instead.
const STEP_FIELDS: FieldPath<AdminGrantFormValues>[][] = [
	["studentId"],
	["title", "description", "fundingGoalRaw"],
	[],
	["adminNote"],
];

const EMPTY: AdminGrantFormValues = {
	studentId: "",
	title: "",
	description: "",
	fundingGoalRaw: "",
	adminNote: "",
};

// Draft autosave, per admin, like SubmitProjectModal's local draft. Browser-only and
// best-effort: a blocked or cleared storage just means no draft. The PDF is never saved
// (a File can't go into localStorage, and a proposal shouldn't sit in browser storage).
const DRAFT_PREFIX = "academy.admin-grant-draft";
// Loose on purpose: a draft is unfinished, so it is restored as-is (a half-typed goal like
// "12" must survive) and only validated when the admin moves on or publishes.
const draftSchema = z.object({
	values: z.object({
		studentId: z.string().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		fundingGoalRaw: z.string().optional(),
		adminNote: z.string().optional(),
	}),
	student: studentSearchHitSchema.nullable(),
	step: z.number().int().min(0).max(LAST_STEP),
	savedAt: z.string(),
});
type Draft = z.infer<typeof draftSchema>;

function readDraft(key: string): Draft | null {
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) {
			return null;
		}
		const parsed = draftSchema.safeParse(JSON.parse(raw));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

function writeDraft(key: string, draft: Draft): boolean {
	try {
		window.localStorage.setItem(key, JSON.stringify(draft));
		return true;
	} catch {
		return false;
	}
}

function clearDraft(key: string) {
	try {
		window.localStorage.removeItem(key);
	} catch {
		// Storage unavailable: nothing to clear.
	}
}

function initialsOf(name: string): string {
	const parts = name.split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}

/** Student photo, falling back to initials when there is none or it fails to load. */
function StudentAvatar({
	student,
	size,
}: {
	student: StudentSearchHit;
	size: "sm" | "md";
}) {
	const [broken, setBroken] = useState(false);
	const showImage = student.avatarUrl && !broken;

	return (
		<span
			className={cn(
				"inline-flex flex-none items-center justify-center overflow-hidden border border-info-bd bg-surface-tint text-action",
				size === "md"
					? "size-[44px] rounded-[12px] text-[15px]"
					: "size-[36px] rounded-[10px] text-[13px]",
			)}
		>
			{showImage ? (
				<img
					src={student.avatarUrl ?? undefined}
					alt=""
					className="size-full object-cover"
					onError={() => setBroken(true)}
				/>
			) : (
				initialsOf(student.displayName)
			)}
		</span>
	);
}

function formatSavedTime(iso: string): string {
	return new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Admin "Add Grant", one step per page (Student → Details → Document → Review), with a
 * progress bar and an autosaved draft like Google Forms. Publishing makes the grant live
 * at once; the server stores the PDF in the student's vault and writes the audit row.
 * Client checks are UX only; the server re-validates everything, including the PDF bytes.
 */
export function AddGrantForm() {
	const ids = {
		student: useId(),
		title: useId(),
		description: useId(),
		goal: useId(),
		note: useId(),
	};
	const { user } = useSession();
	const draftKey = user?.iskolarUserId
		? `${DRAFT_PREFIX}.${user.iskolarUserId}`
		: null;

	const create = useCreateAdminGrant();
	const [step, setStep] = useState(0);
	const [student, setStudent] = useState<StudentSearchHit | null>(null);
	const [search, setSearch] = useState("");
	const [debounced, setDebounced] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const [savedAt, setSavedAt] = useState<string | null>(null);
	const [restored, setRestored] = useState(false);
	// Saving only starts once any existing draft has been read, so the empty defaults
	// never overwrite it on first render.
	const [draftReady, setDraftReady] = useState(false);
	const topRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = window.setTimeout(() => setDebounced(search.trim()), 300);
		return () => window.clearTimeout(t);
	}, [search]);

	const hits = useStudentSearch(debounced);

	const { register, watch, setValue, handleSubmit, reset, trigger, formState } =
		useForm<AdminGrantFormValues>({
			resolver: zodResolver(adminGrantFormSchema),
			defaultValues: EMPTY,
		});
	const errors = formState.errors;
	const values = watch();

	// Restore the draft once the admin is known (in an effect, so SSR markup matches).
	useEffect(() => {
		if (!draftKey) {
			return;
		}
		const draft = readDraft(draftKey);
		if (draft) {
			reset({ ...EMPTY, ...draft.values });
			setStudent(draft.student);
			setStep(draft.step);
			setSavedAt(draft.savedAt);
			setRestored(true);
		}
		setDraftReady(true);
	}, [draftKey, reset]);

	// Autosave: 600ms after the last change to any field, the student, or the page.
	const valuesJson = JSON.stringify(values);
	useEffect(() => {
		if (!draftKey || !draftReady) {
			return;
		}
		const t = window.setTimeout(() => {
			const at = new Date().toISOString();
			if (
				writeDraft(draftKey, {
					values: JSON.parse(valuesJson),
					student,
					step,
					savedAt: at,
				})
			) {
				setSavedAt(at);
			}
		}, 600);
		return () => window.clearTimeout(t);
	}, [draftKey, draftReady, valuesJson, student, step]);

	const goTo = useCallback((next: number) => {
		setStep(next);
		topRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, []);

	const pickStudent = (hit: StudentSearchHit | null) => {
		setStudent(hit);
		setValue("studentId", hit?.academyUserId ?? "", {
			shouldValidate: hit !== null,
		});
		setSearch("");
		setDebounced("");
	};

	const onPickFile = (picked: File | undefined) => {
		if (!picked) {
			return;
		}
		const err = validateThesisFile(picked);
		if (err) {
			setFileError(err);
			setFile(null);
			return;
		}
		setFileError(null);
		setFile(picked);
	};

	const onNext = async () => {
		if (step === 2 && !file) {
			setFileError("Upload the title proposal (PDF).");
			return;
		}
		const ok = await trigger(STEP_FIELDS[step]);
		if (ok) {
			goTo(Math.min(LAST_STEP, step + 1));
		}
	};

	const discardDraft = () => {
		if (draftKey) {
			clearDraft(draftKey);
		}
		reset(EMPTY);
		setStudent(null);
		setFile(null);
		setFileError(null);
		setSavedAt(null);
		setRestored(false);
		goTo(0);
	};

	const publish = handleSubmit(
		async (v) => {
			if (!file) {
				setFileError("Upload the title proposal (PDF).");
				goTo(2);
				return;
			}
			try {
				await create.mutateAsync({
					input: {
						studentId: v.studentId,
						title: v.title.trim(),
						description: v.description.trim(),
						fundingGoal: Number(v.fundingGoalRaw.replace(/,/g, "")),
						adminNote: v.adminNote.trim(),
					},
					file,
				});
				toast.success("Grant published");
				discardDraft();
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong.",
				);
			}
		},
		(errs) => {
			// Jump back to the first page that has a problem.
			const bad = STEP_FIELDS.findIndex((fields) =>
				fields.some((f) => errs[f]),
			);
			if (bad >= 0) {
				goTo(bad);
			}
			toast.error(
				Object.values(errs)[0]?.message ?? "Fix the highlighted fields.",
			);
		},
	);

	const progressPct = Math.round(((step + 1) / STEPS.length) * 100);

	return (
		<form
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				if (step < LAST_STEP) {
					void onNext();
				} else {
					void publish();
				}
			}}
			className="card-surface rounded-2xl p-[22px]"
		>
			{/* Progress */}
			<div ref={topRef} className="scroll-mt-24">
				<div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
					<div className="text-[13px] text-content-heading">
						Step {step + 1} of {STEPS.length}:{" "}
						<span className="text-action">{STEPS[step]}</span>
					</div>
					<div className="font-mono text-[11.5px] text-content-faint">
						{savedAt
							? `Draft saved ${formatSavedTime(savedAt)}`
							: "Not saved yet"}
					</div>
				</div>
				<div
					className="h-[5px] overflow-hidden rounded-full bg-[#e3ebfb]"
					role="progressbar"
					aria-valuenow={progressPct}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Form progress"
				>
					<div
						className="h-full rounded-full bg-action transition-all"
						style={{ width: `${progressPct}%` }}
					/>
				</div>
				<ol className="mt-3 flex gap-1.5 sm:gap-3">
					{STEPS.map((label, i) => {
						const done = i < step;
						const active = i === step;
						return (
							<li key={label} className="flex-1">
								<button
									type="button"
									disabled={!done}
									onClick={() => goTo(i)}
									aria-current={active ? "step" : undefined}
									className={cn(
										"flex w-full items-center gap-2 rounded-[9px] px-1.5 py-1 text-left",
										done && "hover:bg-surface-sunken",
									)}
								>
									<span
										className={cn(
											"flex size-[22px] flex-none items-center justify-center rounded-full font-mono text-[11px]",
											done || active
												? "bg-action text-white"
												: "bg-[#e3ebfb] text-content-ghost",
										)}
									>
										{done ? <Check className="size-3" aria-hidden /> : i + 1}
									</span>
									<span
										className={cn(
											"hidden text-[12.5px] sm:block",
											active ? "text-content-heading" : "text-content-faint",
										)}
									>
										{label}
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</div>

			{restored ? (
				<div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[11px] border border-info-bd bg-info-bg/70 px-3.5 py-2.5 text-[13px] text-content-muted">
					<span>Restored your saved draft.</span>
					<button
						type="button"
						onClick={discardDraft}
						className="text-[13px] text-danger hover:underline"
					>
						Discard draft
					</button>
				</div>
			) : null}

			<div className="mt-5">
				{step === 0 ? (
					<div>
						<p className="mb-4 text-[14px] text-content-soft">
							Choose the student this grant is for.
						</p>
						{student ? (
							<div className="flex items-center gap-3 rounded-[11px] border border-line bg-surface-sunken px-4 py-3">
								<StudentAvatar student={student} size="md" />
								<div className="min-w-0 flex-1">
									<div className="truncate text-[15px] text-content-heading">
										{student.displayName}
									</div>
									<div className="font-mono text-[12px] text-content-faint">
										{student.school || "School not set"}
									</div>
								</div>
								<button
									type="button"
									onClick={() => pickStudent(null)}
									className="h-9 rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-action hover:bg-surface-sunken"
								>
									Change
								</button>
							</div>
						) : (
							<div>
								<label htmlFor={ids.student} className={requiredLabelCls}>
									Search student profiles
								</label>
								<input
									id={ids.student}
									className={inputCls}
									placeholder="Type a student's name"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) => {
										// Enter would submit (advance) with no student picked.
										if (e.key === "Enter") {
											e.preventDefault();
										}
									}}
									autoComplete="off"
								/>
								{debounced.length >= 2 ? (
									<div className="mt-2 flex flex-col gap-1.5">
										{hits.isLoading ? (
											<p className="text-[13px] text-content-soft">
												Searching…
											</p>
										) : hits.isError ? (
											<p className="text-[13px] text-danger">
												Couldn't search students.
											</p>
										) : (hits.data ?? []).length === 0 ? (
											<p className="text-[13px] text-content-soft">
												No matching students.
											</p>
										) : (
											(hits.data ?? []).map((hit) => (
												<button
													key={hit.academyUserId}
													type="button"
													onClick={() => pickStudent(hit)}
													className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-card px-3.5 py-2.5 text-left transition-colors hover:bg-surface-sunken"
												>
													<StudentAvatar student={hit} size="sm" />
													<div className="min-w-0 flex-1">
														<div className="truncate text-[14.5px] text-content-heading">
															{hit.displayName}
														</div>
														<div className="truncate font-mono text-[11.5px] text-content-faint">
															{hit.school || "School not set"}
														</div>
													</div>
												</button>
											))
										)}
									</div>
								) : null}
							</div>
						)}
						{errors.studentId ? (
							<div className={errorCls}>{errors.studentId.message}</div>
						) : null}
					</div>
				) : null}

				{step === 1 ? (
					<div className="flex flex-col gap-3.5">
						<div>
							<label htmlFor={ids.title} className={requiredLabelCls}>
								Thesis title
							</label>
							<input
								id={ids.title}
								className={inputCls}
								maxLength={ADMIN_GRANT_CONFIG.titleMax}
								{...register("title")}
							/>
							<div className="mt-1 flex justify-between gap-2">
								<span className={errorCls}>{errors.title?.message}</span>
								<span className="font-mono text-[11px] text-content-faint">
									{values.title.length}/{ADMIN_GRANT_CONFIG.titleMax}
								</span>
							</div>
						</div>
						<div>
							<label htmlFor={ids.description} className={requiredLabelCls}>
								Description
							</label>
							<textarea
								id={ids.description}
								className={`${textareaCls} min-h-[120px]`}
								maxLength={ADMIN_GRANT_CONFIG.descriptionMax}
								{...register("description")}
							/>
							<div className="mt-1 flex justify-between gap-2">
								<span className={errorCls}>{errors.description?.message}</span>
								<span className="font-mono text-[11px] text-content-faint">
									{values.description.length.toLocaleString("en-US")}/
									{ADMIN_GRANT_CONFIG.descriptionMax.toLocaleString("en-US")}
								</span>
							</div>
						</div>
						<div>
							<label htmlFor={ids.goal} className={requiredLabelCls}>
								Funding goal (PHP)
							</label>
							<div className="relative max-w-[260px]">
								<span className="pointer-events-none absolute top-1/2 left-[14px] -translate-y-1/2 text-[15px] text-content-faint">
									₱
								</span>
								<input
									id={ids.goal}
									className={`${inputCls} pl-[30px]`}
									inputMode="numeric"
									placeholder={ADMIN_GRANT_CONFIG.minFundingGoalPesos.toLocaleString(
										"en-US",
									)}
									{...register("fundingGoalRaw")}
								/>
							</div>
							{errors.fundingGoalRaw ? (
								<div className={errorCls}>{errors.fundingGoalRaw.message}</div>
							) : (
								<div className="mt-1 text-[12px] text-content-soft">
									Whole pesos, minimum ₱
									{ADMIN_GRANT_CONFIG.minFundingGoalPesos.toLocaleString(
										"en-US",
									)}
									.
								</div>
							)}
						</div>
					</div>
				) : null}

				{step === 2 ? (
					<div>
						<p className="mb-4 text-[14px] text-content-soft">
							Upload the signed title proposal. It is stored in the student's
							document vault.
						</p>
						<div className="flex items-center gap-3 rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-4">
							<div className="min-w-0 flex-1">
								<div className="truncate text-[14.5px] text-content-heading">
									{file?.name ?? "Title proposal (PDF)"}
									<span className="ml-1 text-danger" aria-hidden="true">
										*
									</span>
								</div>
								<div className="mt-0.5 font-mono text-[11.5px] text-content-faint">
									PDF only, up to {ADMIN_GRANT_CONFIG.maxProposalMb} MB.
								</div>
							</div>
							<label className="flex h-[38px] flex-none cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-4 text-[13px] text-action hover:bg-surface-sunken">
								<Upload className="mr-1.5 size-3.5" aria-hidden />
								{file ? "Replace" : "Upload"}
								<input
									type="file"
									accept="application/pdf"
									className="hidden"
									onChange={(e) => {
										onPickFile(e.target.files?.[0]);
										e.target.value = "";
									}}
								/>
							</label>
						</div>
						{fileError ? <div className={errorCls}>{fileError}</div> : null}
						{!file && restored ? (
							<div className="mt-2 text-[12.5px] text-content-soft">
								Files aren't kept in drafts. Upload the PDF again.
							</div>
						) : null}
					</div>
				) : null}

				{step === 3 ? (
					<div className="flex flex-col gap-4">
						<dl className="grid gap-x-4 gap-y-2.5 rounded-[11px] border border-line bg-surface-sunken p-4 text-[14px] sm:grid-cols-[140px_minmax(0,1fr)]">
							<dt className="text-content-faint">Student</dt>
							<dd className="text-content-heading">
								{student
									? `${student.displayName}${student.school ? `, ${student.school}` : ""}`
									: "Not selected"}
							</dd>
							<dt className="text-content-faint">Thesis title</dt>
							<dd className="break-words text-content-heading">
								{values.title || "Not set"}
							</dd>
							<dt className="text-content-faint">Description</dt>
							<dd className="line-clamp-4 whitespace-pre-line break-words text-content-heading">
								{values.description || "Not set"}
							</dd>
							<dt className="text-content-faint">Funding goal</dt>
							<dd className="text-content-heading">
								{/^\d+$/.test(values.fundingGoalRaw.replace(/,/g, ""))
									? formatPeso(Number(values.fundingGoalRaw.replace(/,/g, "")))
									: "Not set"}
							</dd>
							<dt className="text-content-faint">Title proposal</dt>
							<dd
								className={cn(
									"break-words",
									file ? "text-content-heading" : "text-danger",
								)}
							>
								{file?.name ?? "Missing, go back to Document"}
							</dd>
						</dl>
						<div>
							<label htmlFor={ids.note} className={fieldLabelCls}>
								Admin note (optional, only admins see this)
							</label>
							<textarea
								id={ids.note}
								className={`${textareaCls} min-h-[84px]`}
								maxLength={ADMIN_GRANT_CONFIG.adminNoteMax}
								{...register("adminNote")}
							/>
							{errors.adminNote ? (
								<div className={errorCls}>{errors.adminNote.message}</div>
							) : null}
						</div>
						<p className="text-[13px] text-content-soft">
							The grant goes live as soon as you publish. There is no review
							step.
						</p>
					</div>
				) : null}
			</div>

			<div className="mt-6 flex items-center justify-between gap-3 border-line border-t pt-4">
				<Button
					type="button"
					variant="secondary"
					onClick={() => goTo(Math.max(0, step - 1))}
					className={cn(step === 0 && "invisible")}
				>
					Back
				</Button>
				{step < LAST_STEP ? (
					<Button type="submit">Next</Button>
				) : (
					<Button type="submit" disabled={create.isPending}>
						{create.isPending ? "Publishing…" : "Publish grant"}
					</Button>
				)}
			</div>
		</form>
	);
}
