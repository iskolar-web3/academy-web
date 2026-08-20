import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "#/auth";
import { Calendar } from "#/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useCompleteOnboarding } from "#/hooks/auth/useCompleteOnboarding";
import {
	type AdminOnboardingInput,
	AGENCY_TYPE_LABELS,
	AGENCY_TYPES,
	type AgencyType,
	adminOnboardingSchema,
	EDUCATION_LEVEL_LABELS,
	EDUCATION_LEVELS,
	type EducationLevel,
	EMPLOYMENT_TYPE_LABELS,
	EMPLOYMENT_TYPES,
	type EmploymentType,
	GENDERS,
	type Gender,
	ORGANIZATION_TYPE_LABELS,
	ORGANIZATION_TYPES,
	type OrganizationType,
	type SponsorType,
} from "#/lib/account/model";
import { getDefaultPathOfRole } from "#/lib/api";
import { AcademyRole } from "#/lib/auth/model";

/**
 * Client-facing student form schema — plain non-empty strings for gender/education
 * level (not `studentOnboardingSchema`'s literal enums), so the select can start on a
 * real "not chosen yet" placeholder (`value=""`) instead of a silently-picked default.
 * Cast to the real enum values on submit — safe, since the `<option>` values are the
 * enum members themselves.
 */
const studentFormSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(60),
	middleName: z.string().max(60).optional(),
	lastName: z.string().min(1, "Last name is required").max(60),
	gender: z.string().min(1, "Please select a gender"),
	birthDate: z.string().min(1, "Please select a birth date"),
	phone: z.string().min(1, "Phone number is required").max(30),
	educationLevel: z.string().min(1, "Please select an education level"),
	schoolName: z.string().min(1, "School name is required").max(120),
});
type StudentFormValues = z.infer<typeof studentFormSchema>;

/**
 * Onboarding basic-info step — the second onboarding step, right after role-select. One
 * form per role, mirroring what iSkolar-main's own onboarding actually collects
 * (`iskolar-main/web/src/lib/{student,sponsor}/model.ts`): student gets the full field
 * set (name parts, gender, birth date, phone, education level, school); sponsor genuinely
 * branches three ways — individual (name parts, employment type, birth date, phone),
 * organization (name, organization type, phone), government (name, agency type, phone),
 * matching iSkolar-main's own individual/organization/government sponsor forms
 * field-for-field (an earlier pass wrongly collapsed these into one form — corrected).
 * Academy's `sponsor` academyRole stays a single role either way; `sponsorType` is new,
 * additive metadata, not a new top-level role. Admin has no iSkolar-main counterpart,
 * just a name. Stored independently in Academy's own `academy_user`/role-profile rows via
 * `POST /accounts/me/onboarding`. A sponsor picks a subscription tier next; others land
 * straight in their role area.
 */
export const Route = createFileRoute("/_onboarding/basic-info")({
	component: BasicInfo,
});

const fieldCls =
	"h-12 w-full rounded-xl border border-line bg-surface-card px-4 text-[15px] text-content-heading outline-none transition-colors focus:border-action";
const labelCls = "mb-[7px] block text-[13px] text-content-muted";
const errCls = "mt-1.5 text-xs text-danger";

function Field({
	id,
	label,
	error,
	children,
}: {
	id: string;
	label: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div>
			<label htmlFor={id} className={labelCls}>
				{label}
			</label>
			{children}
			{error ? <p className={errCls}>{error}</p> : null}
		</div>
	);
}

function OnboardingShell({
	children,
	onSubmit,
	pending,
	error,
	onBack,
	subtitle,
}: {
	children: ReactNode;
	onSubmit: () => void;
	pending: boolean;
	error?: string;
	/** Shown as a "← Change type" link above the heading — sponsor's 3-way branch only. */
	onBack?: () => void;
	subtitle?: string;
}) {
	return (
		<main className="mx-auto max-w-[560px]">
			{onBack ? (
				<button
					type="button"
					onClick={onBack}
					className="mb-4 text-[13px] text-action"
				>
					← Change type
				</button>
			) : null}
			<div className="mb-8 text-center">
				<div className="mb-3.5 inline-flex items-center gap-[11px]">
					<span className="h-0.5 w-[30px] bg-action/50" />
					<span className="font-mono text-[11.5px] uppercase tracking-[0.24em] text-action/60">
						Almost there
					</span>
					<span className="h-0.5 w-[30px] bg-action/50" />
				</div>
				<h1 className="mb-2 text-[34px] text-content-heading">
					Tell us the basics
				</h1>
				<p className="text-[15.5px] leading-[1.55] text-content-muted">
					{subtitle ??
						"A couple of details so people can recognize you on Academy."}
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
				className="card-surface flex flex-col gap-4 rounded-2xl px-7 py-7"
			>
				{children}

				<button
					type="submit"
					disabled={pending}
					className="btn btn-primary mt-2 h-12 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{pending ? "Saving…" : "Continue"}
				</button>

				{error ? (
					<p className="text-center text-sm text-danger">
						Couldn't save — {error}
					</p>
				) : null}
			</form>
		</main>
	);
}

function BirthDateField({
	value,
	onChange,
	error,
}: {
	value: string;
	onChange: (isoDate: string) => void;
	error?: string;
}) {
	const [open, setOpen] = useState(false);
	const selected = value ? new Date(value) : undefined;

	return (
		<Field id="birthDate" label="Birth date" error={error}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						id="birthDate"
						className={`${fieldCls} flex items-center justify-between text-left ${
							selected ? "" : "text-content-faint"
						}`}
					>
						{selected ? format(selected, "MMMM d, yyyy") : "Set birth date"}
						<CalendarIcon className="size-4 text-content-faint" aria-hidden />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-auto p-0">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={(date) => {
							if (!date) return;
							onChange(date.toISOString().slice(0, 10));
							setOpen(false);
						}}
						disabled={(date) => date > new Date()}
						captionLayout="dropdown"
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
}

function StudentForm({ onDone }: { onDone: () => void }) {
	const complete = useCompleteOnboarding();
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<StudentFormValues>({
		resolver: zodResolver(studentFormSchema),
		mode: "onBlur",
		defaultValues: {
			firstName: "",
			middleName: "",
			lastName: "",
			gender: "",
			birthDate: "",
			phone: "",
			educationLevel: "",
			schoolName: "",
		},
	});

	const onSubmit = handleSubmit((values) => {
		complete.mutate(
			{
				role: "student",
				...values,
				gender: values.gender as Gender,
				educationLevel: values.educationLevel as EducationLevel,
			},
			{ onSuccess: onDone },
		);
	});

	return (
		<OnboardingShell
			onSubmit={onSubmit}
			pending={complete.isPending}
			error={complete.isError ? (complete.error as Error).message : undefined}
		>
			<div className="flex gap-3.5">
				<div className="flex-1">
					<Field
						id="firstName"
						label="First name"
						error={errors.firstName?.message}
					>
						<input
							id="firstName"
							className={fieldCls}
							{...register("firstName")}
						/>
					</Field>
				</div>
				<div className="flex-1">
					<Field
						id="middleName"
						label="Middle name (optional)"
						error={errors.middleName?.message}
					>
						<input
							id="middleName"
							className={fieldCls}
							{...register("middleName")}
						/>
					</Field>
				</div>
			</div>
			<Field id="lastName" label="Last name" error={errors.lastName?.message}>
				<input id="lastName" className={fieldCls} {...register("lastName")} />
			</Field>

			<div className="flex gap-3.5">
				<div className="flex-1">
					<Field id="gender" label="Gender" error={errors.gender?.message}>
						<select
							id="gender"
							className={fieldCls}
							defaultValue=""
							{...register("gender")}
						>
							<option value="" disabled>
								Select your gender
							</option>
							{GENDERS.map((g) => (
								<option key={g} value={g}>
									{g[0].toUpperCase()}
									{g.slice(1)}
								</option>
							))}
						</select>
					</Field>
				</div>
				<div className="flex-1">
					<BirthDateField
						value={watch("birthDate")}
						onChange={(isoDate) =>
							setValue("birthDate", isoDate, { shouldValidate: true })
						}
						error={errors.birthDate?.message}
					/>
				</div>
			</div>

			<Field id="phone" label="Phone number" error={errors.phone?.message}>
				<input
					id="phone"
					type="tel"
					className={fieldCls}
					{...register("phone")}
				/>
			</Field>

			<Field
				id="educationLevel"
				label="Education level"
				error={errors.educationLevel?.message}
			>
				<select
					id="educationLevel"
					className={fieldCls}
					defaultValue=""
					{...register("educationLevel")}
				>
					<option value="" disabled>
						Select your education level
					</option>
					{EDUCATION_LEVELS.map((lvl) => (
						<option key={lvl} value={lvl}>
							{EDUCATION_LEVEL_LABELS[lvl]}
						</option>
					))}
				</select>
			</Field>

			<Field id="schoolName" label="School" error={errors.schoolName?.message}>
				<input
					id="schoolName"
					className={fieldCls}
					{...register("schoolName")}
				/>
			</Field>
		</OnboardingShell>
	);
}

const individualSponsorFormSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(60),
	middleName: z.string().max(60).optional(),
	lastName: z.string().min(1, "Last name is required").max(60),
	employmentType: z.string().min(1, "Please select an employment type"),
	birthDate: z.string().min(1, "Please select a birth date"),
	phone: z.string().min(1, "Phone number is required").max(30),
});
type IndividualSponsorFormValues = z.infer<typeof individualSponsorFormSchema>;

const organizationSponsorFormSchema = z.object({
	name: z.string().min(1, "Organization name is required").max(120),
	organizationType: z.string().min(1, "Please select an organization type"),
	phone: z.string().min(1, "Phone number is required").max(30),
});
type OrganizationSponsorFormValues = z.infer<
	typeof organizationSponsorFormSchema
>;

const governmentSponsorFormSchema = z.object({
	name: z.string().min(1, "Agency name is required").max(120),
	agencyType: z.string().min(1, "Please select an agency type"),
	phone: z.string().min(1, "Phone number is required").max(30),
});
type GovernmentSponsorFormValues = z.infer<typeof governmentSponsorFormSchema>;

interface SponsorTypeCard {
	type: SponsorType;
	initial: string;
	bg: string;
	label: string;
	desc: string;
}

const SPONSOR_TYPE_CARDS: SponsorTypeCard[] = [
	{
		type: "individual",
		initial: "In",
		bg: "#3a52a6",
		label: "Individual",
		desc: "Investing or scouting on your own behalf.",
	},
	{
		type: "organization",
		initial: "Or",
		bg: "#607ef2",
		label: "Organization",
		desc: "A private company, NGO, or educational institution.",
	},
	{
		type: "government",
		initial: "Gv",
		bg: "#1f2a52",
		label: "Government",
		desc: "A national agency, LGU, or GOCC.",
	},
];

function SponsorTypeSelect({
	onSelect,
}: {
	onSelect: (type: SponsorType) => void;
}) {
	return (
		<main className="mx-auto max-w-[560px]">
			<div className="mb-8 text-center">
				<div className="mb-3.5 inline-flex items-center gap-[11px]">
					<span className="h-0.5 w-[30px] bg-action/50" />
					<span className="font-mono text-[11.5px] uppercase tracking-[0.24em] text-action/60">
						Almost there
					</span>
					<span className="h-0.5 w-[30px] bg-action/50" />
				</div>
				<h1 className="mb-2 text-[34px] text-content-heading">
					What kind of sponsor are you?
				</h1>
				<p className="text-[15.5px] leading-[1.55] text-content-muted">
					This decides which details we ask for next.
				</p>
			</div>
			<div className="flex flex-col gap-3.5">
				{SPONSOR_TYPE_CARDS.map((c) => (
					<button
						key={c.type}
						type="button"
						onClick={() => onSelect(c.type)}
						className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface-card px-[22px] py-5 text-left transition-all hover:-translate-y-0.5 hover:border-action"
					>
						<span
							className="flex size-[52px] flex-none items-center justify-center rounded-[15px] text-[20px] text-white"
							style={{ background: c.bg }}
						>
							{c.initial}
						</span>
						<div className="flex-1">
							<div className="text-[19px] text-content-heading">{c.label}</div>
							<div className="mt-0.5 text-[13.5px] text-content-faint">
								{c.desc}
							</div>
						</div>
						<span className="text-[20px] text-action">→</span>
					</button>
				))}
			</div>
		</main>
	);
}

function IndividualSponsorForm({
	onDone,
	onBack,
}: {
	onDone: () => void;
	onBack: () => void;
}) {
	const complete = useCompleteOnboarding();
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<IndividualSponsorFormValues>({
		resolver: zodResolver(individualSponsorFormSchema),
		mode: "onBlur",
		defaultValues: {
			firstName: "",
			middleName: "",
			lastName: "",
			employmentType: "",
			birthDate: "",
			phone: "",
		},
	});

	const onSubmit = handleSubmit((values) => {
		complete.mutate(
			{
				role: "sponsor",
				sponsorType: "individual",
				...values,
				employmentType: values.employmentType as EmploymentType,
			},
			{ onSuccess: onDone },
		);
	});

	return (
		<OnboardingShell
			onSubmit={onSubmit}
			onBack={onBack}
			pending={complete.isPending}
			error={complete.isError ? (complete.error as Error).message : undefined}
		>
			<div className="flex gap-3.5">
				<div className="flex-1">
					<Field
						id="firstName"
						label="First name"
						error={errors.firstName?.message}
					>
						<input
							id="firstName"
							className={fieldCls}
							{...register("firstName")}
						/>
					</Field>
				</div>
				<div className="flex-1">
					<Field
						id="middleName"
						label="Middle name (optional)"
						error={errors.middleName?.message}
					>
						<input
							id="middleName"
							className={fieldCls}
							{...register("middleName")}
						/>
					</Field>
				</div>
			</div>
			<Field id="lastName" label="Last name" error={errors.lastName?.message}>
				<input id="lastName" className={fieldCls} {...register("lastName")} />
			</Field>

			<div className="flex gap-3.5">
				<div className="flex-1">
					<Field
						id="employmentType"
						label="Employment type"
						error={errors.employmentType?.message}
					>
						<select
							id="employmentType"
							className={fieldCls}
							defaultValue=""
							{...register("employmentType")}
						>
							<option value="" disabled>
								Select your employment type
							</option>
							{EMPLOYMENT_TYPES.map((t) => (
								<option key={t} value={t}>
									{EMPLOYMENT_TYPE_LABELS[t]}
								</option>
							))}
						</select>
					</Field>
				</div>
				<div className="flex-1">
					<BirthDateField
						value={watch("birthDate")}
						onChange={(isoDate) =>
							setValue("birthDate", isoDate, { shouldValidate: true })
						}
						error={errors.birthDate?.message}
					/>
				</div>
			</div>

			<Field id="phone" label="Phone number" error={errors.phone?.message}>
				<input
					id="phone"
					type="tel"
					className={fieldCls}
					{...register("phone")}
				/>
			</Field>
		</OnboardingShell>
	);
}

function OrganizationSponsorForm({
	onDone,
	onBack,
}: {
	onDone: () => void;
	onBack: () => void;
}) {
	const complete = useCompleteOnboarding();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<OrganizationSponsorFormValues>({
		resolver: zodResolver(organizationSponsorFormSchema),
		mode: "onBlur",
		defaultValues: { name: "", organizationType: "", phone: "" },
	});

	const onSubmit = handleSubmit((values) => {
		complete.mutate(
			{
				role: "sponsor",
				sponsorType: "organization",
				...values,
				organizationType: values.organizationType as OrganizationType,
			},
			{ onSuccess: onDone },
		);
	});

	return (
		<OnboardingShell
			onSubmit={onSubmit}
			onBack={onBack}
			pending={complete.isPending}
			error={complete.isError ? (complete.error as Error).message : undefined}
		>
			<Field id="name" label="Organization name" error={errors.name?.message}>
				<input id="name" className={fieldCls} {...register("name")} />
			</Field>
			<Field
				id="organizationType"
				label="Organization type"
				error={errors.organizationType?.message}
			>
				<select
					id="organizationType"
					className={fieldCls}
					defaultValue=""
					{...register("organizationType")}
				>
					<option value="" disabled>
						Select your organization type
					</option>
					{ORGANIZATION_TYPES.map((t) => (
						<option key={t} value={t}>
							{ORGANIZATION_TYPE_LABELS[t]}
						</option>
					))}
				</select>
			</Field>
			<Field id="phone" label="Phone number" error={errors.phone?.message}>
				<input
					id="phone"
					type="tel"
					className={fieldCls}
					{...register("phone")}
				/>
			</Field>
		</OnboardingShell>
	);
}

function GovernmentSponsorForm({
	onDone,
	onBack,
}: {
	onDone: () => void;
	onBack: () => void;
}) {
	const complete = useCompleteOnboarding();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<GovernmentSponsorFormValues>({
		resolver: zodResolver(governmentSponsorFormSchema),
		mode: "onBlur",
		defaultValues: { name: "", agencyType: "", phone: "" },
	});

	const onSubmit = handleSubmit((values) => {
		complete.mutate(
			{
				role: "sponsor",
				sponsorType: "government",
				...values,
				agencyType: values.agencyType as AgencyType,
			},
			{ onSuccess: onDone },
		);
	});

	return (
		<OnboardingShell
			onSubmit={onSubmit}
			onBack={onBack}
			pending={complete.isPending}
			error={complete.isError ? (complete.error as Error).message : undefined}
		>
			<Field id="name" label="Agency name" error={errors.name?.message}>
				<input id="name" className={fieldCls} {...register("name")} />
			</Field>
			<Field
				id="agencyType"
				label="Agency type"
				error={errors.agencyType?.message}
			>
				<select
					id="agencyType"
					className={fieldCls}
					defaultValue=""
					{...register("agencyType")}
				>
					<option value="" disabled>
						Select your agency type
					</option>
					{AGENCY_TYPES.map((t) => (
						<option key={t} value={t}>
							{AGENCY_TYPE_LABELS[t]}
						</option>
					))}
				</select>
			</Field>
			<Field id="phone" label="Phone number" error={errors.phone?.message}>
				<input
					id="phone"
					type="tel"
					className={fieldCls}
					{...register("phone")}
				/>
			</Field>
		</OnboardingShell>
	);
}

function SponsorForm({ onDone }: { onDone: () => void }) {
	const [sponsorType, setSponsorType] = useState<SponsorType | null>(null);

	if (!sponsorType) {
		return <SponsorTypeSelect onSelect={setSponsorType} />;
	}
	const onBack = () => setSponsorType(null);
	if (sponsorType === "individual") {
		return <IndividualSponsorForm onDone={onDone} onBack={onBack} />;
	}
	if (sponsorType === "organization") {
		return <OrganizationSponsorForm onDone={onDone} onBack={onBack} />;
	}
	return <GovernmentSponsorForm onDone={onDone} onBack={onBack} />;
}

function AdminForm({ onDone }: { onDone: () => void }) {
	const complete = useCompleteOnboarding();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AdminOnboardingInput>({
		resolver: zodResolver(adminOnboardingSchema),
		mode: "onBlur",
		defaultValues: { displayName: "" },
	});

	const onSubmit = handleSubmit((values) => {
		complete.mutate({ role: "admin", ...values }, { onSuccess: onDone });
	});

	return (
		<OnboardingShell
			onSubmit={onSubmit}
			pending={complete.isPending}
			error={complete.isError ? (complete.error as Error).message : undefined}
		>
			<Field
				id="displayName"
				label="Full name"
				error={errors.displayName?.message}
			>
				<input
					id="displayName"
					className={fieldCls}
					{...register("displayName")}
				/>
			</Field>
		</OnboardingShell>
	);
}

function BasicInfo() {
	const navigate = useNavigate();
	const { user, role } = useAuth();

	// Role not confirmed yet — this step comes after role-select, not before.
	useEffect(() => {
		if (user && !user.roleConfirmed) navigate({ to: "/role-select" });
	}, [user, navigate]);

	const onDone = () => {
		navigate({
			to:
				role === AcademyRole.Sponsor
					? "/sponsor/subscription"
					: getDefaultPathOfRole(role),
		});
	};

	if (role === AcademyRole.Sponsor) return <SponsorForm onDone={onDone} />;
	if (role === AcademyRole.Admin) return <AdminForm onDone={onDone} />;
	return <StudentForm onDone={onDone} />;
}
