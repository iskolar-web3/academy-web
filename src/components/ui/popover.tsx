import { Popover as PopoverPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Design-template floating panel on Radix Popover (outside-click, Escape, focus
 * return, anchored positioning). Restyled to the same header-popover language as
 * DropdownMenu: 18px radius, `#e3ebfb` border, frosted white, `shadow-pop`,
 * `animate-pop-in` enter.
 */

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	sideOffset = 10,
	align = "center",
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				sideOffset={sideOffset}
				align={align}
				className={cn(
					"z-50 origin-(--radix-popover-content-transform-origin) rounded-[18px] border border-[#e3ebfb] bg-[rgba(255,255,255,0.96)] p-4 shadow-pop backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-pop-in",
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverTrigger, PopoverContent };
