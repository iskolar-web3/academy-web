import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Status card based on iSkolar's icon, title, message and colored-edge treatment.
 * Sonner keeps multiple messages accessible and handles dismissal.
 */
const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			position="bottom-right"
			offset={{ bottom: 24, right: 24 }}
			mobileOffset={{ bottom: 16, right: 16, left: 16 }}
			closeButton
			duration={4500}
			icons={{
				success: <CheckCircle2 className="size-7 text-success" aria-hidden />,
				error: <XCircle className="size-7 text-danger" aria-hidden />,
				warning: <AlertTriangle className="size-7 text-warning" aria-hidden />,
				info: <Info className="size-7 text-info" aria-hidden />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"!w-full !rounded-lg !border !border-line !border-l-4 !bg-surface-overlay !px-4 !py-3 !shadow-lg !font-sans",
					success: "!border-l-success",
					error: "!border-l-danger",
					warning: "!border-l-warning",
					info: "!border-l-info",
					title:
						"!font-normal !text-[15px] !leading-tight !text-content-heading",
					description: "!text-[13px] !leading-snug !text-content-muted",
					icon: "!mr-1 !self-center",
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
