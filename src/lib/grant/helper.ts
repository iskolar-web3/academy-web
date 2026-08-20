import type {
	GrantFormValues,
	GrantInput,
	GrantStatus,
} from "#/lib/grant/model";

/** Pure helpers for the grant domain — formatting, status meta, form mappers. */

/** `₱` + comma-grouped pesos (mirrors the design-template's `fmt()` exactly). */
export function formatPeso(n: number): string {
	return `₱${Math.round(n).toLocaleString("en-US")}`;
}

export function fundingPct(raised: number, target: number): number {
	if (target <= 0) return 0;
	return Math.min(100, Math.round((raised / target) * 100));
}

interface GrantStatusMeta {
	label: string;
	/** Chip-shaped (6px radius), matching the template's grant status badge — distinct
	 * from the pill-shaped `.status-pill` used for project status. */
	className: string;
}

const GRANT_STATUS_META: Record<GrantStatus, GrantStatusMeta> = {
	open: {
		label: "Open",
		className: "text-action bg-surface-tint border-info-bd",
	},
	funded: {
		label: "Funded",
		className: "text-success bg-success-bg border-success-bd",
	},
	closed: {
		label: "Closed",
		className: "text-content-soft bg-neutral-bg border-neutral-bd",
	},
	cancelled: {
		label: "Cancelled",
		className: "text-danger bg-danger-bg border-danger-bd",
	},
};

export function grantStatusMeta(status: GrantStatus): GrantStatusMeta {
	return GRANT_STATUS_META[status];
}

/** Map form values → the fields a create accepts. */
export function grantFormToInput(v: GrantFormValues): GrantInput {
	return {
		title: v.title.trim(),
		category: v.category,
		tech: v.techText
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
		purpose: v.purpose.trim(),
		teamNote: v.teamNote.trim(),
		target: Number(v.targetRaw.replace(/[^0-9.]/g, "")) || 0,
		ownershipDeclared: v.ownershipDeclared,
		proposalName: v.proposalName || null,
	};
}

/** Blank form values for a new grant request. */
export function emptyGrantFormValues(): GrantFormValues {
	return {
		title: "",
		category: "",
		techText: "",
		purpose: "",
		teamNote: "",
		targetRaw: "",
		ownershipDeclared: false,
		proposalName: "",
	};
}
