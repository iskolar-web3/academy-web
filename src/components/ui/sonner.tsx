import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "#/lib/toast";
import { cn } from "#/lib/utils";

// Same Heroicons 2 solid paths as iSkolar's HiCheckCircle/HiXCircle.
// See toast-icons.LICENSE for the upstream MIT license.
const CHECK_CIRCLE =
	"M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z";
const X_CIRCLE =
	"M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z";

export function Toaster() {
	const state = useToastStore();
	const success = state?.type === "success";

	// Match iSkolar's Toast.tsx, including its info/warning error treatment.
	// Explicit colors/radius preserve its theme without changing Academy's tokens.
	return (
		<AnimatePresence>
			{state?.visible ? (
				<motion.div
					initial={{ opacity: 0, x: 500 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 500 }}
					transition={{ type: "spring", stiffness: 800, damping: 28 }}
					role={state.type === "error" ? "alert" : "status"}
					className={cn(
						"fixed top-4 right-4 z-[1000] flex h-[50px] w-[350px] items-center justify-end rounded-[10px] shadow-lg md:top-6 md:h-[60px] md:w-[360px]",
						success
							? "bg-[#31d0aa]"
							: "bg-[#ef4444] dark:bg-[oklch(0.396_0.141_25.723)]",
					)}
				>
					<div className="flex h-[50px] w-[346px] items-center gap-3 rounded-[10px] bg-[#f0f7ff] px-3 py-2 opacity-80 md:h-[60px] md:w-[354px] dark:bg-[#0e0e2c]">
						<div className="flex items-center justify-center">
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
								className={cn(
									"size-8 sm:size-9 lg:size-10",
									success
										? "text-[#31d0aa]"
										: "text-[#ef4444] dark:text-[oklch(0.396_0.141_25.723)]",
								)}
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d={success ? CHECK_CIRCLE : X_CIRCLE}
								/>
							</svg>
						</div>
						<div className="flex-1 text-left text-[#111827] dark:text-[oklch(0.985_0_0)]">
							<p className="text-sm leading-tight md:text-base">
								{state.title}
							</p>
							<p className="text-xs leading-tight opacity-85 md:text-sm">
								{state.message}
							</p>
						</div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
