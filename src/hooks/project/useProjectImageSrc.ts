import { useEffect, useState } from "react";
import { BACKEND_URL } from "#/lib/api";

/** Load a project image with the Academy session for private draft/review images. */
export function useProjectImageSrc(imageUrl?: string | null): string | null {
	const [imageSrc, setImageSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!imageUrl) {
			setImageSrc(null);
			return;
		}

		const controller = new AbortController();
		let objectUrl: string | null = null;
		fetch(`${BACKEND_URL}${imageUrl}`, {
			credentials: "include",
			signal: controller.signal,
		})
			.then((response) => (response.ok ? response.blob() : null))
			.then((blob) => {
				if (!blob || controller.signal.aborted) return;
				objectUrl = URL.createObjectURL(blob);
				setImageSrc(objectUrl);
			})
			.catch(() => {});

		return () => {
			controller.abort();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [imageUrl]);

	return imageSrc;
}
