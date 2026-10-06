import { Info } from "lucide-react";
import { useId } from "react";

export function InfoTooltip({ text }: { text: string }) {
	const tooltipId = useId();
	return (
		<span className="group relative inline-flex align-middle">
			<button
				type="button"
				aria-label="More information"
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
