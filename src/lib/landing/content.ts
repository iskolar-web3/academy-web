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
			"Which technology business incubators in the Philippines does Academy work with?",
		answer:
			"Academy's TBI map shows the technology business incubators we partner with. Our current partner is the University of Makati's Center for Technology Incubation and Enterprise Development (UMak CTIED) in Makati. Visit the incubator's website for its programs and application requirements. Incubators interested in partnering can email hello@iskolar.io.",
		link: { href: "#tbi-map", label: "See the TBI map" },
	},
] as const;

export interface Partner {
	name: string;
	href: string;
	/** Alpha-trimmed PNG under public/partnerships/. */
	logo: string;
	/** Width / height of the trimmed PNG — drives equal-visual-area sizing. */
	aspect?: number;
	/** Native pixel width; caps upscaling at 1.5x. */
	nativeWidth?: number;
	/** Round seal: rendered on a light disc. */
	round?: boolean;
	/** Navy letterforms: inverted instead of flattened to white. */
	invert?: boolean;
	/**
	 * Hover/focus treatment on the navy band. true: swap the white silhouette to the
	 * original colours. false: the artwork reads poorly on navy, so it stays white and
	 * brightens + lifts instead.
	 */
	hoverColour: boolean;
}

export interface PartnerGroup {
	id: string;
	title: string;
	partners: Partner[];
}

export const PARTNER_GROUPS: PartnerGroup[] = [
	{
		id: "partners",
		title: "Our Partners",
		partners: [
			{
				name: "BYC Ventures",
				href: "https://byc.ventures",
				logo: "/partnerships/byc-ventures.png",
				aspect: 2.535,
				nativeWidth: 512,
				hoverColour: false,
			},
			{
				name: "Tutorials Dojo",
				href: "https://tutorialsdojo.com",
				logo: "/partnerships/tutorials-dojo.png",
				aspect: 3.034,
				nativeWidth: 176,
				hoverColour: true,
			},
			{
				name: "Fundr Studios",
				href: "https://fundrstudio.com/",
				logo: "/partnerships/fundr-studio.png",
				aspect: 2.349,
				nativeWidth: 1675,
				hoverColour: true,
			},
			{
				name: "Jia Talent Vault",
				href: "https://www.hellojia.ai/",
				logo: "/partnerships/jia-whitecloak.png",
				aspect: 4.15,
				nativeWidth: 664,
				hoverColour: false,
			},
		],
	},
	{
		id: "student-communities",
		title: "Student Communities",
		partners: [
			{
				name: "AWS Learning Club Heron",
				href: "https://www.facebook.com/awslearningclubheron",
				logo: "/partnerships/aws-learning-club-heron.png",
				round: true,
				hoverColour: true,
			},
			{
				name: "Tech Kubo",
				href: "https://techkubo.com/",
				logo: "/partnerships/tech-kubo.png",
				round: true,
				hoverColour: true,
			},
			{
				name: "Cryptita Plays",
				href: "https://cryptitaplays.org",
				logo: "/partnerships/cryptita-plays.png",
				round: true,
				hoverColour: true,
			},
		],
	},
	{
		id: "tbis",
		title: "University TBIs and Incubators",
		partners: [
			{
				name: "QBO Innovation Hub",
				href: "https://www.qboinnovation.com/",
				logo: "/partnerships/qbo-innovation.png",
				aspect: 2.115,
				nativeWidth: 554,
				hoverColour: false,
			},
			{
				name: "UMak CTIED",
				href: "https://www.umak.edu.ph/",
				logo: "/partnerships/ctied.png",
				aspect: 3.386,
				nativeWidth: 298,
				invert: true,
				hoverColour: false,
			},
		],
	},
];
