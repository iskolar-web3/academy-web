import { useState } from "react";
import { toast } from "sonner";
import { useGrantBadge } from "#/hooks/badge/useGrantBadge";
import { useModerationProjects } from "#/hooks/review/useReviewQueue";
import {
	BADGE_KIND_LABELS,
	BADGE_KINDS,
	type BadgeKind,
} from "#/lib/badge/model";
import { validateThesisFile } from "#/utils/fileHandling";

/**
 * Admin badge grant (ADM-07) — no template screen exists for this (confirmed: the admin
 * console only has Queue/Moderation/Metrics tabs in the template). Composed here as a
 * fourth "Badges" tab, since the *source* decision (manual admin grant, v1) is already
 * settled in the plan — only the UI location needed deciding, and there's no reason to
 * block on a product ask for where a button lives.
 */
export function BadgeGrantForm() {
	const { data: projects = [] } = useModerationProjects();
	const grant = useGrantBadge();
	const [projectId, setProjectId] = useState("");
	const [kind, setKind] = useState<BadgeKind>("verified_deploy");
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	const onPick = (picked: File | undefined) => {
		if (!picked) return;
		const err = validateThesisFile(picked);
		if (err) {
			setFileError(err);
			return;
		}
		setFileError(null);
		setFile(picked);
	};

	const onGrant = () => {
		if (!projectId) {
			toast.error("Pick a project.");
			return;
		}
		if (!file) {
			toast.error("Upload evidence for the badge.");
			return;
		}
		grant.mutate(
			{ projectId, kind, file },
			{
				onSuccess: () => {
					toast.success("Verified Builder badge granted");
					setProjectId("");
					setFile(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Something went wrong.",
					),
			},
		);
	};

	return (
		<div>
			<p className="mb-6 text-[15px] text-content-soft">
				Grant an additive Verified Builder signal to a published project. Never
				a gate — ownership stays self-declared. Every grant is recorded with
				evidence.
			</p>
			<div className="card-surface flex max-w-[480px] flex-col gap-3.5 rounded-2xl p-[22px]">
				<div>
					<div className="mb-[7px] text-[13px] text-content-muted">Project</div>
					<select
						value={projectId}
						onChange={(e) => setProjectId(e.target.value)}
						className="h-[42px] w-full rounded-[10px] border border-line bg-surface-card px-3.5 text-[14.5px] text-content-heading outline-none focus:border-action"
					>
						<option value="">Select a published project…</option>
						{projects.map((p) => (
							<option key={p.id} value={p.id}>
								{p.title}
							</option>
						))}
					</select>
				</div>
				<div>
					<div className="mb-[7px] text-[13px] text-content-muted">
						Badge kind
					</div>
					<select
						value={kind}
						onChange={(e) => setKind(e.target.value as BadgeKind)}
						className="h-[42px] w-full rounded-[10px] border border-line bg-surface-card px-3.5 text-[14.5px] text-content-heading outline-none focus:border-action"
					>
						{BADGE_KINDS.map((k) => (
							<option key={k} value={k}>
								{BADGE_KIND_LABELS[k]}
							</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-3 rounded-[11px] border border-[#c3d0f2] border-dashed bg-surface-sunken p-3.5">
					<div className="flex-1">
						<div className="text-[14px] text-content-heading">
							{file?.name ?? "Evidence (PDF)"}
						</div>
						{fileError ? (
							<div className="mt-1 text-[11.5px] text-danger">{fileError}</div>
						) : null}
					</div>
					<label className="flex h-9 cursor-pointer items-center rounded-[9px] border border-line bg-surface-card px-3.5 text-[13px] text-action hover:bg-surface-sunken">
						Upload
						<input
							type="file"
							accept="application/pdf"
							className="hidden"
							onChange={(e) => onPick(e.target.files?.[0])}
						/>
					</label>
				</div>
				<button
					type="button"
					disabled={grant.isPending}
					onClick={onGrant}
					className="btn btn-primary h-11 disabled:opacity-60"
				>
					{grant.isPending ? "Granting…" : "Grant badge"}
				</button>
			</div>
		</div>
	);
}
