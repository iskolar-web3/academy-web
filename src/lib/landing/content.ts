/** Shared by the visible FAQ and its structured data so answers cannot drift. */
export const ACADEMY_URL = "https://academy.iskolar.io/";
export const LANDING_TITLE =
	"Academy by iSkolar | Student Projects & Thesis Proposals";
export const LANDING_DESCRIPTION =
	"Showcase student projects, share thesis grant proposals, connect with sponsors, and find technology business incubators in the Philippines on Academy by iSkolar.";
export const ACADEMY_SUMMARY =
	"Academy by iSkolar is a student project showcase where students share working projects and thesis grant proposals, and sponsors discover student talent.";

export const LANDING_FAQS = [
	{
		id: "what-is-academy",
		question: "What is Academy by iSkolar?",
		answer: ACADEMY_SUMMARY,
	},
	{
		id: "who-can-use-academy",
		question: "Who can use Academy?",
		answer:
			"Academy is for students who want to showcase their work and sponsors who want to discover student projects. Visitors can view recent project previews and explore the Philippine technology business incubator directory. Sign in and complete your profile to use the student or sponsor features.",
	},
	{
		id: "submit-a-project",
		question: "How do I submit a student project to Academy?",
		answer:
			"Sign in, choose the student role, and create a project from your dashboard. Add a working live demo, a public repository, and project details. Declare ownership, attach any supporting document required for your project type, and submit for review. A video walkthrough is optional.",
	},
	{
		id: "project-review",
		question: "Are projects reviewed before they appear in Discover?",
		answer:
			"Yes. Academy reviews your demo, repository, and project details before publication. If changes are requested, you can update your submission and resubmit it. Approved projects appear in Discover for signed-in users to explore.",
	},
	{
		id: "thesis-grant-proposals",
		question:
			"Can I share a thesis grant proposal without a published project?",
		answer:
			"Yes. Thesis grant proposals are separate from project submissions. Students can submit a proposal PDF, describe its purpose, and set a funding target without first publishing a project. There is no application fee to post a proposal.",
	},
	{
		id: "funding-and-sponsor-interest",
		question:
			"Does publishing on Academy guarantee funding or sponsor interest?",
		answer:
			"No. Publishing a project or thesis grant proposal helps others discover your work, but it does not guarantee funding, sponsorship, or a partnership. A funding target describes the support you are seeking; it is not a funding commitment.",
	},
	{
		id: "connect-with-sponsors",
		question: "How do sponsors connect with student project owners?",
		answer:
			"Signed-in sponsors can search and filter the Discover showcase and express interest in a project. The project owner receives a notification and can view the sponsor's profile. Students decide whether to follow up.",
	},
	{
		id: "find-a-tbi",
		question:
			"How can I find a technology business incubator near me in the Philippines?",
		answer:
			"Use Academy's TBI map to explore listed technology business incubators in the Philippines. Choose Find TBI Near Me and allow location access, or search for a place or select a directory city. Results use approximate straight-line distances, not driving routes. Visit the incubator's linked website for its programs and application requirements.",
		link: { href: "#tbi-map", label: "Explore the Philippine TBI map" },
	},
] as const;
