import {
	ACADEMY_SUMMARY,
	ACADEMY_URL,
	LANDING_DESCRIPTION,
	LANDING_FAQS,
	LANDING_TITLE,
} from "./content";

export const landingStructuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			"@id": `${ACADEMY_URL}#organization`,
			name: "Academy by iSkolar",
			alternateName: "iSkolar Academy",
			url: ACADEMY_URL,
			logo: `${ACADEMY_URL}logo-academy.png`,
			description: ACADEMY_SUMMARY,
		},
		{
			"@type": "WebSite",
			"@id": `${ACADEMY_URL}#website`,
			name: "Academy by iSkolar",
			alternateName: "Academy",
			url: ACADEMY_URL,
			inLanguage: "en",
			publisher: { "@id": `${ACADEMY_URL}#organization` },
		},
		{
			"@type": "WebPage",
			"@id": `${ACADEMY_URL}#webpage`,
			url: ACADEMY_URL,
			name: LANDING_TITLE,
			description: LANDING_DESCRIPTION,
			inLanguage: "en",
			isPartOf: { "@id": `${ACADEMY_URL}#website` },
			about: { "@id": `${ACADEMY_URL}#organization` },
			hasPart: { "@id": `${ACADEMY_URL}#faq` },
		},
		{
			"@type": "FAQPage",
			"@id": `${ACADEMY_URL}#faq`,
			url: `${ACADEMY_URL}#faq`,
			name: "Frequently asked questions about Academy",
			isPartOf: { "@id": `${ACADEMY_URL}#webpage` },
			mainEntity: LANDING_FAQS.map((faq) => ({
				"@type": "Question",
				"@id": `${ACADEMY_URL}#${faq.id}`,
				name: faq.question,
				acceptedAnswer: { "@type": "Answer", text: faq.answer },
			})),
		},
	],
};

// Escape HTML delimiters before embedding JSON in an SSR script element.
export function serializeStructuredData(value: unknown): string {
	return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const landingHead = {
	meta: [
		{ title: LANDING_TITLE },
		{ name: "description", content: LANDING_DESCRIPTION },
		{
			name: "robots",
			content: "index, follow, max-image-preview:large",
		},
		{ property: "og:title", content: LANDING_TITLE },
		{ property: "og:description", content: LANDING_DESCRIPTION },
		{ property: "og:url", content: ACADEMY_URL },
		{ property: "og:locale", content: "en_PH" },
		{ name: "twitter:title", content: LANDING_TITLE },
		{ name: "twitter:description", content: LANDING_DESCRIPTION },
	],
	links: [{ rel: "canonical", href: ACADEMY_URL }],
	scripts: [
		{
			type: "application/ld+json",
			children: serializeStructuredData(landingStructuredData),
		},
	],
};
