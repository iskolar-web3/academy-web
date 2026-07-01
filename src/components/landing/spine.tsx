/** Compact section header — a ruled tick + uppercase mono label (+ optional title). */
export function SectionHeading({
	label,
	title,
	center = false,
}: {
	label: string;
	title?: string;
	center?: boolean;
}) {
	return (
		<div
			className={center ? "flex flex-col items-center text-center" : undefined}
		>
			<span className="inline-flex items-center gap-4 font-mono text-lg font-semibold uppercase tracking-[0.22em] text-action">
				<span aria-hidden className="h-[3px] w-14 rounded-full bg-action" />
				{label}
			</span>
			{title ? (
				<h2 className="mt-3 text-3xl text-foreground md:text-4xl">{title}</h2>
			) : null}
		</div>
	);
}
