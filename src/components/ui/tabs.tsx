import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "#/lib/utils";

/**
 * Design-template tab rail on Radix Tabs (arrow-key nav, aria-selected). Restyled to the
 * admin console's rail: transparent list, 10px-radius triggers, `#e3ebfb` + action-blue
 * active state. Orientation/layout (the sticky 220px sidebar vs a mobile row) is set at
 * the call site via `className`.
 */

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn("flex gap-1.5", className)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"cursor-pointer justify-start rounded-[10px] px-3.5 py-2.5 text-left text-[14.5px] text-content-muted outline-none transition-colors hover:bg-surface-tint focus-visible:ring-2 focus-visible:ring-action/40 data-[state=active]:bg-[#e3ebfb] data-[state=active]:text-action",
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
