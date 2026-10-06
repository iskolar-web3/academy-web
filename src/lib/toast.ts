import { useSyncExternalStore } from "react";

type ToastType = "success" | "error" | "info" | "warning";
type ToastOptions = { description?: string; duration?: number };

type ToastState = {
	id: string;
	type: ToastType;
	title: string;
	message: string;
	visible: boolean;
};

let state: ToastState | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let cleanupTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) listener();
}

function show(type: ToastType, title: string, options?: ToastOptions) {
	if (dismissTimer) clearTimeout(dismissTimer);
	if (cleanupTimer) clearTimeout(cleanupTimer);

	const id = `toast-${Date.now()}-${Math.random()}`;
	state = {
		id,
		type,
		title,
		message: options?.description ?? "",
		visible: true,
	};
	notify();

	dismissTimer = setTimeout(
		() => {
			if (state?.id !== id) return;
			state = { ...state, visible: false };
			notify();
			cleanupTimer = setTimeout(() => {
				if (state?.id !== id) return;
				state = null;
				notify();
			}, 400);
		},
		options?.duration ?? (type === "error" ? 3000 : 2500),
	);
}

export const toast = {
	success: (title: string, options?: ToastOptions) =>
		show("success", title, options),
	error: (title: string, options?: ToastOptions) =>
		show("error", title, options),
	info: (title: string, options?: ToastOptions) => show("info", title, options),
	warning: (title: string, options?: ToastOptions) =>
		show("warning", title, options),
};

export function useToastStore(): ToastState | null {
	return useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		() => state,
		() => null,
	);
}
