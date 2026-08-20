import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Design-template button, encoded once as cva variants (the single source of truth for
 * button styling going forward — the legacy `.btn-*` CSS classes retire as surfaces migrate).
 * Visuals are the exact treatments the shipped surfaces already use:
 *  - `primary`     → solid action blue + the template's 6/16 action shadow
 *  - `secondary`   → white card, line border, muted text
 *  - `destructive` → white card, #f0c9cb border, danger text (the template's Reject/Unpublish)
 * Sizes map to the three heights the template uses: 36 / 42 / 46 px.
 */
const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-action/40 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				primary:
					"bg-action text-on-action shadow-[0_6px_16px_rgba(58,82,166,0.24)] hover:bg-action-hover",
				secondary:
					"border border-line bg-surface-card text-content-muted hover:bg-surface-sunken",
				destructive:
					"border border-[#f0c9cb] bg-surface-card text-danger hover:bg-danger-bg",
			},
			size: {
				sm: "h-9 rounded-[9px] px-3.5 text-[13px]",
				default: "h-[42px] rounded-[11px] px-5 text-[13.5px]",
				lg: "h-[46px] rounded-[11px] px-[18px] text-[14.5px]",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "primary",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
