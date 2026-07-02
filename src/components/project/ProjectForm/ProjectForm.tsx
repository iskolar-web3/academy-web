import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MembersField } from "#/components/project/ProjectForm/MembersField";
import { MvpLinksField } from "#/components/project/ProjectForm/MvpLinksField";
import { OwnershipStep } from "#/components/project/ProjectForm/OwnershipStep";
import { useProjectMutations } from "#/hooks/project/useProjectMutations";
import { formToProjectInput, mvpGateIssues } from "#/lib/project/helper";
import {
	CATEGORIES,
	type ProjectFormValues,
	type ProjectStatus,
	projectFormSchema,
} from "#/lib/project/model";

const fieldCls =
	"w-full rounded-lg border border-line bg-surface-card px-3 py-2 text-sm text-content outline-none transition-colors focus:border-action";
const labelCls = "mb-1 block text-sm font-medium text-content-heading";
const errCls = "mt-1 text-xs text-danger";

const STEPS = ["Details", "MVP & ownership", "Team", "Review"] as const;

interface ProjectFormProps {
	mode: "create" | "edit";
	projectId?: string;
	existingStatus?: ProjectStatus;
	defaultValues: ProjectFormValues;
}

export function ProjectForm({
	mode,
	projectId,
	existingStatus,
	defaultValues,
}: ProjectFormProps) {
	const navigate = useNavigate();
	const { create, update, submit, resubmit } = useProjectMutations();
	const [step, setStep] = useState(0);

	const form = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues,
	});
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = form;

	const gateIssues = mvpGateIssues(watch());
	const canReReview = mode === "edit" && existingStatus === "published";

	const goToDashboard = () => navigate({ to: "/student/home" });
	const goToProject = (id: string) =>
		navigate({ to: "/student/projects/$projectId", params: { projectId: id } });

	const onSaveDraft = handleSubmit(async (values) => {
		const input = formToProjectInput(values);
		if (mode === "create") {
			await create.mutateAsync(input);
			goToDashboard();
		} else if (projectId) {
			await update.mutateAsync({ id: projectId, input });
			goToProject(projectId);
		}
	});

	const onSubmitProject = handleSubmit(async (values) => {
		if (mvpGateIssues(values).length > 0) {
			setStep(STEPS.length - 1);
			return;
		}
		const input = formToProjectInput(values);
		if (mode === "create") {
			const created = await create.mutateAsync(input);
			await submit.mutateAsync(created.id);
			goToProject(created.id);
			return;
		}
		if (projectId) {
			await update.mutateAsync({ id: projectId, input });
			// Draft/returned need an explicit transition; a published edit re-reviews itself.
			if (existingStatus === "draft" || existingStatus === "submitted") {
				await submit.mutateAsync(projectId);
			} else if (
				existingStatus === "returned" ||
				existingStatus === "withdrawn"
			) {
				await resubmit.mutateAsync(projectId);
			}
			goToProject(projectId);
		}
	});

	const isLast = step === STEPS.length - 1;
	const busy =
		create.isPending ||
		update.isPending ||
		submit.isPending ||
		resubmit.isPending;

	return (
		<form className="space-y-8">
			{/* Step indicator */}
			<ol className="flex flex-wrap gap-2">
				{STEPS.map((label, i) => (
					<li key={label}>
						<button
							type="button"
							onClick={() => setStep(i)}
							className={`chip ${i === step ? "chip--category" : "chip--tech"}`}
						>
							{i + 1}. {label}
						</button>
					</li>
				))}
			</ol>

			{canReReview ? (
				<div className="status-pill status-pill--warning w-full justify-start p-3 text-sm">
					<AlertTriangle className="size-4" aria-hidden />
					Editing the title, category, or an MVP link will send this project
					back to review.
				</div>
			) : null}

			{/* Step 1 — details */}
			{step === 0 ? (
				<div className="space-y-5">
					<div>
						<label htmlFor="title" className={labelCls}>
							Title
						</label>
						<input id="title" className={fieldCls} {...register("title")} />
						{errors.title ? (
							<p className={errCls}>{errors.title.message}</p>
						) : null}
					</div>
					<div>
						<label htmlFor="category" className={labelCls}>
							Category
						</label>
						<select
							id="category"
							className={fieldCls}
							{...register("category")}
						>
							<option value="">Select a category…</option>
							{CATEGORIES.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="pitch" className={labelCls}>
							Pitch <span className="text-content-faint">(one-liner)</span>
						</label>
						<textarea
							id="pitch"
							rows={2}
							className={fieldCls}
							{...register("pitch")}
						/>
					</div>
					<div>
						<label htmlFor="purpose" className={labelCls}>
							Purpose{" "}
							<span className="text-content-faint">(what it solves)</span>
						</label>
						<textarea
							id="purpose"
							rows={3}
							className={fieldCls}
							{...register("purpose")}
						/>
					</div>
					<div>
						<label htmlFor="techText" className={labelCls}>
							Tech <span className="text-content-faint">(comma-separated)</span>
						</label>
						<input
							id="techText"
							className={fieldCls}
							placeholder="React, FastAPI, PostgreSQL"
							{...register("techText")}
						/>
					</div>
				</div>
			) : null}

			{/* Step 2 — MVP + ownership */}
			{step === 1 ? (
				<div className="space-y-8">
					<MvpLinksField form={form} />
					<OwnershipStep form={form} />
				</div>
			) : null}

			{/* Step 3 — team */}
			{step === 2 ? <MembersField form={form} /> : null}

			{/* Step 4 — review */}
			{step === 3 ? (
				<div className="space-y-4">
					<h2 className="text-xl text-content-heading">Review & submit</h2>
					{gateIssues.length === 0 ? (
						<div className="status-pill status-pill--success p-3 text-sm">
							Everything checks out — ready to submit for review.
						</div>
					) : (
						<div className="card-surface p-4">
							<p className="mb-2 text-sm font-medium text-content-heading">
								Fix these before submitting:
							</p>
							<ul className="list-disc space-y-1 pl-5 text-sm text-content-body">
								{gateIssues.map((issue) => (
									<li key={issue.path}>{issue.message}</li>
								))}
							</ul>
							<p className="mt-3 text-xs text-content-soft">
								You can still save this as a draft.
							</p>
						</div>
					)}
				</div>
			) : null}

			{/* Footer */}
			<div className="flex items-center justify-between border-line border-t pt-6">
				<button
					type="button"
					className="btn btn-secondary"
					disabled={step === 0}
					onClick={() => setStep((s) => Math.max(0, s - 1))}
				>
					Back
				</button>

				<div className="flex items-center gap-3">
					<button
						type="button"
						className="btn btn-secondary"
						disabled={busy}
						onClick={onSaveDraft}
					>
						Save draft
					</button>
					{isLast ? (
						<button
							type="button"
							className="btn btn-primary disabled:opacity-50"
							disabled={busy || gateIssues.length > 0}
							onClick={onSubmitProject}
						>
							Submit for review
						</button>
					) : (
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
						>
							Next
						</button>
					)}
				</div>
			</div>
		</form>
	);
}
