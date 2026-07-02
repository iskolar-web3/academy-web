import { FileCheck2, Upload } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ProjectFormValues } from "#/lib/project/model";
import { PROJECT_TYPES } from "#/lib/project/model";
import { validateThesisFile } from "#/utils/fileHandling";

const labelCls = "mb-1 block text-sm font-medium text-content-heading";
const errCls = "mt-1 text-xs text-danger";

const TYPE_LABELS: Record<(typeof PROJECT_TYPES)[number], string> = {
	idea: "Idea / prototype",
	thesis_capstone: "Thesis / capstone",
};

/**
 * Ownership self-declaration + conditional thesis-paper upload (STU-05). The picker
 * validates size/MIME; the real upload to the Lumen vault lands in P1 server, so only the
 * file name is stored here.
 */
export function OwnershipStep({
	form,
}: {
	form: UseFormReturn<ProjectFormValues>;
}) {
	const {
		register,
		watch,
		setValue,
		clearErrors,
		formState: { errors },
	} = form;
	const type = watch("type");
	const thesisPaperName = watch("thesisPaperName");
	const [fileError, setFileError] = useState<string | null>(null);

	const onPick = (file: File | undefined) => {
		if (!file) return;
		const error = validateThesisFile(file);
		if (error) {
			setFileError(error);
			return;
		}
		setFileError(null);
		clearErrors("thesisPaperName");
		setValue("thesisPaperName", file.name, { shouldValidate: false });
	};

	return (
		<div className="space-y-6">
			<fieldset>
				<span className={labelCls}>Project type</span>
				<div className="grid gap-3 sm:grid-cols-2">
					{PROJECT_TYPES.map((t) => (
						<label
							key={t}
							className="card-surface flex cursor-pointer items-center gap-3 p-4"
						>
							<input type="radio" value={t} {...register("type")} />
							<span className="text-content-heading">{TYPE_LABELS[t]}</span>
						</label>
					))}
				</div>
			</fieldset>

			<label className="flex items-start gap-3">
				<input
					type="checkbox"
					className="mt-1"
					{...register("ownershipDeclared")}
				/>
				<span className="text-sm text-content-body">
					I confirm this project is my/our own work and I have the right to
					publish it and its linked materials.
				</span>
			</label>
			{errors.ownershipDeclared ? (
				<p className={errCls}>{errors.ownershipDeclared.message}</p>
			) : null}

			{type === "thesis_capstone" ? (
				<div>
					<span className={labelCls}>Thesis / capstone paper (PDF)</span>
					<label className="card-surface flex cursor-pointer items-center gap-3 p-4 text-sm text-content-soft hover:border-action">
						{thesisPaperName ? (
							<>
								<FileCheck2 className="size-5 text-success" aria-hidden />
								<span className="text-content-heading">{thesisPaperName}</span>
								<span className="text-content-faint">— choose another</span>
							</>
						) : (
							<>
								<Upload className="size-5 text-action" aria-hidden />
								Select a PDF (max 15 MB)
							</>
						)}
						<input
							type="file"
							accept="application/pdf"
							className="hidden"
							onChange={(e) => onPick(e.target.files?.[0])}
						/>
					</label>
					{fileError ? <p className={errCls}>{fileError}</p> : null}
					{errors.thesisPaperName ? (
						<p className={errCls}>{errors.thesisPaperName.message}</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
