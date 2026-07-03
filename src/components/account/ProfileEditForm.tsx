import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMyProfile } from "#/hooks/account/useProfile";
import { useUpdateProfile } from "#/hooks/account/useUpdateProfile";
import { type ProfileEdit, profileEditSchema } from "#/lib/account/model";

/**
 * Own-profile edit form (STU-01 / SPN-01) — a 1:1 port of the design-template EDIT
 * PROFILE PAGE: a card with a gradient header band, an overlapping avatar tile, and the
 * four fields (Display name · Headline · School / organization · Bio). Same page for
 * every role — `org` maps to school (student) or organization (sponsor) server-side.
 *
 * Prefills from `GET /accounts/me/profile` and saves via `PATCH /accounts/me/profile`.
 */

const fieldCls =
	"h-12 w-full rounded-xl border border-line bg-surface-card px-4 text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const labelCls = "mb-[7px] block text-[13px] text-content-muted";
const errCls = "mt-1.5 text-xs text-danger";

/** First letters of the first two words — "Jasmine Reyes" → "JR". */
function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

export function ProfileEditForm() {
	const router = useRouter();
	const { data: profile, isLoading, isError } = useMyProfile();
	const update = useUpdateProfile();
	const [saved, setSaved] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isDirty },
	} = useForm<ProfileEdit>({
		resolver: zodResolver(profileEditSchema),
		defaultValues: { displayName: "", headline: "", org: "", bio: "" },
	});

	// Prefill once the profile loads (and whenever it changes underneath us).
	useEffect(() => {
		if (profile) {
			reset({
				displayName: profile.displayName,
				headline: profile.headline,
				org: profile.org,
				bio: profile.bio,
			});
		}
	}, [profile, reset]);

	const displayName = watch("displayName");

	const onSubmit = (values: ProfileEdit) => {
		setSaved(false);
		update.mutate(values, { onSuccess: () => setSaved(true) });
	};

	return (
		<main className="mx-auto max-w-3xl">
			<button
				type="button"
				onClick={() => router.history.back()}
				className="mb-[18px] text-[14.5px] text-action"
			>
				← Back
			</button>
			<h1 className="mb-[22px] text-[32px] text-action">Edit profile</h1>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="card-surface overflow-hidden rounded-[18px]"
			>
				<div className="h-24 bg-[linear-gradient(135deg,#3a52a6,#607ef2)]" />
				<div className="-mt-[42px] px-7 pb-7">
					<span className="inline-flex size-[84px] items-center justify-center rounded-[24px] border-4 border-white bg-action text-[28px] text-white shadow-[0_10px_24px_rgba(31,42,82,0.2)]">
						{initialsOf(displayName || "?")}
					</span>
					<p className="mt-3 mb-[22px] font-mono text-[13px] text-content-faint">
						How you appear across iSkolar Academy.
					</p>

					{isError ? (
						<p className="mb-4 status-pill status-pill--danger">
							Couldn't load your profile — check the connection and try again.
						</p>
					) : null}

					<fieldset
						disabled={isLoading}
						className="flex flex-col gap-4 disabled:opacity-60"
					>
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
							<label htmlFor="headline" className={labelCls}>
								Headline
							</label>
							<input
								id="headline"
								className={fieldCls}
								placeholder="e.g. Building offline-first learning tools"
								{...register("headline")}
							/>
							{errors.headline ? (
								<p className={errCls}>{errors.headline.message}</p>
							) : null}
						</div>

						<div>
							<label htmlFor="org" className={labelCls}>
								School / organization
							</label>
							<input id="org" className={fieldCls} {...register("org")} />
							{errors.org ? (
								<p className={errCls}>{errors.org.message}</p>
							) : null}
						</div>

						<div>
							<label htmlFor="bio" className={labelCls}>
								Bio
							</label>
							<textarea
								id="bio"
								className={`${fieldCls} min-h-24 resize-y py-3`}
								{...register("bio")}
							/>
							{errors.bio ? (
								<p className={errCls}>{errors.bio.message}</p>
							) : null}
						</div>
					</fieldset>

					<div className="mt-6 flex items-center gap-2.5">
						<button
							type="button"
							onClick={() => router.history.back()}
							className="btn btn-secondary h-12"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={update.isPending || isLoading || !isDirty}
							className="btn btn-primary h-12 flex-1 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{update.isPending ? "Saving…" : "Save changes"}
						</button>
					</div>

					{update.isError ? (
						<p className="mt-3 text-xs text-danger">
							Couldn't save — {(update.error as Error).message}
						</p>
					) : null}
					{saved && !update.isPending ? (
						<p className="mt-3 status-pill status-pill--success">
							Profile saved.
						</p>
					) : null}
				</div>
			</form>
		</main>
	);
}
