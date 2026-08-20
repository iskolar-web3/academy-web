import { useEntitlement } from "#/hooks/subscription/useEntitlement";
import {
	useProjectVaultDocuments,
	useRequestVaultAccess,
} from "#/hooks/vault/useVaultAccess";
import { vaultDocumentUrl } from "#/lib/vault/api";
import type { VaultAccessStatus } from "#/lib/vault/model";

/**
 * Sponsor "Request vault access" (SPN-16) — the project detail's third rail button,
 * alongside the upvote + interest actions, matching the template's `vaultLabel`/`onVault`
 * pair on the same detail view-model as `interestLabel`/`onInterest` (§~1840). Alpha+
 * entitlement-gated; hidden entirely below that tier (server enforces regardless).
 */
export function VaultAccessButton({
	projectId,
	status,
}: {
	projectId: string;
	status: VaultAccessStatus;
}) {
	const entitled = useEntitlement("vaultAccess");
	const request = useRequestVaultAccess();
	const { data: docs = [] } = useProjectVaultDocuments(
		projectId,
		status === "approved",
	);

	if (!entitled) return null;

	if (status === "approved") {
		return (
			<div className="mt-2.5 rounded-[10px] border border-success-bd bg-success-bg p-3.5">
				<div className="mb-2 text-[13px] text-success">
					🔓 Vault access granted
				</div>
				{docs.length === 0 ? (
					<p className="text-[12.5px] text-content-soft">No documents yet.</p>
				) : (
					<div className="flex flex-col gap-1.5">
						{docs.map((d) => (
							<a
								key={d.id}
								href={vaultDocumentUrl(projectId, d.id)}
								target="_blank"
								rel="noreferrer"
								className="text-[13px] text-action underline"
							>
								{d.label}
							</a>
						))}
					</div>
				)}
			</div>
		);
	}

	if (status === "requested") {
		return (
			<button
				type="button"
				disabled
				className="mt-2.5 h-11 w-full rounded-[10px] border border-line bg-surface-card text-[14px] text-content-ghost"
			>
				⏳ Access requested
			</button>
		);
	}

	return (
		<button
			type="button"
			disabled={request.isPending}
			onClick={() => request.mutate(projectId)}
			className="mt-2.5 h-11 w-full rounded-[10px] border border-line bg-surface-card text-[14px] text-action transition-colors hover:bg-surface-sunken disabled:opacity-60"
		>
			Request vault access
		</button>
	);
}
