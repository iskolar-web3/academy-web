import {
	ArrowUpRight,
	Check,
	Github,
	MonitorPlay,
	Play,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "#/components/ui/dialog";
import { useReviewDecision } from "#/hooks/review/useReviewDecision";
import { thesisPaperUrl } from "#/lib/project/api";
import { projectCover } from "#/lib/project/helper";
import type { Project } from "#/lib/project/model";

/**
 * Admin review modal — a 1:1 port of the design-template ADMIN REVIEW MODAL: a 680px sheet
 * with a cover banner, the submission's pitch · purpose · tech · MVP gate links · team ·
 * ownership declarations, and the three pass/fail decision actions (Reject · Return · Approve).
 * A **return** reveals an inline note field (the one interaction state the static template
 * doesn't depict) because a return is only useful with actionable feedback (ADM-04). Closes on
 * ✕ / backdrop / Escape.
 */

const TYPE_LABEL: Record<Project["type"], string> = {
	idea: "Idea / MVP",
	thesis_capstone: "Thesis / Capstone",
};

const MVP_LINKS = [
	{ key: "demo", Icon: MonitorPlay, label: "Live demo" },
	{ key: "repo", Icon: Github, label: "Repository" },
	{ key: "video", Icon: Play, label: "Demo video" },
] as const;

const eyebrowTick = <span className="h-0.5 w-5 bg-action/50" aria-hidden />;
const eyebrowText =
	"font-mono text-[11px] uppercase tracking-[0.2em] text-action/60";
const eyebrowRow = "mt-[18px] mb-2.5 flex items-center gap-2.5";

function initialsOf(name: string): string {
	const parts = name.split(/[^a-zA-Z0-9]+/).filter(Boolean);
	return (
		parts
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

export function ReviewDecisionModal({
	project,
	onClose,
}: {
	project: Project;
	onClose: () => void;
}) {
	const { decide } = useReviewDecision();
	const [returning, setReturning] = useState(false);
	const [note, setNote] = useState("");
	const [noteError, setNoteError] = useState(false);

	const links = MVP_LINKS.map((l) => ({
		...l,
		href: project.links[l.key],
	})).filter((l) => l.href);

	// mutateAsync re-throws (unlike mutate), so these chains own their catch: surface the
	// server's envelope message (409 not-reviewable / 422 note / network) and keep the
	// modal open for a retry.
	const run = async (decision: "approve" | "reject") => {
		try {
			await decide.mutateAsync({ id: project.id, input: { decision } });
			toast.success(
				decision === "approve" ? "Approved & published" : "Rejected",
			);
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong.");
		}
	};

	const confirmReturn = async () => {
		if (!note.trim()) {
			setNoteError(true);
			return;
		}
		try {
			await decide.mutateAsync({
				id: project.id,
				input: { decision: "return", note: note.trim() },
			});
			toast.success("Returned to student");
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong.");
		}
	};

	const busy = decide.isPending;

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				aria-describedby={undefined}
				overlayClassName="z-[70] backdrop-blur-[5px]"
				className="isk-scroll z-[70] max-h-[90vh] w-[680px] max-w-[calc(100vw-3rem)] overflow-auto rounded-[22px]"
			>
				{/* Cover */}
				<div
					className="relative h-[120px] rounded-t-[22px]"
					style={{ background: projectCover(project.hue) }}
				>
					<DialogClose asChild>
						<button
							type="button"
							aria-label="Close"
							className="absolute top-3.5 right-3.5 flex size-8 items-center justify-center rounded-full border-none bg-white/25 text-white backdrop-blur-[6px] transition-colors hover:bg-white/40"
						>
							<X className="size-[15px]" aria-hidden />
						</button>
					</DialogClose>
					<div className="absolute bottom-3.5 left-6 flex gap-2">
						<span className="rounded-[7px] bg-[rgba(17,24,39,0.34)] px-[11px] py-[5px] font-mono text-[12px] text-white">
							{TYPE_LABEL[project.type]}
						</span>
					</div>
				</div>

				{/* Body */}
				<div className="px-[26px] pt-[22px] pb-[26px]">
					<DialogTitle className="text-[24px]">{project.title}</DialogTitle>
					<div className="mt-1 font-mono text-[12.5px] text-content-faint">
						{project.school || "iSkolar Academy"} · submitted{" "}
						{project.updatedDays === 0
							? "today"
							: `${project.updatedDays}d ago`}
					</div>

					<div className={eyebrowRow}>
						{eyebrowTick}
						<span className={eyebrowText}>Pitch</span>
					</div>
					<div className="text-[15px] text-content-strong leading-[1.55]">
						{project.pitch || "—"}
					</div>

					<div className={eyebrowRow}>
						{eyebrowTick}
						<span className={eyebrowText}>Purpose</span>
					</div>
					<div className="border-line border-l-2 pl-3.5 text-[14.5px] text-content-strong leading-[1.6]">
						{project.purpose || "—"}
					</div>

					{project.tech.length > 0 ? (
						<>
							<div className={eyebrowRow}>
								{eyebrowTick}
								<span className={eyebrowText}>Tech stack</span>
							</div>
							<div className="flex flex-wrap gap-[7px]">
								{project.tech.map((t) => (
									<span key={t} className="chip chip--category">
										{t}
									</span>
								))}
							</div>
						</>
					) : null}

					<div className={eyebrowRow}>
						{eyebrowTick}
						<span className={eyebrowText}>MVP gate</span>
					</div>
					<div className="flex flex-col gap-2.5">
						{links.length > 0 ? (
							links.map(({ key, Icon, label, href }) => (
								<a
									key={key}
									href={href}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2.5 rounded-[10px] border border-info-bd px-[13px] py-[11px] text-[14px] text-content-heading transition-colors hover:bg-surface-sunken"
								>
									<Icon className="size-[17px] text-action" aria-hidden />
									{label}
									<ArrowUpRight className="ml-auto size-4 text-content-ghost" />
								</a>
							))
						) : (
							<p className="text-[13px] text-content-soft">No MVP links.</p>
						)}
					</div>

					{project.isTeam && project.members.length > 0 ? (
						<>
							<div className={eyebrowRow}>
								{eyebrowTick}
								<span className={eyebrowText}>Team</span>
							</div>
							<div className="flex flex-col gap-2.5">
								{project.members.map((m) => (
									<div key={m.id} className="flex items-center gap-[11px]">
										<span className="flex size-9 flex-none items-center justify-center rounded-[9px] bg-action text-[13px] text-white">
											{initialsOf(m.name)}
										</span>
										<div className="text-[14.5px] text-content-heading">
											{m.name}
											{m.contribution ? (
												<span className="text-[12.5px] text-content-faint">
													{" "}
													· {m.contribution}
												</span>
											) : null}
										</div>
									</div>
								))}
							</div>
						</>
					) : null}

					{project.ownership.declared ? (
						<div className="mt-[18px] flex flex-col gap-2">
							<div className="flex items-center gap-2.5 text-[13px] text-content-strong">
								<Check
									className="size-[19px] flex-none text-success"
									aria-hidden
								/>
								Declared original student work, properly credited &amp;
								licensed.
							</div>
							<div className="flex items-center gap-2.5 text-[13px] text-content-strong">
								<Check
									className="size-[19px] flex-none text-success"
									aria-hidden
								/>
								Consented to Academy review and public showcase.
							</div>
							{project.type === "thesis_capstone" &&
							project.ownership.thesisPaperName ? (
								<a
									href={thesisPaperUrl(project.id)}
									target="_blank"
									rel="noreferrer"
									className="text-[13px] text-action underline"
								>
									View thesis paper — {project.ownership.thesisPaperName}
								</a>
							) : null}
						</div>
					) : null}

					{/* Return note (revealed by "Return to student") */}
					{returning ? (
						<div className="mt-5 rounded-[12px] border border-line bg-surface-sunken p-3.5">
							<div className="mb-2 font-mono text-[11px] text-content-muted uppercase tracking-[0.16em]">
								Return note
							</div>
							<textarea
								value={note}
								onChange={(e) => {
									setNote(e.target.value);
									if (noteError) setNoteError(false);
								}}
								rows={3}
								placeholder="Tell the student exactly what to fix before resubmitting."
								className="w-full resize-none rounded-[10px] border border-line bg-surface-card px-[13px] py-2.5 text-[14px] text-content-heading outline-none transition-colors focus:border-action"
							/>
							{noteError ? (
								<p className="mt-1.5 text-[12.5px] text-danger">
									Add a note so the student knows what to fix.
								</p>
							) : null}
						</div>
					) : null}

					{/* Decision actions */}
					<div className="mt-6 flex gap-2.5 border-[#eef1fa] border-t pt-5">
						{returning ? (
							<>
								<Button
									variant="secondary"
									size="lg"
									disabled={busy}
									onClick={() => {
										setReturning(false);
										setNote("");
										setNoteError(false);
									}}
								>
									Cancel
								</Button>
								<Button
									size="lg"
									disabled={busy}
									onClick={confirmReturn}
									className="flex-1"
								>
									{busy ? "Returning…" : "Confirm return"}
								</Button>
							</>
						) : (
							<>
								<Button
									variant="destructive"
									size="lg"
									disabled={busy}
									onClick={() => run("reject")}
								>
									Reject
								</Button>
								<Button
									variant="secondary"
									size="lg"
									disabled={busy}
									onClick={() => setReturning(true)}
								>
									Return to student
								</Button>
								<Button
									size="lg"
									disabled={busy}
									onClick={() => run("approve")}
									className="flex-1"
								>
									{busy ? "Publishing…" : "Approve & publish"}
								</Button>
							</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
