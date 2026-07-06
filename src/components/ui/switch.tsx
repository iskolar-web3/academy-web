import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Design-template toggle on Radix Switch (keyboard, `role="switch"`, aria-checked).
 * The exact geometry of the settings-page Toggle: 46×26 track, 20px white thumb,
 * 3px inset travelling to 23px, action-blue when checked.
 */
function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"inline-flex h-[26px] w-[46px] flex-none cursor-pointer items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-action/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-action data-[state=unchecked]:bg-line",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[23px] data-[state=unchecked]:translate-x-[3px]"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
