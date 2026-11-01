import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "#/components/ui/button";
import {
	useCreateAdminGrant,
	useStudentSearch,
} from "#/hooks/grant/useAdminGrants";
import {
	ADMIN_GRANT_CONFIG,
	type AdminGrantFormValues,
	adminGrantFormSchema,
	type StudentSearchHit,
} from "#/lib/grant/model";
import { toast } from "#/lib/toast";
import { validateThesisFile } from "#/utils/fileHandling";

const inputCls =
	"h-[46px] w-full rounded-[10px] border border-line bg-surface-card px-[14px] text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const textareaCls =
	"w-full resize-y rounded-[10px] border border-line bg-surface-card px-[14px] py-[11px] text-[15px] text-content-heading outline-none focus:border-action";
const fieldLabelCls = "mb-[7px] block text-[13px] text-content-muted";
const requiredLabelCls = `${fieldLabelCls} after:ml-1 after:text-danger after:content-['*']`;
const sectionLabelCls =
	"mb-4 font-mono text-[11.5px] uppercase tracking-[0.16em] text-action/60";

const EMPTY: AdminGrantFormValues = {
	studentId: "",
	title: "",
	description: "",
	fundingGoalRaw: "",
	adminNote: "",
};

/**
 * Admin "Add Grant": publish a grant for an existing student. Live on creation (no review
 * step). The proposal PDF is stored in the student's document vault server-side, and the
 * server writes the audit row. Client checks are UX only; the server re-validates every
 * field and checks the PDF's signature, not just its MIME type.
 *
 * The student picker shows name + school only. No contact details are fetched.
 */
export function AddGrantForm() {
	const ids = {
		student: useId(),
		title: useId(),
		description: useId(),
		goal: useId(),
		note: useId(),
	};
	const create = useCreateAdminGrant();
	const [student, setStudent] = useState<StudentSearchHit | null>(null);
	const [search, setSearch] = useState("");
	const [debounced, setDebounced] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	useEffect(() => {
		const t = window.setTimeout(() => setDebounced(search.trim()), 300);
		return () => window.clearTimeout(t);
	}, [search]);

	const hits = useStudentSearch(debounced);

	const { register, watch, setValue, handleSubmit, reset } =
		useForm<AdminGrantFormValues>({
			resolver: zodResolver(adminGrantFormSchema),
			defaultValues: EMPTY,
		});

	const title = watch("title");
	const description = watch("description");

	const pickStudent = (hit: StudentSearchHit | null) => {
		setStudent(hit);
		setValue("studentId", hit?.academyUserId ?? "");
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

	const onSubmit = handleSubmit(
		async (v) => {
			if (!file) {
				toast.error("Upload the title proposal (PDF).");
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
				reset(EMPTY);
				setStudent(null);
				setFile(null);
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
		<form onSubmit={onSubmit} className="flex flex-col gap-[18px]" noValidate>
			<div className="card-surface rounded-2xl p-[22px]">
				<div className={sectionLabelCls}>Student</div>
				{student ? (
					<div className="flex items-center gap-3 rounded-[11px] border border-line bg-surface-sunken px-4 py-3">
						<div className="min-w-0 flex-1">
							<div className="text-[15px] text-content-heading">
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
							autoComplete="off"
						/>
						{debounced.length >= 2 ? (
							<div className="mt-2 flex flex-col gap-1.5">
								{hits.isLoading ? (
									<p className="text-[13px] text-content-soft">Searching…</p>
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
											className="rounded-[10px] border border-line bg-surface-card px-3.5 py-2.5 text-left transition-colors hover:bg-surface-sunken"
										>
											<div className="text-[14.5px] text-content-heading">
												{hit.displayName}
											</div>
											<div className="font-mono text-[11.5px] text-content-faint">
												{hit.school || "School not set"}
											</div>
										</button>
									))
								)}
							</div>
						) : null}
					</div>
				)}
			</div>

			<div className="card-surface rounded-2xl p-[22px]">
				<div className={sectionLabelCls}>Grant details</div>
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
						<div className="mt-1 text-right font-mono text-[11px] text-content-faint">
							{title.length}/{ADMIN_GRANT_CONFIG.titleMax}
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
						<div className="mt-1 text-right font-mono text-[11px] text-content-faint">
							{description.length.toLocaleString("en-US")}/
							{ADMIN_GRANT_CONFIG.descriptionMax.toLocaleString("en-US")}
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
						<div className="mt-1 text-[12px] text-content-soft">
							Whole pesos, minimum ₱
							{ADMIN_GRANT_CONFIG.minFundingGoalPesos.toLocaleString("en-US")}.
						</div>
					</div>
				</div>
			</div>

			<div className="card-surface rounded-2xl p-[22px]">
				<div className={sectionLabelCls}>Required document</div>
				<div className="flex items-center gap-3 rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-4">
					<div className="flex-1">
						<div className="text-[14.5px] text-content-heading">
							{file?.name ?? "Title proposal (PDF)"}
							<span className="ml-1 text-danger" aria-hidden="true">
								*
							</span>
						</div>
						<div className="mt-0.5 font-mono text-[11.5px] text-content-faint">
							Stored in the student's document vault. PDF only, up to{" "}
							{ADMIN_GRANT_CONFIG.maxProposalMb} MB.
						</div>
						{fileError ? (
							<div className="mt-1 text-[11.5px] text-danger">{fileError}</div>
						) : null}
					</div>
					<label className="flex h-[38px] cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-4 text-[13px] text-action hover:bg-surface-sunken">
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
			</div>

			<div className="card-surface rounded-2xl p-[22px]">
				<div className={sectionLabelCls}>Internal</div>
				<label htmlFor={ids.note} className={fieldLabelCls}>
					Admin note (only admins see this)
				</label>
				<textarea
					id={ids.note}
					className={`${textareaCls} min-h-[84px]`}
					maxLength={ADMIN_GRANT_CONFIG.adminNoteMax}
					{...register("adminNote")}
				/>
			</div>

			<div className="flex items-center justify-between gap-4">
				<p className="text-[13px] text-content-soft">
					The grant goes live as soon as you publish. There is no review step.
				</p>
				<Button type="submit" disabled={create.isPending}>
					{create.isPending ? "Publishing…" : "Publish grant"}
				</Button>
			</div>
		</form>
	);
}
