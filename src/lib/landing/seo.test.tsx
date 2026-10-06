// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LandingFaq } from "#/components/landing/LandingFaq";
import { landingHead, serializeStructuredData } from "./seo";

describe("landing search content", () => {
	it("includes every structured answer in the FAQ HTML without JavaScript", () => {
		const page = new DOMParser().parseFromString(
			renderToStaticMarkup(<LandingFaq />),
			"text/html",
		);
		const data = JSON.parse(landingHead.scripts[0].children);
		const faq = data["@graph"].find(
			(node: { "@type": string }) => node["@type"] === "FAQPage",
		);
		expect(faq.mainEntity.length).toBeGreaterThan(0);
		expect(page.querySelectorAll("details")).toHaveLength(
			faq.mainEntity.length,
		);
		for (const question of faq.mainEntity) {
			const id = new URL(question["@id"]).hash.slice(1);
			const answer = page.getElementById(id);
			expect(answer?.querySelector("summary h3")?.textContent).toBe(
				question.name,
			);
			expect(answer?.querySelector("p")?.textContent).toBe(
				question.acceptedAnswer.text,
			);
		}
	});

	it("keeps HTML in future content from terminating the structured-data script", () => {
		const value = { text: '</script><script>alert("test")</script>' };
		const serialized = serializeStructuredData(value);
		expect(serialized).not.toContain("<");
		expect(JSON.parse(serialized)).toEqual(value);
		const page = new DOMParser().parseFromString(
			`<script type="application/ld+json">${serialized}</script>`,
			"text/html",
		);
		expect(page.scripts).toHaveLength(1);
	});
});
