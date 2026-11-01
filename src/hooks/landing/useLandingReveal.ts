import { type RefObject, useEffect } from "react";

/**
 * Two-way, direction-aware slide reveals for every `.reveal` inside the landing root
 * (port of the approved template's shared.js). An element gets `.in` when it enters the
 * band under the 72px sticky header; it hides again only once it has fully left that
 * band, remembering the side it left by (`data-side`), so it slides back in from there.
 * Hidden states apply only after `data-js` is set here, so SSR / no-JS output stays
 * visible. Reduced motion: everything is shown at once, nothing moves.
 * `data-revealexit="off"` on the root (dev panel) turns the exit off.
 */
export function useLandingReveal(rootRef: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const root = rootRef.current;
		if (!root) {
			return;
		}
		root.dataset.js = "";
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const showAll = () => {
			for (const el of root.querySelectorAll(".reveal")) {
				el.classList.add("in");
			}
		};
		// Coalesce DOM churn (map tiles, carousel) into one scan per frame.
		let queued = 0;
		const onFrame = (scan: () => void) => () => {
			if (!queued) {
				queued = requestAnimationFrame(() => {
					queued = 0;
					scan();
				});
			}
		};
		if (reduce || !("IntersectionObserver" in window)) {
			showAll();
			const mo = new MutationObserver(onFrame(showAll));
			mo.observe(root, { childList: true, subtree: true });
			return () => {
				mo.disconnect();
				cancelAnimationFrame(queued);
			};
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLElement;
					const above =
						entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
					const side = above ? "above" : "below";
					if (entry.isIntersecting) {
						// Enter from the side it is really coming from (handles fast flings
						// that skip past the viewport without an exit event).
						if (el.dataset.side !== side && !el.classList.contains("in")) {
							el.style.transition = "none";
							el.dataset.side = side;
							void el.offsetWidth;
							el.style.transition = "";
						}
						requestAnimationFrame(() => el.classList.add("in"));
					} else if (root.dataset.revealexit !== "off") {
						el.dataset.side = side;
						el.classList.remove("in");
					}
				}
			},
			{ rootMargin: "-72px 0px -6% 0px", threshold: 0 },
		);
		const observed = new WeakSet<Element>();
		const observeAll = () => {
			for (const el of root.querySelectorAll(".reveal")) {
				if (!observed.has(el)) {
					observed.add(el);
					io.observe(el);
				}
			}
		};
		observeAll();
		// Late content (teaser cards) joins the same observer.
		const mo = new MutationObserver(onFrame(observeAll));
		mo.observe(root, { childList: true, subtree: true });
		return () => {
			mo.disconnect();
			io.disconnect();
			cancelAnimationFrame(queued);
		};
	}, [rootRef]);
}
