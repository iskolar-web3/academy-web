import { useEffect, useRef, useState } from "react";

interface Step {
	n: string;
	title: string;
	body: string;
}

const STEPS: Step[] = [
	{
		n: "01",
		title: "Submit your work",
		body: "Add a live demo, public repository, and project details. Declare ownership and attach any required supporting document.",
	},
	{
		n: "02",
		title: "Get reviewed",
		body: "Academy reviews your demo, repository, and project details. If changes are requested, update and resubmit.",
	},
	{
		n: "03",
		title: "Reach supporters",
		body: "Approved projects appear in Discover, where signed-in sponsors can explore your work and express interest.",
	},
];

/**
 * Scrollytelling: the heading + progress rail stay pinned (CSS sticky) while the step
 * holding the middle band of the viewport is lit and the others dim. Reduced motion (and
 * mobile, via CSS) keeps every step lit.
 */
export function HowItWorks() {
	const listRef = useRef<HTMLOListElement>(null);
	const [current, setCurrent] = useState(1);
	const [allLit, setAllLit] = useState(false);

	useEffect(() => {
		const list = listRef.current;
		if (!list) {
			return;
		}
		if (
			window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
			!("IntersectionObserver" in window)
		) {
			setAllLit(true);
			return;
		}
		const steps = [...list.querySelectorAll("[data-step]")];
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setCurrent(steps.indexOf(entry.target) + 1);
					}
				}
			},
			{ rootMargin: "-45% 0px -45% 0px" },
		);
		for (const step of steps) {
			io.observe(step);
		}
		return () => io.disconnect();
	}, []);

	return (
		<section
			className="section ground-paper"
			id="how"
			aria-labelledby="how-title"
		>
			<div className="wrap process-grid" data-current={current}>
				<div className="process-aside">
					<div className="rail" aria-hidden="true">
						<span className="rail-fill" />
					</div>
					<div className="head">
						<span className="rule reveal" />
						<h2 id="how-title" className="display reveal">
							How projects get published
						</h2>
						<p className="counter" aria-hidden="true">
							<b>{String(current).padStart(2, "0")}</b> /{" "}
							{String(STEPS.length).padStart(2, "0")}
						</p>
					</div>
				</div>
				<ol className="steps" ref={listRef}>
					{STEPS.map((step, i) => (
						<li
							key={step.n}
							className={allLit || current === i + 1 ? "step active" : "step"}
							data-step
						>
							<span className="num" aria-hidden="true">
								{step.n}
							</span>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
