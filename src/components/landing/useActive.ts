import { type RefObject, useEffect, useState } from "react";

/** Tracks whether `ref` is on screen (with an optional `rootMargin` buffer). */
export function useInView(ref: RefObject<Element | null>, rootMargin = "0px") {
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ rootMargin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [ref, rootMargin]);
	return inView;
}

/** False while the browser tab is in the background. */
export function usePageVisible() {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const sync = () => setVisible(!document.hidden);
		sync();
		document.addEventListener("visibilitychange", sync);
		return () => document.removeEventListener("visibilitychange", sync);
	}, []);
	return visible;
}

/** A looping animation should run only while on screen and in a visible tab. */
export function useActive(ref: RefObject<Element | null>, rootMargin = "0px") {
	const inView = useInView(ref, rootMargin);
	const visible = usePageVisible();
	return inView && visible;
}

/** Live `matchMedia` result; false on the server and before mount. */
export function useMediaMatch(query: string) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia(query);
		const sync = () => setMatches(mql.matches);
		sync();
		mql.addEventListener("change", sync);
		return () => mql.removeEventListener("change", sync);
	}, [query]);
	return matches;
}
