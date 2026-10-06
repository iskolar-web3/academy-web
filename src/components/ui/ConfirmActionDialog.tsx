import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

type ConfirmActionDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	title: string;
	description: string;
	confirmLabel: string;
	reasonLabel?: string;
	busy?: boolean;
};

export function ConfirmActionDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel,
	reasonLabel,
	busy = false,
}: ConfirmActionDialogProps) {
	const [reason, setReason] = useState("");
	const close = () => {
		setReason("");
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !next && close()}>
			<DialogContent className="w-[440px] max-w-[calc(100vw-2rem)] p-6">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription className="mt-2 leading-relaxed">
					{description}
				</DialogDescription>
				{reasonLabel ? (
					<label className="mt-5 block text-[14px] text-content-heading">
						{reasonLabel}
						<textarea
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							className="mt-2 min-h-24 w-full rounded-[10px] border border-line bg-surface-card p-3 text-content outline-none focus:border-action"
							required
						/>
					</label>
				) : null}
				<div className="mt-6 flex justify-end gap-3">
					<Button variant="secondary" onClick={close} disabled={busy}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						disabled={busy || (reasonLabel !== undefined && !reason.trim())}
						onClick={() => onConfirm(reason.trim())}
					>
						{busy ? "Working…" : confirmLabel}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
