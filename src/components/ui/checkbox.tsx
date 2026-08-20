import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Declaration checkbox on Radix Checkbox (keyboard, aria-checked, consistent rendering
 * cross-browser). On-palette: line border on card, action-blue fill + white check when
 * checked — replaces the native checkboxes in the submit wizard's Ownership step.
 */
function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"size-4 shrink-0 cursor-pointer rounded-[4px] border border-line bg-surface-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-action/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-action data-[state=checked]:bg-action data-[state=checked]:text-white",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current"
			>
				<Check className="size-3.5" strokeWidth={3} aria-hidden />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
