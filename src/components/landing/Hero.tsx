import { type CSSProperties, useEffect, useRef } from "react";
import { HeroDrift } from "#/components/landing/HeroDrift";
import { SignInPopover } from "#/components/landing/SignInPopover";

/** The visible artwork of logo-academy.svg is ~66.5% of its square box, centred. */
const MARK_ART_HALF = 0.3325;

/**
 * Centres the A mark inside the carousel band (desktop). The band starts just right of
 * the widest text line that shares the A's height (+ --drift-gap); the A moves to the
 * middle of [band start, viewport edge] so the card area left and right of it matches
 * --card-side-1440 / --card-side-1920 (interpolated by viewport width). Text always
 * wins: nothing slides under the headline, description or buttons.
 */
function layoutHero(hero: HTMLElement, markImg: HTMLImageElement) {
	hero.style.removeProperty("--drift-left");
	hero.style.setProperty("--mark-shift", "0px");
	if (window.innerWidth < 768) {
		return;
	}
	const h = hero.getBoundingClientRect();
	const img = markImg.getBoundingClientRect();
	const artHalf = img.height * MARK_ART_HALF;
	const cx = img.left + img.width / 2;
	const top = img.top + img.height * 0.17;
	const bottom = img.bottom - img.height * 0.17;
	const cs = getComputedStyle(hero);
	const gap = Number.parseFloat(cs.getPropertyValue("--drift-gap")) || 24;
	let textRight = 0;
	for (const el of hero.querySelectorAll(
		"h1 .line, .hero-copy p, .hero-ctas",
	)) {
		// A Range gives the inked line boxes, not the block's full width.
		const range = document.createRange();
		range.selectNodeContents(el);
		for (const r of range.getClientRects()) {
			if (r.bottom > top && r.top < bottom) {
				textRight = Math.max(textRight, r.right);
			}
		}
	}
	textRight += gap;
	const w1 = Number.parseFloat(cs.getPropertyValue("--card-side-1440")) || 150;
	const w2 = Number.parseFloat(cs.getPropertyValue("--card-side-1920")) || 225;
	const side = Math.max(
		40,
		w1 + (window.innerWidth - 1440) * ((w2 - w1) / 480),
	);
	let target = h.right - side - artHalf;
	let start = target - artHalf - side;
	if (start < textRight) {
		start = textRight;
		target = (textRight + h.right) / 2;
	}
	hero.style.setProperty("--mark-shift", `${Math.round(target - cx)}px`);
	hero.style.setProperty("--drift-left", `${Math.round(start - h.left)}px`);
}

export function Hero() {
	const heroRef = useRef<HTMLElement>(null);
	const markRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const hero = heroRef.current;
		const mark = markRef.current;
		if (!hero || !mark) {
			return;
		}
		const layout = () => layoutHero(hero, mark);
		const relayout = () => requestAnimationFrame(layout);
		const ro = new ResizeObserver(layout);
		ro.observe(hero);
		document.fonts?.ready.then(layout);
		// The dev tweak panel's sliders change the inputs to this layout.
		document.addEventListener("input", relayout);
		// The carousel only animates while the hero is on screen.
		const io = new IntersectionObserver(([entry]) => {
			hero.classList.toggle("paused", !entry.isIntersecting);
		});
		io.observe(hero);
		return () => {
			ro.disconnect();
			io.disconnect();
			document.removeEventListener("input", relayout);
		};
	}, []);

	return (
		<section
			ref={heroRef}
			id="hero"
			className="hero ground-canvas"
			aria-labelledby="hero-title"
		>
			<div className="hero-dots" aria-hidden="true" />
			<HeroDrift />
			<div className="wrap">
				<div>
					<h1 id="hero-title">
						<span className="line reveal" style={{ "--i": 0 } as CSSProperties}>
							Student projects,
						</span>
						<span className="line reveal" style={{ "--i": 1 } as CSSProperties}>
							Student Talent
						</span>
						<span className="line reveal" style={{ "--i": 2 } as CSSProperties}>
							Built to be{" "}
							<span className="pill">
								<span>seen.</span>
							</span>
						</span>
					</h1>
					<div className="hero-copy">
						<p>
							Academy by <a href="https://iskolar.io">iSkolar</a> is a student
							project showcase where students share working projects, thesis
							papers, grant proposals and sponsors discover student talent, or
							support the next big idea.
						</p>
						<div className="hero-ctas">
							<SignInPopover>
								<button type="button" className="lp-btn lp-btn-primary">
									Get started
								</button>
							</SignInPopover>
							<a href="#recent-projects" className="lp-btn lp-btn-secondary">
								See recent projects
							</a>
						</div>
					</div>
				</div>
				<div className="hero-mark reveal" style={{ "--i": 3 } as CSSProperties}>
					<img
						ref={markRef}
						src="/logo-academy.svg"
						alt=""
						width={600}
						height={600}
					/>
				</div>
			</div>
		</section>
	);
}
