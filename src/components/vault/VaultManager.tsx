import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useUploadVaultDoc } from "#/hooks/vault/useVault";
import { projectCover } from "#/lib/project/helper";
import { vaultDocumentUrl } from "#/lib/vault/api";
import type { MyVault } from "#/lib/vault/model";
import { validateThesisFile } from "#/utils/fileHandling";

/**
 * "Your vaults" (STU-17) — a 1:1 port of the design-template STUDENT VAULTS left column:
 * one card per owned project, listing its documents, each opening the stored file.
 *
 * **Correction (necessary, not depicted in the static template):** the template's static
 * view only ever shows vaults that already have documents in them — there's no "upload"
 * button rendered anywhere on this screen. But STU-17 ("set up" a vault) has to start
 * somewhere, and a vault is created implicitly by uploading its first document — so an
 * Upload action is added per project (same reasoning as `ReviewDecisionModal`'s return
 * note: functionality the mockup doesn't depict but the story requires).
 */
export function VaultManager({ vaults }: { vaults: MyVault[] }) {
	const upload = useUploadVaultDoc();

	const onPick = (projectId: string, file: File | undefined) => {
		if (!file) return;
		const err = validateThesisFile(file);
		if (err) {
			toast.error(err);
			return;
		}
		upload.mutate(
			{ projectId, file },
			{
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Upload failed."),
			},
		);
	};

	if (vaults.length === 0) {
		return (
			<div className="card-surface p-8 text-center">
				<p className="text-content-heading">No projects yet</p>
				<p className="mt-1.5 text-[14px] text-content-soft">
					Publish or draft a project to set up its pitch vault.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{vaults.map((v) => (
				<div
					key={v.projectId}
					className="card-surface overflow-hidden rounded-2xl"
				>
					<div className="flex items-center gap-3 border-[#eef1fa] border-b px-[18px] py-4">
						<span
							className="size-[38px] flex-none rounded-[11px]"
							style={{ background: projectCover(v.hue) }}
						/>
						<div className="flex-1">
							<div className="text-[16px] text-content-heading">
								{v.projectTitle}
							</div>
							<div className="font-mono text-[11.5px] text-content-faint">
								🔒 Locked · vault
							</div>
						</div>
						<label className="flex h-9 cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-action hover:bg-surface-sunken">
							<Upload className="mr-1.5 size-3.5" aria-hidden />
							Upload
							<input
								type="file"
								accept="application/pdf"
								className="hidden"
								onChange={(e) => onPick(v.projectId, e.target.files?.[0])}
							/>
						</label>
					</div>
					{v.documents.length === 0 ? (
						<p className="px-[18px] py-4 text-[13.5px] text-content-soft">
							No documents yet.
						</p>
					) : (
						<div className="p-2.5">
							{v.documents.map((d) => (
								<a
									key={d.id}
									href={vaultDocumentUrl(v.projectId, d.id)}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface-tint"
								>
									<span className="flex w-6 flex-none items-center justify-center text-[17px] text-action">
										▤
									</span>
									<div className="flex-1">
										<div className="text-[14px] text-content-heading">
											{d.label}
										</div>
										<div className="font-mono text-[11px] text-content-faint">
											{d.meta}
										</div>
									</div>
									<span className="text-content-faint">↗</span>
								</a>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
