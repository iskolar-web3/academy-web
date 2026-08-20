import { Check } from "lucide-react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Design-template TOAST on sonner — top-right under the 66px header (84/24 offset),
 * white card on the line border, 14px radius, the template's 16/40 shadow, green ✓.
 * Light-only (no next-themes): the app ships a single light theme.
 */
const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			position="top-right"
			offset={{ top: 84, right: 24 }}
			mobileOffset={{ top: 84, right: 16, left: 16 }}
			icons={{
				success: <Check className="size-[18px] text-success" aria-hidden />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"!rounded-[14px] !border-line !bg-surface-overlay !px-[18px] !py-3.5 !shadow-[0_16px_40px_rgba(31,42,82,0.16)]",
					title: "!font-normal !text-[14.5px] !text-content",
				},
			}}
			style={
				{
					"--normal-bg": "var(--color-surface-overlay)",
					"--normal-text": "var(--color-content)",
					"--normal-border": "var(--color-line)",
					"--border-radius": "14px",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
