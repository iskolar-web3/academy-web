import { z } from "zod";

/**
 * Vault domain — the Venture-Pitch Vault (STU-17/18, SPN-16, P5). A vault is an implicit
 * per-project container — there is no separate "create a vault" action anywhere in the
 * template; uploading a project's first document *is* setup (STU-17). Access requests are
 * time-bounded (**14 days**, per the template's own "Approve (14d)" button and "expires in
 * 14d" status label — not a guess) and revocable.
 */

export const VAULT_ACCESS_STATUSES = [
	"none",
	"requested",
	"approved",
	"denied",
	"revoked",
] as const;
export type VaultAccessStatus = (typeof VAULT_ACCESS_STATUSES)[number];

export interface VaultDocument {
	id: string;
	label: string;
	meta: string;
}

export interface MyVault {
	projectId: string;
	projectTitle: string;
	hue: number;
	documents: VaultDocument[];
}

export interface VaultAccessRequest {
	id: string;
	projectId: string;
	projectTitle: string;
	sponsorName: string;
	sponsorKind: string;
	/** Never `"none"` here — a request row only exists once requested. */
	status: Exclude<VaultAccessStatus, "none">;
	requestedDaysAgo: number;
}

const vaultDocumentSchema = z.object({
	id: z.string(),
	label: z.string(),
	meta: z.string(),
});
export const vaultDocumentListSchema = z.array(vaultDocumentSchema);

export const myVaultSchema = z.object({
	projectId: z.string(),
	projectTitle: z.string(),
	hue: z.number(),
	documents: z.array(vaultDocumentSchema),
});
export const myVaultListSchema = z.array(myVaultSchema);

export const vaultAccessRequestSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	projectTitle: z.string(),
	sponsorName: z.string(),
	sponsorKind: z.string(),
	status: z.enum(["requested", "approved", "denied", "revoked"]),
	requestedDaysAgo: z.number(),
});
export const vaultAccessRequestListSchema = z.array(vaultAccessRequestSchema);

export type VaultAccessDecision = "approve" | "deny" | "revoke";
