import { Info } from "lucide-react";
import { Tooltip } from "radix-ui";
import { useId, useState } from "react";

export function InfoTooltip({
	text,
	label = "More information",
	portal = false,
}: {
	text: string;
	label?: string;
	portal?: boolean;
}) {
	const tooltipId = useId();
	if (portal) return <DirectoryTooltip text={text} label={label} />;
	return (
		<span className="group relative inline-flex align-middle">
			<button
				type="button"
				aria-label={label}
				aria-describedby={tooltipId}
				className="inline-flex size-6 cursor-help items-center justify-center rounded-full text-content-muted transition-colors hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
			>
				<Info className="size-4" aria-hidden="true" />
			</button>
			<span
				id={tooltipId}
				role="tooltip"
				className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-lg border border-line bg-surface-card p-3 text-left text-[12px] font-normal normal-case leading-relaxed tracking-normal text-content-strong shadow-card group-hover:block group-focus-within:block sm:w-72"
			>
				{text}
			</span>
		</span>
	);
}

function DirectoryTooltip({ text, label }: { text: string; label: string }) {
	const [open, setOpen] = useState(false);
	return (
		<Tooltip.Provider delayDuration={150}>
			<Tooltip.Root open={open} onOpenChange={setOpen}>
				<Tooltip.Trigger asChild>
					<button
						type="button"
						aria-label={label}
						onClick={(event) => {
							event.preventDefault();
							setOpen(true);
						}}
						className="inline-flex size-8 shrink-0 cursor-help items-center justify-center rounded-full text-content-muted hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
					>
						<Info className="size-4" aria-hidden="true" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content
						side="bottom"
						align="end"
						sideOffset={8}
						collisionPadding={16}
						className="z-50 max-w-[min(320px,calc(100vw-32px))] rounded-xl border border-line bg-surface-card p-4 text-sm leading-relaxed text-content-strong shadow-card"
					>
						{text}
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}
