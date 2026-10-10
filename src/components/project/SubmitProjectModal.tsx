import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Code, MonitorPlay, Play, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { searchUsers, type UserSearchHit } from "#/lib/account/api";
import { BACKEND_URL } from "#/lib/api";
import { projectQuery, thesisPaperUrl } from "#/lib/project/api";
import {
	documentLabel,
	emptyFormValues,
	formToProjectInput,
	isValidUrl,
	projectToFormValues,
	requiresDocumentUpload,
	triggersReReview,
} from "#/lib/project/helper";
import {
	CATEGORIES,
	PROJECT_TYPE_LABELS,
	type Project,
	type ProjectFormValues,
	projectFormSchema,
} from "#/lib/project/model";
import { toast } from "#/lib/toast";
import { cn } from "#/lib/utils";
import { validateProjectImage, validateThesisFile } from "#/utils/fileHandling";

/**
 * Submit-a-project wizard — a 1:1 port of the design-template SUBMIT WIZARD MODAL: a 760px
 * modal with a 5-step numbered stepper (Details · MVP · Team · Ownership · Review). Opened
 * from the dashboard "+ Submit a project" action to create, and reused **prefilled** as the
 * edit surface (STU-11) when a `project` is passed. Reuses the project form schema, the MVP
 * gate, and `useProjectMutations`. Closes on ✕ / backdrop / Escape.
 */

const STEPS = ["Project", "Confirm"] as const;

const inputCls =
	"h-[46px] w-full rounded-[10px] border border-line bg-surface-card px-[14px] text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const fieldLabelCls = "mb-[7px] text-[13px] text-content-muted";
const requiredLabelCls = `${fieldLabelCls} after:ml-1 after:text-danger after:content-['*']`;
const helperCls = "mb-4 text-[14px] leading-[1.5] text-content-soft";
const LOCAL_DRAFT_PREFIX = "academy.project-draft";

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
	// Id of a project this modal created (Send invites / Save draft keep the modal open).
	const [savedId, setSavedId] = useState<string | null>(null);
	// Errors stay hidden until a field is blurred or Continue/Submit is clicked.
	const [showErrors, setShowErrors] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const { create, update, submit, resubmit, uploadThesis, uploadImage } =
		useProjectMutations();
	const [step, setStep] = useState(0);
	// A returning editor already consented at creation.
	const [consented, setConsented] = useState(editing);
	const [fileError, setFileError] = useState<string | null>(null);
	// The raw picked file, held only until it's uploaded on submit — a project may not exist
	// yet (create path), so the upload can't fire until we have an id.
	const [thesisFile, setThesisFile] = useState<File | null>(null);
	const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
	const [storedImageSrc, setStoredImageSrc] = useState<string | null>(null);
	const imageSrc = imagePreviewUrl ?? storedImageSrc;
	useEffect(() => {
		return () => {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);
	useEffect(() => {
		if (!project?.imageUrl) {
			return;
		}

		const controller = new AbortController();
		let objectUrl: string | null = null;
		fetch(`${BACKEND_URL}${project.imageUrl}`, {
			credentials: "include",
			signal: controller.signal,
		})
			.then((response) => (response.ok ? response.blob() : null))
			.then((blob) => {
				if (!blob || controller.signal.aborted) {
					return;
				}
				objectUrl = URL.createObjectURL(blob);
				setStoredImageSrc(objectUrl);
			})
			.catch(() => {});

		return () => {
			controller.abort();
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [project?.imageUrl]);

	const form = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: project ? projectToFormValues(project) : emptyFormValues(),
	});
	const { register, watch, setValue, control, getValues, reset } = form;
	const localDraftKey =
		!editing && user?.iskolarUserId
			? `${LOCAL_DRAFT_PREFIX}.${user.iskolarUserId}`
			: null;

	useEffect(() => {
		if (!localDraftKey) {
			return;
		}
		const raw = window.localStorage.getItem(localDraftKey);
		if (!raw) {
			return;
		}

		try {
			const parsed = projectFormSchema.partial().safeParse(JSON.parse(raw));
			if (parsed.success) {
				reset({
					...emptyFormValues(),
					...parsed.data,
					// File objects cannot survive localStorage. Make the upload explicit again.
					thesisPaperName: "",
				});
			}
		} catch {
			window.localStorage.removeItem(localDraftKey);
		}
	}, [localDraftKey, reset]);

	useEffect(() => {
		if (!localDraftKey) {
			return;
		}
		const subscription = form.watch((values) => {
			window.localStorage.setItem(
				localDraftKey,
				JSON.stringify({ ...values, thesisPaperName: "" }),
			);
		});
		return () => subscription.unsubscribe();
	}, [form, localDraftKey]);
	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const title = watch("title");
	const links = watch("links");
	const type = watch("type");
	const category = watch("category");
	const pitch = watch("pitch");
	const purpose = watch("purpose");
	const thesisPaperName = watch("thesisPaperName");
	const ownershipDeclared = watch("ownershipDeclared");
	const members = watch("members");
	const isTeam = watch("isTeam");
	const touched = form.formState.touchedFields;
	// Live consent: poll the stored project every 5s while any invite is pending, so a
	// teammate accepting shows up here without reopening the modal. ponytail: polling,
	// swap for SSE/websocket if invite latency matters.
	const { data: liveProject } = useQuery({
		...projectQuery(project?.id ?? savedId ?? ""),
		enabled: !!(project || savedId),
		initialData: project,
		refetchInterval: (q) =>
			q.state.data?.members.some((m) => m.consent === "pending") ? 5000 : false,
	});
	const current = liveProject ?? project;
	const hasOptional = !!(
		purpose ||
		links?.demo ||
		links?.repo ||
		links?.video ||
		projectImageFile ||
		project?.imageUrl
	);
	useEffect(() => {
		if (hasOptional) {
			setMoreOpen(true);
		}
	}, [hasOptional]);
	const consentOf = (m: { name: string; linkedUserId?: string | null }) =>
		current?.members.find(
			(e) =>
				(m.linkedUserId && e.linkedUserId === m.linkedUserId) ||
				e.name === m.name,
		)?.consent;
	const name = user?.displayName || user?.iskolarUserId || "You";

	const busy =
		create.isPending ||
		update.isPending ||
		submit.isPending ||
		resubmit.isPending ||
		uploadThesis.isPending ||
		uploadImage.isPending;
	const isLast = step === STEPS.length - 1;

	// Editing a published project's title/category/MVP links sends it back to review (STU-11).
	const willReReview =
		!!project &&
		project.status === "published" &&
		triggersReReview(project, formToProjectInput(getValues()));

	// Demo, repository, and video URLs are optional; ownership + consent are declared.
	const gateIssues: string[] = [];
	if (!title || title.trim().length < 2) {
		gateIssues.push("Add a project title");
	}
	if (!category) {
		gateIssues.push("Pick a category");
	}
	if ((pitch ?? "").trim().length < 8) {
		gateIssues.push("Add a one-line pitch");
	}
	if (links?.demo && !isValidUrl(links.demo)) {
		gateIssues.push("Add a valid live demo URL");
	}
	if (links?.repo && !isValidUrl(links.repo)) {
		gateIssues.push("Add a valid public repository URL");
	}
	if (!ownershipDeclared) {
		gateIssues.push("Confirm the ownership declaration");
	}
	if (!consented) {
		gateIssues.push("Consent to review & public showcase");
	}
	const teamConsentIssues = (() => {
		if (!watch("isTeam")) {
			return [];
		}

		const consents = (members ?? [])
			.filter((member) => member.linked)
			.map((member) => consentOf(member) ?? "pending");
		if (consents.includes("declined")) {
			return ["Resolve declined team member consent"];
		}
		return consents.includes("pending")
			? ["Wait for all team members to accept their invitation"]
			: [];
	})();
	gateIssues.push(...teamConsentIssues);
	if (
		watch("isTeam") &&
		(members ?? []).some((m) => m.linked && !m.linkedUserId)
	) {
		gateIssues.push("Pick each teammate from search results");
	}

	// Per-step slice of the gate — "Continue" used to advance unconditionally
	// regardless of that step's own required fields (the reported bug: MVP step's
	// "required" URLs didn't actually block advancing). Team consent is also required
	// before submission when linked teammates are part of the project.
	const urlIssues = [
		links?.demo && !isValidUrl(links.demo) ? "Add a valid live demo URL" : null,
		links?.repo && !isValidUrl(links.repo)
			? "Add a valid public repository URL"
			: null,
	].filter((issue): issue is string => issue !== null);
	const pickIssues =
		isTeam && (members ?? []).some((m) => m.linked && !m.linkedUserId)
			? ["Pick each teammate from search results"]
			: [];
	// Step 0 gates Continue; teammate acceptance only gates the final Submit, so a team
	// can move on to Confirm while invites are still pending.
	const stepIssues: string[][] = [
		[
			!title || title.trim().length < 2 ? "Add a project title" : null,
			!category ? "Pick a category" : null,
			(pitch ?? "").trim().length < 8 ? "Add a one-line pitch" : null,
		]
			.filter((issue): issue is string => issue !== null)
			.concat(urlIssues, pickIssues),
		gateIssues,
	];
	const currentStepIssues = stepIssues[step] ?? [];
	const fieldError = (key: "title" | "pitch" | "category") => {
		if (!showErrors && !touched[key]) {
			return null;
		}
		const issue = {
			title: "Add a project title",
			pitch: "Add a one-line pitch",
			category: "Pick a category",
		}[key];
		return stepIssues[0]?.includes(issue) ? issue : null;
	};
	const FIRST_FIELD_IDS = {
		"Add a project title": "project-title",
		"Pick a category": "project-category",
		"Add a one-line pitch": "project-pitch",
		"Add a valid live demo URL": "project-demo",
		"Add a valid public repository URL": "project-repo",
	} as Record<string, string>;
	// Shared by Continue and Submit: reveal errors, jump to step 0 if its fields are the
	// problem, and focus the first invalid field instead of silently disabling buttons.
	const blockedByStep0 = () => {
		setShowErrors(true);
		const first = stepIssues[0]?.[0];
		if (!first) {
			return false;
		}
		setStep(0);
		if (FIRST_FIELD_IDS[first] && urlIssues.includes(first)) {
			setMoreOpen(true);
		}
		const id = FIRST_FIELD_IDS[first];
		setTimeout(() => document.getElementById(id ?? "")?.focus(), 0);
		return true;
	};

	const onPickFile = (file: File | undefined) => {
		if (!file) {
			return;
		}
		const err = validateThesisFile(file);
		if (err) {
			setFileError(err);
			return;
		}
		setFileError(null);
		setValue("thesisPaperName", file.name);
		setThesisFile(file);
	};

	const onPickProjectImage = async (file: File | undefined) => {
		if (!file) {
			return;
		}
		const error = validateProjectImage(file);
		if (error) {
			setImageError(error);
			return;
		}
		setImageError(null);
		try {
			const square = await cropToSquare(file);
			setProjectImageFile(square);
			setImagePreviewUrl(URL.createObjectURL(square));
		} catch {
			setImageError("Could not read that image. Try another file.");
		}
	};

	const onSubmitProject = async () => {
		if (blockedByStep0()) {
			return;
		}
		if (gateIssues.length > 0) {
			setStep(1);
			return;
		}
		const input = formToProjectInput(getValues());
		// mutateAsync re-throws (unlike mutate), so this chain owns its catch: surface the
		// server's envelope message (422 gate / 403 owner / network) as a toast and keep
		// the modal open so nothing typed is lost.
		try {
			if (current) {
				await update.mutateAsync({ id: current.id, input });
				// A newly picked file uploads after the save so it lands on the record
				// that now has the latest ownership/type; re-review below re-checks it.
				if (thesisFile) {
					await uploadThesis.mutateAsync({ id: current.id, file: thesisFile });
				}
				if (projectImageFile) {
					await uploadImage.mutateAsync({
						id: current.id,
						file: projectImageFile,
					});
				}
				// Draft/returned/withdrawn re-enter review explicitly; a published edit
				// re-reviews itself server-side when MVP-critical fields change.
				if (current.status === "draft") {
					await submit.mutateAsync(current.id);
				} else if (
					current.status === "returned" ||
					current.status === "withdrawn"
				) {
					await resubmit.mutateAsync(current.id);
				}
				if (localDraftKey) {
					window.localStorage.removeItem(localDraftKey);
				}
				toast.success(
					willReReview ? "Saved and sent back to review" : "Changes saved",
				);
				onClose();
				return;
			}
			const created = await create.mutateAsync(input);
			// The draft now has an id — the upload can only happen from here on.
			if (thesisFile) {
				await uploadThesis.mutateAsync({ id: created.id, file: thesisFile });
			}
			if (projectImageFile) {
				await uploadImage.mutateAsync({
					id: created.id,
					file: projectImageFile,
				});
			}
			await submit.mutateAsync(created.id);
			if (localDraftKey) {
				window.localStorage.removeItem(localDraftKey);
			}
			toast.success("Project submitted", {
				description: "Your project is in the Academy review queue.",
			});
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong.");
		}
	};

	const onSaveDraft = async (invite = false) => {
		try {
			const input = formToProjectInput(getValues());
			if (current) {
				await update.mutateAsync({ id: current.id, input });
				if (thesisFile) {
					await uploadThesis.mutateAsync({ id: current.id, file: thesisFile });
				}
				if (projectImageFile) {
					await uploadImage.mutateAsync({
						id: current.id,
						file: projectImageFile,
					});
				}
			} else {
				const created = await create.mutateAsync(input);
				if (thesisFile) {
					await uploadThesis.mutateAsync({ id: created.id, file: thesisFile });
				}
				if (projectImageFile) {
					await uploadImage.mutateAsync({
						id: created.id,
						file: projectImageFile,
					});
				}
				setSavedId(created.id);
			}
			if (invite) {
				// The server sends invites as part of the save above; stay on this step.
				toast.success("Invites sent", {
					description: "Teammates were notified. Status updates here live.",
				});
				return;
			}
			if (localDraftKey) {
				window.localStorage.removeItem(localDraftKey);
			}
			toast.success("Draft saved", {
				description: "You can return to it from My Projects.",
			});
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save draft.");
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				aria-describedby={undefined}
				className="flex max-h-[min(90dvh,850px)] w-[760px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden"
			>
				{/* Header */}
				<div className="flex shrink-0 items-center justify-between rounded-t-[18px] border-[#eef1fa] border-b bg-surface-overlay px-7 py-[22px]">
					<DialogTitle>
						{editing ? "Edit project" : "Submit a project"}
					</DialogTitle>
					<DialogClose asChild>
						<button
							type="button"
							aria-label="Close"
							className="flex size-[34px] items-center justify-center rounded-[9px] border border-info-bd text-content-muted transition-colors hover:border-action hover:text-action"
						>
							<X className="size-4" aria-hidden />
						</button>
					</DialogClose>
				</div>

				{/* Stepper */}
				<div className="flex shrink-0 items-center px-7 pt-5 pb-1.5">
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
									</div>
								) : null}
							</div>
						);
					})}
				</div>

				{/* Body */}
				<div className="isk-scroll min-h-0 flex-1 overflow-y-auto px-7 pt-[18px] pb-5">
					{step === 0 ? (
						<div className="flex flex-col gap-4">
							<div>
								<div className={requiredLabelCls}>Project title</div>
								<input
									id="project-title"
									className={inputCls}
									placeholder="e.g. AralBot"
									{...register("title")}
								/>
								<FieldError msg={fieldError("title")} />
							</div>
							<div>
								<div className={requiredLabelCls}>One-line pitch</div>
								<input
									id="project-pitch"
									className={inputCls}
									placeholder="What does it do, in a sentence?"
									{...register("pitch")}
								/>
								<FieldError msg={fieldError("pitch")} />
							</div>
							<div className="flex gap-3.5">
								<div className="flex-1">
									<div className={requiredLabelCls}>Category</div>
									<select
										id="project-category"
										className={inputCls}
										{...register("category")}
									>
										<option value="">Select…</option>
										{CATEGORIES.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
									<FieldError msg={fieldError("category")} />
								</div>
								<div className="flex-1">
									<div className={requiredLabelCls}>Type</div>
									<select className={inputCls} {...register("type")}>
										<option value="idea">{PROJECT_TYPE_LABELS.idea}</option>
										<option value="thesis_capstone">
											{PROJECT_TYPE_LABELS.thesis_capstone}
										</option>
										<option value="startup">
											{PROJECT_TYPE_LABELS.startup}
										</option>
									</select>
								</div>
							</div>
							<div>
								<div className={fieldLabelCls}>
									Working on this with others?
								</div>
								<div className="flex gap-2">
									{(
										[
											["Solo", false],
											["Team", true],
										] as const
									).map(([label, value]) => (
										<button
											type="button"
											key={label}
											aria-pressed={isTeam === value}
											onClick={() => {
												setValue("isTeam", value);
												if (!value) {
													remove();
												}
											}}
											className={cn(
												"h-10 flex-1 rounded-[10px] border text-[14px] transition-colors",
												isTeam === value
													? "border-action bg-surface-tint text-action"
													: "border-line text-content-muted hover:bg-surface-sunken",
											)}
										>
											{label}
										</button>
									))}
								</div>
							</div>
							{isTeam ? (
								<div>
									<p className={helperCls}>
										Add teammates and note who did what. Each member confirms
										their own contribution.
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
												<div className="text-[12.5px] text-content-faint">
													Lead
												</div>
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
												<div className="sm:flex-1">
													<label
														htmlFor={`member-name-${i}`}
														className={requiredLabelCls}
													>
														Team member
													</label>
													{members?.[i]?.linked ? (
														<MemberPicker
															id={`member-name-${i}`}
															selectedName={
																members[i]?.linkedUserId ? members[i]?.name : ""
															}
															excludeIds={(members ?? [])
																.map((m) => m.linkedUserId)
																.filter((v): v is string => !!v)}
															onPick={(hit) => {
																setValue(`members.${i}.name`, hit.displayName, {
																	shouldDirty: true,
																});
																setValue(
																	`members.${i}.linkedUserId`,
																	hit.iskolarUserId,
																	{ shouldDirty: true },
																);
															}}
															onClear={() => {
																setValue(`members.${i}.name`, "", {
																	shouldDirty: true,
																});
																setValue(`members.${i}.linkedUserId`, null, {
																	shouldDirty: true,
																});
															}}
														/>
													) : (
														<input
															id={`member-name-${i}`}
															className={inputCls}
															{...register(`members.${i}.name`)}
														/>
													)}
												</div>
												<div className="sm:flex-1">
													<label
														htmlFor={`member-contribution-${i}`}
														className={fieldLabelCls}
													>
														Contribution
													</label>
													<input
														id={`member-contribution-${i}`}
														className={inputCls}
														{...register(`members.${i}.contribution`)}
													/>
												</div>
												{members?.[i]?.linkedUserId ? (
													<ConsentBadge
														consent={consentOf(members[i]) ?? null}
													/>
												) : null}
												<button
													type="button"
													onClick={() => {
														remove(i);
														if (fields.length <= 1) {
															setValue("isTeam", false);
														}
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
												append({
													name: "",
													contribution: "",
													linked: true,
													linkedUserId: null,
												});
												setValue("isTeam", true);
											}}
											className="h-[46px] rounded-[10px] border border-[#c3d0f2] border-dashed bg-surface-sunken text-[14.5px] text-action transition-colors hover:bg-surface-tint"
										>
											+ Invite a teammate from iSkolar
										</button>
										{(members ?? []).some((m) => m.linkedUserId) ? (
											<Button
												type="button"
												variant="secondary"
												disabled={busy}
												onClick={() => onSaveDraft(true)}
											>
												Send invites
											</Button>
										) : null}
									</div>
								</div>
							) : null}
							<details
								open={moreOpen}
								onToggle={(e) => setMoreOpen(e.currentTarget.open)}
								className="rounded-[11px] border border-[#eef1fa] p-3.5"
							>
								<summary className="cursor-pointer text-[14px] text-action">
									Additional Details (optional)
								</summary>
								<div className="mt-4 flex flex-col gap-4">
									<div>
										<div className={fieldLabelCls}>Purpose</div>
										<textarea
											className="min-h-[84px] w-full resize-y rounded-[10px] border border-line bg-surface-card px-[14px] py-[11px] text-[15px] text-content-heading outline-none focus:border-action"
											maxLength={1000}
											placeholder="The problem this solves and who it's for. Shown under Purpose on the project page."
											{...register("purpose")}
										/>
										<div className="mt-1 text-right font-mono text-[11px] text-content-faint">
											{(purpose ?? "").length}/1000
										</div>
									</div>
									<div className="grid gap-4 sm:grid-cols-[200px_1fr]">
										<div>
											<div className={fieldLabelCls}>
												Project image
											</div>
											<div className="overflow-hidden rounded-[10px] border border-line bg-surface-sunken">
												<div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#dce7ff] to-[#f0e7ff]">
													{imageSrc ? (
														<img
															src={imageSrc}
															alt="Preview of the selected cover"
															className="absolute inset-0 size-full object-cover"
														/>
													) : (
														<Upload
															className="size-7 text-action/60"
															aria-hidden
														/>
													)}
												</div>
												<div className="flex flex-col gap-2 p-3">
													<p className="min-w-0 break-words text-[12px] text-content-faint">
														{projectImageFile?.name ??
															"JPEG, PNG, or WebP | Max 5 MB"}
													</p>
													<label className="flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-action hover:bg-surface-sunken">
														{projectImageFile || project?.imageUrl
															? "Change image"
															: "Choose image"}
														<input
															type="file"
															accept="image/jpeg,image/png,image/webp"
															className="hidden"
															disabled={uploadImage.isPending}
															onChange={(event) => {
																onPickProjectImage(event.target.files?.[0]);
																event.target.value = "";
															}}
														/>
													</label>
												</div>
											</div>
											{imageError ? (
												<p className="mt-1 text-[11.5px] text-danger">
													{imageError}
												</p>
											) : null}
										</div>
										<div>
											<div className="flex flex-col gap-3.5">
												{(
													[
														{
															key: "demo",
															Icon: MonitorPlay,
															ph: "Live demo URL",
															hint: "Host it on a free service (Vercel, Netlify, Render, GitHub Pages, etc.). Cold starts should be retried before a project is returned.",
														},
														{
															key: "repo",
															Icon: Code,
															ph: "Public repository URL",
															hint: null,
														},
														{
															key: "video",
															Icon: Play,
															ph: "Demo video URL",
															hint: "Upload to YouTube as Unlisted (not Private) so the link actually opens for reviewers.",
														},
													] as const
												).map(({ key, Icon, ph, hint }) => {
													const value = links?.[key] ?? "";
													return (
														<div key={key} className="flex flex-col gap-1">
															<label
																htmlFor={`project-${key}`}
																className="pl-11 text-[13px] text-content-muted"
															>
																{ph}
															</label>
															<div className="flex items-center gap-3">
																<span className="flex w-8 flex-none justify-center text-action">
																	<Icon
																		className="size-5"
																		strokeWidth={1.6}
																		aria-hidden
																	/>
																</span>
																<input
																	id={`project-${key}`}
																	className={`h-11 flex-1 rounded-[10px] border bg-surface-card px-[14px] text-[14.5px] text-content-heading outline-none transition-colors focus:border-action ${
																		value && !isValidUrl(value)
																			? "border-danger"
																			: "border-line"
																	}`}
																	placeholder={ph}
																	{...register(`links.${key}`)}
																/>
															</div>
															{hint ? (
																<p className="pl-11 font-mono text-[11px] text-content-faint">
																	{hint}
																</p>
															) : null}
														</div>
													);
												})}
											</div>
										</div>
									</div>
								</div>
							</details>
						</div>
					) : null}
					{step === 1 ? (
						<div className="flex flex-col gap-4">
							<div className="rounded-[11px] bg-surface-sunken px-3.5 py-3 text-[13.5px] text-content-body">
								<span className="text-content-heading">
									{title || "Untitled"}
								</span>
								{[
									category,
									PROJECT_TYPE_LABELS[type],
									isTeam ? `${(members ?? []).length + 1} people` : "Solo",
								]
									.filter(Boolean)
									.map((part) => (
										<span key={part}> · {part}</span>
									))}
							</div>
							<p className={helperCls}>
								Declare ownership and integrity. This is recorded with your
								submission.{" "}
								{editing
									? willReReview
										? "Changing the title, category, or an MVP link sends this published project back to the review queue."
										: "Your changes are saved without a new review."
									: "Your project goes to the Academy review queue."}
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
										credited and licensed.{" "}
										<span className="text-danger" aria-hidden="true">
											*
										</span>
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
										the public showcase.{" "}
										<span className="text-danger" aria-hidden="true">
											*
										</span>
									</span>
								</label>

								{requiresDocumentUpload(type) ? (
									<div className="flex items-center gap-[11px] rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-3.5">
										<Upload
											className="size-[18px] flex-none text-action"
											aria-hidden
										/>
										<div className="flex-1">
											<div className="text-[14px] text-content-heading">
												{thesisPaperName ??
													`${documentLabel(type).charAt(0).toUpperCase()}${documentLabel(type).slice(1)} (PDF)`}
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
												Optional {documentLabel(type)} PDF, stored in the Lumen
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
							{showErrors && gateIssues.length > 0 ? (
								<div className="rounded-[11px] border border-danger p-3.5">
									<p className="mb-1.5 text-[14px] text-content-heading">
										Fix these before submitting:
									</p>
									<ul className="list-disc space-y-1 pl-5 text-[13px] text-content-body">
										{gateIssues.map((issue) => (
											<li key={issue}>{issue}</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					) : null}
				</div>

				{/* Footer stays below the scrolling fields, including on short screens. */}
				<div className="shrink-0 border-line border-t bg-surface-overlay">
					<div className="flex items-center justify-between gap-3 px-7 py-4 max-[420px]:flex-wrap">
						<div className="flex items-center gap-2">
							<Button
								variant="secondary"
								size="lg"
								onClick={() => setStep((s) => Math.max(0, s - 1))}
								className={cn("rounded-[10px] px-5", step === 0 && "invisible")}
							>
								Back
							</Button>
							<Button
								variant="secondary"
								size="lg"
								disabled={busy}
								onClick={() => onSaveDraft()}
								className="rounded-[10px] px-4"
							>
								Save draft
							</Button>
							{editing && !isLast && project?.status !== "draft" ? (
								<Button
									variant="secondary"
									size="lg"
									disabled={busy}
									onClick={onSubmitProject}
									className="rounded-[10px] px-4"
								>
									Save changes
								</Button>
							) : null}
						</div>
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
								onClick={() => {
									if (currentStepIssues.length > 0) {
										blockedByStep0();
										return;
									}
									setStep((s) => Math.min(STEPS.length - 1, s + 1));
								}}
								className="rounded-[10px] px-[26px] text-[15px] shadow-none"
							>
								Continue
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function MemberPicker({
	id,
	selectedName,
	excludeIds,
	onPick,
	onClear,
}: {
	id: string;
	selectedName: string | undefined;
	excludeIds: string[];
	onPick: (hit: UserSearchHit) => void;
	onClear: () => void;
}) {
	const [text, setText] = useState("");
	const [q, setQ] = useState("");
	useEffect(() => {
		const t = setTimeout(() => setQ(text.trim()), 250);
		return () => clearTimeout(t);
	}, [text]);
	const { data = [], isFetching } = useQuery({
		queryKey: ["account", "search", q],
		queryFn: () => searchUsers(q),
		enabled: q.length >= 2 && !selectedName,
	});
	const hits = data.filter((h) => !excludeIds.includes(h.iskolarUserId));

	if (selectedName) {
		return (
			<div className="flex h-[46px] items-center justify-between rounded-[10px] border border-[#eef1fa] px-3.5 text-[15px] text-content-heading">
				<span>{selectedName}</span>
				<button
					type="button"
					onClick={onClear}
					className="text-[12.5px] text-action"
				>
					Change
				</button>
			</div>
		);
	}

	return (
		<div className="relative">
			<input
				id={id}
				className={inputCls}
				placeholder="Search iSkolar accounts by name"
				value={text}
				onChange={(e) => setText(e.target.value)}
				autoComplete="off"
			/>
			{q.length >= 2 ? (
				<ul className="absolute z-10 mt-1 w-full rounded-[10px] border border-[#eef1fa] bg-white shadow-md">
					{hits.map((h) => (
						<li key={h.iskolarUserId}>
							<button
								type="button"
								onClick={() => onPick(h)}
								className="w-full px-3.5 py-2.5 text-left text-[14.5px] hover:bg-surface-sunken"
							>
								{h.displayName}
							</button>
						</li>
					))}
					{!hits.length ? (
						<li className="px-3.5 py-2.5 text-[13px] text-content-faint">
							{isFetching ? "Searching…" : "No accounts found"}
						</li>
					) : null}
				</ul>
			) : null}
		</div>
	);
}

function ConsentBadge({ consent }: { consent: string | null }) {
	const [label, cls] =
		consent === "accepted"
			? ["Accepted", "bg-success-bg text-success"]
			: consent === "declined"
				? ["Declined", "bg-surface-sunken text-content-muted"]
				: consent === "pending"
					? ["Invite pending", "bg-surface-sunken text-content-muted"]
					: ["Not invited yet", "bg-surface-sunken text-content-faint"];

	return (
		<span className={`rounded-md px-2.5 py-1 text-[12px] ${cls}`}>{label}</span>
	);
}

// Center-crop to a 1:1 square (max 1600px) so every project cover matches the square cards.
async function cropToSquare(file: File): Promise<File> {
	const bitmap = await createImageBitmap(file);
	const side = Math.min(bitmap.width, bitmap.height);
	const out = Math.min(side, 1600);
	const canvas = document.createElement("canvas");
	canvas.width = out;
	canvas.height = out;
	canvas
		.getContext("2d")
		?.drawImage(
			bitmap,
			(bitmap.width - side) / 2,
			(bitmap.height - side) / 2,
			side,
			side,
			0,
			0,
			out,
			out,
		);
	bitmap.close();
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, file.type, 0.92),
	);
	if (!blob) {
		throw new Error("Crop failed");
	}

	return new File([blob], file.name, { type: file.type });
}

function FieldError({ msg }: { msg: string | null }) {
	return msg ? <p className="mt-1 text-[11.5px] text-danger">{msg}</p> : null;
}
