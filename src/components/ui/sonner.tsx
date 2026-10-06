import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useToastStore } from "#/lib/toast";

const tones = {
	success: { border: "bg-[#31d0aa]", icon: "bg-[#31d0aa]" },
	error: { border: "bg-[#ef4444]", icon: "bg-[#ef4444]" },
	warning: { border: "bg-warning", icon: "bg-warning" },
	info: { border: "bg-info", icon: "bg-info" },
} as const;

export function Toaster() {
	const state = useToastStore();

	return (
		<AnimatePresence>
			{state?.visible ? (
				<motion.div
					key={state.id}
					initial={{ opacity: 0, x: 500 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 500 }}
					transition={{ type: "spring", stiffness: 800, damping: 28 }}
					role={state.type === "error" ? "alert" : "status"}
					className={`fixed right-4 bottom-4 z-[1000] flex min-h-[50px] w-[min(350px,calc(100vw-2rem))] items-center rounded-lg shadow-lg md:right-6 md:bottom-6 md:min-h-[60px] md:w-[360px] ${tones[state.type].border}`}
				>
					<div className="m-px flex min-h-[48px] w-full items-center gap-3 rounded-lg bg-background/80 px-3 py-2 text-left md:min-h-[58px]">
						<span
							className={`flex size-9 flex-none items-center justify-center rounded-full text-white ${tones[state.type].icon}`}
							aria-hidden="true"
						>
							{state.type === "success" ? (
								<Check className="size-6" />
							) : state.type === "error" ? (
								<X className="size-6" />
							) : state.type === "warning" ? (
								<TriangleAlert className="size-5" />
							) : (
								<Info className="size-5" />
							)}
						</span>
						<div className="min-w-0 flex-1 text-content-heading">
							<p className="text-sm leading-tight md:text-base">
								{state.title}
							</p>
							{state.message ? (
								<p className="mt-0.5 text-xs leading-tight opacity-85 md:text-sm">
									{state.message}
								</p>
							) : null}
						</div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
