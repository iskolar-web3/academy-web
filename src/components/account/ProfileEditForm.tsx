import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
	type SponsorProfileEdit,
	type StudentProfileEdit,
	sponsorProfileEditSchema,
	studentProfileEditSchema,
} from "#/lib/account/model";

/**
 * Own-profile edit form (STU-01 / SPN-01), student + sponsor variants.
 *
 * The layout + validation are real; the submit is a MOCK until `academy-server` lands.
 * To wire it: import `useUpdateStudentProfile` / `useUpdateSponsorProfile` from
 * `hooks/account/useUpdateProfile` and call `.mutate(values)` in `onSubmit` (see TODO).
 */

const fieldCls =
	"w-full rounded-lg border border-line bg-surface-card px-3 py-2 text-sm text-content outline-none transition-colors focus:border-action";
const labelCls = "mb-1 block text-sm font-medium text-content-heading";
const errCls = "mt-1 text-xs text-danger";

function SavedNote() {
	return (
		<p className="status-pill status-pill--info">
			Saved locally — profile API is wired in P0 (server).
		</p>
	);
}

function StudentForm() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<StudentProfileEdit>({
		resolver: zodResolver(studentProfileEditSchema),
		defaultValues: {
			displayName: "",
			school: "",
			program: "",
			specialty: "",
			bio: "",
			skills: [],
			links: { github: "", website: "", linkedin: "" },
		},
	});
	const [saved, setSaved] = useState(false);

	const onSubmit = (values: StudentProfileEdit) => {
		// TODO(P0): useUpdateStudentProfile().mutate(values)
		console.log("student profile (mock submit)", values);
		setSaved(true);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<div>
				<label htmlFor="displayName" className={labelCls}>
					Display name
				</label>
				<input
					id="displayName"
					className={fieldCls}
					{...register("displayName")}
				/>
				{errors.displayName ? (
					<p className={errCls}>{errors.displayName.message}</p>
				) : null}
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<label htmlFor="school" className={labelCls}>
						School
					</label>
					<input id="school" className={fieldCls} {...register("school")} />
					{errors.school ? (
						<p className={errCls}>{errors.school.message}</p>
					) : null}
				</div>
				<div>
					<label htmlFor="program" className={labelCls}>
						Program
					</label>
					<input id="program" className={fieldCls} {...register("program")} />
				</div>
			</div>

			<div>
				<label htmlFor="specialty" className={labelCls}>
					Specialty
				</label>
				<input id="specialty" className={fieldCls} {...register("specialty")} />
			</div>

			<div>
				<label htmlFor="skills" className={labelCls}>
					Skills <span className="text-content-faint">(comma-separated)</span>
				</label>
				<input
					id="skills"
					className={fieldCls}
					placeholder="React, Machine Learning, UX"
					onChange={(e) =>
						setValue(
							"skills",
							e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						)
					}
				/>
			</div>

			<div>
				<label htmlFor="bio" className={labelCls}>
					Bio
				</label>
				<textarea id="bio" rows={4} className={fieldCls} {...register("bio")} />
				{errors.bio ? <p className={errCls}>{errors.bio.message}</p> : null}
			</div>

			<div className="grid gap-5 sm:grid-cols-3">
				<div>
					<label htmlFor="github" className={labelCls}>
						GitHub
					</label>
					<input
						id="github"
						className={fieldCls}
						{...register("links.github")}
					/>
					{errors.links?.github ? (
						<p className={errCls}>{errors.links.github.message}</p>
					) : null}
				</div>
				<div>
					<label htmlFor="website" className={labelCls}>
						Website
					</label>
					<input
						id="website"
						className={fieldCls}
						{...register("links.website")}
					/>
				</div>
				<div>
					<label htmlFor="linkedin" className={labelCls}>
						LinkedIn
					</label>
					<input
						id="linkedin"
						className={fieldCls}
						{...register("links.linkedin")}
					/>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<button type="submit" className="btn btn-primary">
					Save profile
				</button>
				{saved ? <SavedNote /> : null}
			</div>
		</form>
	);
}

function SponsorForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SponsorProfileEdit>({
		resolver: zodResolver(sponsorProfileEditSchema),
		defaultValues: {
			displayName: "",
			organization: "",
			focus: "",
			bio: "",
			website: "",
		},
	});
	const [saved, setSaved] = useState(false);

	const onSubmit = (values: SponsorProfileEdit) => {
		// TODO(P0): useUpdateSponsorProfile().mutate(values)
		console.log("sponsor profile (mock submit)", values);
		setSaved(true);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<div>
				<label htmlFor="displayName" className={labelCls}>
					Display name
				</label>
				<input
					id="displayName"
					className={fieldCls}
					{...register("displayName")}
				/>
				{errors.displayName ? (
					<p className={errCls}>{errors.displayName.message}</p>
				) : null}
			</div>

			<div>
				<label htmlFor="organization" className={labelCls}>
					Organization
				</label>
				<input
					id="organization"
					className={fieldCls}
					{...register("organization")}
				/>
			</div>

			<div>
				<label htmlFor="focus" className={labelCls}>
					Focus{" "}
					<span className="text-content-faint">(what you back / scout)</span>
				</label>
				<input id="focus" className={fieldCls} {...register("focus")} />
			</div>

			<div>
				<label htmlFor="bio" className={labelCls}>
					Bio
				</label>
				<textarea id="bio" rows={4} className={fieldCls} {...register("bio")} />
				{errors.bio ? <p className={errCls}>{errors.bio.message}</p> : null}
			</div>

			<div>
				<label htmlFor="website" className={labelCls}>
					Website
				</label>
				<input id="website" className={fieldCls} {...register("website")} />
				{errors.website ? (
					<p className={errCls}>{errors.website.message}</p>
				) : null}
			</div>

			<div className="flex items-center gap-4">
				<button type="submit" className="btn btn-primary">
					Save profile
				</button>
				{saved ? <SavedNote /> : null}
			</div>
		</form>
	);
}

export function ProfileEditForm({
	variant,
}: {
	variant: "student" | "sponsor";
}) {
	return variant === "student" ? <StudentForm /> : <SponsorForm />;
}
