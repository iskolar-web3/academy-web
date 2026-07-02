import { Check, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { isValidUrl } from "#/lib/project/helper";
import type { ProjectFormValues } from "#/lib/project/model";

const fieldCls =
	"w-full rounded-lg border border-line bg-surface-card px-3 py-2 text-sm text-content outline-none transition-colors focus:border-action";
const labelCls = "mb-1 block text-sm font-medium text-content-heading";
const errCls = "mt-1 text-xs text-danger";

const LINKS = [
	{ key: "demo", label: "Live demo URL", placeholder: "https://your-demo.app" },
	{ key: "repo", label: "Repository URL", placeholder: "https://github.com/…" },
	{ key: "video", label: "Video URL", placeholder: "https://youtu.be/…" },
] as const;

/** The three-URL MVP gate (STU-04) with live validity feedback. */
export function MvpLinksField({
	form,
}: {
	form: UseFormReturn<ProjectFormValues>;
}) {
	const {
		register,
		watch,
		formState: { errors },
	} = form;
	const links = watch("links");

	return (
		<div className="space-y-5">
			<p className="text-sm text-content-soft">
				A published project must have all three working. You can leave them
				blank in a draft.
			</p>
			{LINKS.map(({ key, label, placeholder }) => {
				const value = links?.[key] ?? "";
				const valid = isValidUrl(value);
				return (
					<div key={key}>
						<label htmlFor={`links.${key}`} className={labelCls}>
							{label}
						</label>
						<div className="relative">
							<input
								id={`links.${key}`}
								className={fieldCls}
								placeholder={placeholder}
								{...register(`links.${key}`)}
							/>
							{value ? (
								<span className="-translate-y-1/2 absolute top-1/2 right-3">
									{valid ? (
										<Check className="size-4 text-success" aria-hidden />
									) : (
										<X className="size-4 text-danger" aria-hidden />
									)}
								</span>
							) : null}
						</div>
						{errors.links?.[key] ? (
							<p className={errCls}>{errors.links[key]?.message}</p>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
