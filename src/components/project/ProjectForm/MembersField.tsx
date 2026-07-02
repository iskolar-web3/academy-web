import { Plus, Trash2 } from "lucide-react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import type { ProjectFormValues } from "#/lib/project/model";

const fieldCls =
	"w-full rounded-lg border border-line bg-surface-card px-3 py-2 text-sm text-content outline-none transition-colors focus:border-action";
const labelCls = "mb-1 block text-sm font-medium text-content-heading";

/**
 * Individual/team toggle + credited members with contributions (STU-06/07). Linked
 * members show a "consent pending" note — invite accept/decline (STU-08) lands with the
 * notification model in P3.
 */
export function MembersField({
	form,
}: {
	form: UseFormReturn<ProjectFormValues>;
}) {
	const { register, control, watch } = form;
	const isTeam = watch("isTeam");
	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	return (
		<div className="space-y-5">
			<label className="flex items-center gap-3">
				<input type="checkbox" {...register("isTeam")} />
				<span className="text-content-heading">This is a team project</span>
			</label>

			{isTeam ? (
				<div className="space-y-4">
					{fields.length === 0 ? (
						<p className="text-sm text-content-soft">
							Add the teammates who worked on this. They're credited only after
							they accept.
						</p>
					) : null}

					{fields.map((field, i) => {
						const linked = watch(`members.${i}.linked`);
						return (
							<div key={field.id} className="card-surface p-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label htmlFor={`members.${i}.name`} className={labelCls}>
											Name
										</label>
										<input
											id={`members.${i}.name`}
											className={fieldCls}
											{...register(`members.${i}.name`)}
										/>
									</div>
									<div>
										<label
											htmlFor={`members.${i}.contribution`}
											className={labelCls}
										>
											Contribution
										</label>
										<input
											id={`members.${i}.contribution`}
											className={fieldCls}
											placeholder="e.g. Backend, ML model"
											{...register(`members.${i}.contribution`)}
										/>
									</div>
								</div>

								<div className="mt-3 flex items-center justify-between">
									<label className="flex items-center gap-2 text-sm text-content-body">
										<input
											type="checkbox"
											{...register(`members.${i}.linked`)}
										/>
										Linked iSkolar user
										{linked ? (
											<span className="status-pill status-pill--warning">
												Consent pending
											</span>
										) : (
											<span className="status-pill status-pill--neutral">
												Credit only
											</span>
										)}
									</label>
									<button
										type="button"
										onClick={() => remove(i)}
										className="inline-flex items-center gap-1 text-sm text-danger"
									>
										<Trash2 className="size-4" aria-hidden /> Remove
									</button>
								</div>
							</div>
						);
					})}

					<button
						type="button"
						onClick={() =>
							append({ name: "", contribution: "", linked: false })
						}
						className="btn btn-secondary"
					>
						<Plus className="size-4" aria-hidden /> Add member
					</button>
				</div>
			) : null}
		</div>
	);
}
