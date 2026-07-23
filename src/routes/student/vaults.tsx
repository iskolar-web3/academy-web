import { createFileRoute } from "@tanstack/react-router";
import { VaultAccessRequests } from "#/components/vault/VaultAccessRequests";
import { VaultManager } from "#/components/vault/VaultManager";
import { useMyVaults } from "#/hooks/vault/useVault";
import { useMyVaultAccessRequests } from "#/hooks/vault/useVaultAccess";

/**
 * Pitch vaults (STU-17/18) — a 1:1 port of the design-template STUDENT VAULTS: two
 * columns, "Your vaults" and "Access requests".
 */
export const Route = createFileRoute("/student/vaults")({
	component: StudentVaults,
});

function StudentVaults() {
	const { data: vaults = [], isLoading: vaultsLoading } = useMyVaults();
	const { data: requests = [], isLoading: requestsLoading } =
		useMyVaultAccessRequests();

	return (
		<div className="mx-auto max-w-[1100px]">
			<h1 className="mb-1.5 text-[30px] text-action">Pitch vaults</h1>
			<p className="mb-7 max-w-[720px] text-[15px] leading-[1.55] text-content-soft">
				A private deck, financials, and cap table per project, stored in the
				Lumen document vault. Locked by default, you control who opens the door
				and for how long.
			</p>
			<div className="grid grid-cols-1 items-start gap-[22px] lg:grid-cols-2">
				<div>
					<div className="mb-3 text-[13px] text-content-heading">
						Your vaults
					</div>
					{vaultsLoading ? (
						<p className="text-content-soft">Loading…</p>
					) : (
						<VaultManager vaults={vaults} />
					)}
				</div>
				<div>
					<div className="mb-3 text-[13px] text-content-heading">
						Access requests
					</div>
					{requestsLoading ? (
						<p className="text-content-soft">Loading…</p>
					) : (
						<VaultAccessRequests requests={requests} />
					)}
				</div>
			</div>
		</div>
	);
}
