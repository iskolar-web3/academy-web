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
			"Academy's TBI map lists technology business incubators across the Philippines, compiled from public DOST and host-institution information. A listing does not mean an incubator has partnered with Academy. Our current partner is the University of Makati's Center for Technology Incubation and Enterprise Development (UMak CTIED). Visit an incubator's website for its programs and application requirements. Incubators interested in partnering can email hello@iskolar.io.",
		link: { href: "#tbi-map", label: "See the TBI map" },
	},
] as const;

export interface Partner {
	name: string;
	/** Existing verified destinations only; new artwork can stand on its own. */
	href?: string;
	logo: string;
	width: number;
	height: number;
	wordmark?: boolean;
	/** Preserve internal shapes in multitone artwork on the navy background. */
	tonal?: boolean;
	/** False retains legible monochrome artwork while sharing the same hover motion. */
	hoverColour?: boolean;
	round?: boolean;
}

export const LAUNCH_PARTNERS: Partner[] = [
	{
		name: "BYC Ventures",
		href: "https://byc.ventures",
		logo: "/partnerships/byc-ventures.png",
		width: 512,
		height: 202,
		wordmark: true,
		hoverColour: false,
	},
	{
		name: "Tutorials Dojo",
		href: "https://tutorialsdojo.com",
		logo: "/partnerships/tutorials-dojo.png",
		width: 176,
		height: 58,
		wordmark: true,
	},
	{
		name: "Fundr Studios",
		href: "https://fundrstudio.com/",
		logo: "/partnerships/fundr-studio.png",
		width: 1675,
		height: 713,
		wordmark: true,
	},
	{
		name: "Jia Talent Vault",
		href: "https://www.hellojia.ai/",
		logo: "/partnerships/jia-whitecloak.png",
		width: 664,
		height: 160,
		wordmark: true,
		hoverColour: false,
	},
	{
		name: "UMak CTIED",
		href: "https://www.umak.edu.ph/",
		logo: "/partnerships/ctied.png",
		width: 298,
		height: 88,
		wordmark: true,
		tonal: true,
		hoverColour: false,
	},
	{
		name: "AWS Learning Club Heron",
		href: "https://www.facebook.com/awslearningclubheron",
		logo: "/partnerships/aws-learning-club-heron.png",
		width: 1634,
		height: 1634,
		round: true,
	},
	{
		name: "AWS Student Builder Group Tempest",
		href: "https://www.facebook.com/AWSSBG.Tempest",
		logo: "/partnerships/aws-sbg-tempest.png",
		width: 480,
		height: 480,
	},
	{
		name: "AWS Student Builder Group UPM",
		href: "https://www.facebook.com/awscc.up",
		logo: "/partnerships/aws-sbg-upm.png",
		width: 2039,
		height: 2039,
	},
	{
		name: "AWS User Group Philippines ENOV",
		href: "https://www.facebook.com/awsugenovatorsph",
		logo: "/partnerships/awsugph-enov.png",
		width: 1961,
		height: 1961,
	},
	{
		name: "Cryptita Plays",
		href: "https://cryptitaplays.org",
		logo: "/partnerships/cryptita-plays.png",
		width: 335,
		height: 360,
		round: true,
	},
	{
		name: "Tech Kubo",
		round: true,
		href: "https://techkubo.com/",
		logo: "/partnerships/tech-kubo.png",
		width: 339,
		height: 423,
	},
	{
		name: "Seekers Guild",
		href: "https://www.facebook.com/seekersguildcommunity",
		logo: "/partnerships/seekers-guild.png",
		width: 1080,
		height: 1080,
	},
	{
		name: "Startup Machine",
		href: "https://www.facebook.com/startupmachine/",
		logo: "/partnerships/startup-machine.png",
		width: 640,
		height: 480,
	},
	{
		name: "Stellar PH",
		href: "https://stellarph.io/",
		logo: "/partnerships/stellar-ph.png",
		width: 492,
		height: 492,
	},
	{
		name: "WorkFlow PH",
		href: "https://www.facebook.com/WorkFlowPH",
		logo: "/partnerships/workflow-ph.png",
		width: 480,
		height: 480,
	},
];
