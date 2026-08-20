import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import type * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "#/lib/utils";

/**
 * Single-date picker on `react-day-picker` — the design-template's own approach
 * (iSkolar-main's onboarding uses the same Popover + Calendar pattern, dropdown
 * month/year caption, disabled future dates) restyled to Academy's tokens instead of
 * the generic shadcn ones. Single-mode only — Academy has no range-picker use case.
 */
function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	const defaultClassNames = getDefaultClassNames();

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			captionLayout="dropdown"
			className={cn("p-3", className)}
			classNames={{
				root: cn("w-fit", defaultClassNames.root),
				months: "flex flex-col gap-4",
				month: "flex flex-col gap-3",
				nav: "flex items-center justify-between gap-1 absolute inset-x-0 top-0 px-1",
				button_previous:
					"flex size-7 items-center justify-center rounded-[8px] text-content-muted transition-colors hover:bg-surface-sunken disabled:pointer-events-none disabled:opacity-40",
				button_next:
					"flex size-7 items-center justify-center rounded-[8px] text-content-muted transition-colors hover:bg-surface-sunken disabled:pointer-events-none disabled:opacity-40",
				month_caption: "flex h-8 items-center justify-center",
				dropdowns: "flex items-center justify-center gap-1.5 text-[13.5px]",
				dropdown_root:
					"relative rounded-[8px] border border-line bg-surface-card px-1",
				dropdown: "absolute inset-0 opacity-0",
				caption_label:
					"flex items-center gap-1 text-[13.5px] text-content-heading",
				table: "w-full border-collapse",
				weekdays: "flex",
				weekday:
					"w-8 flex-1 text-center font-mono text-[10.5px] text-content-faint",
				week: "mt-1.5 flex w-full",
				day: "relative aspect-square w-8 flex-1 p-0 text-center",
				today: "rounded-full font-semibold text-action",
				selected: "",
				outside: "text-content-ghost",
				disabled: "text-content-ghost opacity-40",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ className: chevronClassName, orientation }) => {
					if (orientation === "left") {
						return (
							<ChevronLeftIcon className={cn("size-4", chevronClassName)} />
						);
					}
					if (orientation === "right") {
						return (
							<ChevronRightIcon className={cn("size-4", chevronClassName)} />
						);
					}
					return (
						<ChevronDownIcon className={cn("size-3.5", chevronClassName)} />
					);
				},
				DayButton: ({ className: dayClassName, day, modifiers, ...rest }) => (
					<button
						type="button"
						data-selected={modifiers.selected || undefined}
						data-today={modifiers.today || undefined}
						className={cn(
							"flex size-8 items-center justify-center rounded-full text-[13px] text-content transition-colors hover:bg-surface-sunken data-[today=true]:font-semibold data-[today=true]:text-action data-[selected=true]:bg-action data-[selected=true]:text-on-action data-[selected=true]:hover:bg-action-hover",
							dayClassName,
						)}
						{...rest}
					/>
				),
			}}
			{...props}
		/>
	);
}

export { Calendar };
