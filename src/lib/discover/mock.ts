import type { ProjectCardData } from "#/components/project/ProjectCard";
import type { Category, Project } from "#/lib/project/model";

/**
 * Placeholder content lifted from the design template (design-template/iskolar-academy).
 * Used to make the landing feel like the real product while the backend is unbuilt.
 * Replace with real `lib/discover` queries in P3 — the shapes intentionally mirror the
 * planned Academy data model (project / grant / notification).
 *
 * Everything here is deterministic (no Date/Math.random) so SSR and client agree.
 */

export interface MockProject {
	id: string;
	title: string;
	category: string;
	type: "idea" | "thesis";
	school: string;
	region: string;
	upvotes: number;
	verified: boolean;
	trending: boolean;
	/** Days since published — used only to sort "recent". */
	days: number;
	hue: number;
	pitch: string;
	purpose: string;
	tech: string[];
	members: { initials: string; name: string; role: string; skills: string[] }[];
}

export interface MockGrant {
	id: string;
	title: string;
	category: string;
	tech: string[];
	purpose: string;
	target: number;
	raised: number;
	backers: number;
	status: "open" | "funded";
	days: number;
	members: { initials: string; name: string }[];
}

export interface MockActivity {
	id: string;
	icon: string;
	text: string;
	when: string;
}

/** Cover gradient derived from a hue (deterministic — mirrors the template's helper). */
function cover(hue: number): string {
	const h = 208 + (Math.abs(hue) % 42);
	const l = 41 + (Math.abs(hue) % 4) * 3;
	return `linear-gradient(135deg,hsl(${h},48%,${l}%),hsl(${h + 16},62%,64%))`;
}

export function fmtPeso(n: number): string {
	return `₱${n.toLocaleString("en-US")}`;
}

export const MOCK_PROJECTS: MockProject[] = [
	{
		id: "p1",
		title: "AralBot",
		category: "EdTech",
		type: "thesis",
		school: "UP Diliman",
		region: "NCR",
		upvotes: 342,
		verified: true,
		trending: true,
		days: 1,
		hue: 228,
		pitch:
			"A pocket AI tutor that runs fully offline, adapting lessons to each learner without needing the internet.",
		purpose:
			"Bring adaptive tutoring to public-school classrooms in areas without reliable connectivity.",
		tech: ["React Native", "TFLite", "SQLite", "Python"],
		members: [
			{
				initials: "JR",
				name: "Jasmine Reyes",
				role: "Lead · ML",
				skills: ["Machine Learning", "Mobile"],
			},
			{
				initials: "MD",
				name: "Mark Dela Cruz",
				role: "Member · UX",
				skills: ["Android", "UX Design"],
			},
		],
	},
	{
		id: "p2",
		title: "TindaLink",
		category: "FinTech",
		type: "idea",
		school: "DLSU",
		region: "NCR",
		upvotes: 218,
		verified: true,
		trending: true,
		days: 2,
		hue: 255,
		pitch:
			"A micro-lending and inventory ledger for sari-sari stores, built around how neighborhood stores actually operate.",
		purpose:
			"Give informal retailers a credit history and cash-flow tools banks ignore.",
		tech: ["Next.js", "Supabase", "TypeScript"],
		members: [
			{
				initials: "AB",
				name: "Anton Bautista",
				role: "Lead · Full-stack",
				skills: ["React", "Node"],
			},
			{
				initials: "CL",
				name: "Carla Lim",
				role: "Member · Finance",
				skills: ["Modeling", "Research"],
			},
		],
	},
	{
		id: "p3",
		title: "HirayaHealth",
		category: "HealthTech",
		type: "thesis",
		school: "Ateneo de Manila",
		region: "NCR",
		upvotes: 301,
		verified: false,
		trending: false,
		days: 3,
		hue: 200,
		pitch:
			"Community health-worker companion that triages symptoms and routes patients to the nearest open clinic.",
		purpose: "Cut referral delays in rural barangay health stations.",
		tech: ["Flutter", "FastAPI", "PostgreSQL"],
		members: [
			{
				initials: "PS",
				name: "Patricia Santos",
				role: "Lead · Mobile",
				skills: ["Flutter", "Health UX"],
			},
		],
	},
	{
		id: "p4",
		title: "AniMetrics",
		category: "AgriTech",
		type: "idea",
		school: "USC Cebu",
		region: "Region VII",
		upvotes: 176,
		verified: false,
		trending: false,
		days: 4,
		hue: 150,
		pitch:
			"Drone + computer-vision crop-stress mapping that tells smallholder farmers exactly where to irrigate.",
		purpose:
			"Reduce water waste and crop loss for rice farmers on tight margins.",
		tech: ["Python", "OpenCV", "PyTorch"],
		members: [
			{
				initials: "RG",
				name: "Rico Gomez",
				role: "Lead · CV",
				skills: ["Computer Vision", "Drones"],
			},
			{
				initials: "NV",
				name: "Nadia Villar",
				role: "Member · Agronomy",
				skills: ["Agronomy", "Data"],
			},
		],
	},
	{
		id: "p5",
		title: "WattWatch",
		category: "CleanTech",
		type: "thesis",
		school: "Mapúa",
		region: "NCR",
		upvotes: 264,
		verified: true,
		trending: true,
		days: 5,
		hue: 36,
		pitch:
			"Plug-level energy monitor and dashboard that nudges households toward off-peak usage automatically.",
		purpose:
			"Lower electricity bills and grid strain through behavioral nudges.",
		tech: ["ESP32", "React", "InfluxDB"],
		members: [
			{
				initials: "KT",
				name: "Kevin Tan",
				role: "Lead · IoT",
				skills: ["Embedded", "React"],
			},
		],
	},
	{
		id: "p6",
		title: "LexiSign",
		category: "AI/ML",
		type: "thesis",
		school: "UP Diliman",
		region: "NCR",
		upvotes: 289,
		verified: true,
		trending: false,
		days: 6,
		hue: 280,
		pitch:
			"Real-time Filipino Sign Language to text translator running on a phone camera.",
		purpose: "Make everyday transactions accessible for the Deaf community.",
		tech: ["MediaPipe", "TFLite", "Swift"],
		members: [
			{
				initials: "GM",
				name: "Gabby Mendoza",
				role: "Lead · ML",
				skills: ["ML", "Accessibility"],
			},
			{
				initials: "JF",
				name: "Jules Fernandez",
				role: "Member · iOS",
				skills: ["Swift", "UX"],
			},
		],
	},
	{
		id: "p7",
		title: "BarangayDesk",
		category: "Civic",
		type: "idea",
		school: "PUP Manila",
		region: "NCR",
		upvotes: 142,
		verified: false,
		trending: false,
		days: 7,
		hue: 212,
		pitch:
			"A digital queue + document-request system for barangay halls, killing the paper backlog.",
		purpose:
			"Cut the hours residents lose waiting for clearances and certificates.",
		tech: ["Laravel", "Vue", "MySQL"],
		members: [
			{
				initials: "EM",
				name: "Ella Marquez",
				role: "Lead · Full-stack",
				skills: ["Laravel", "Vue"],
			},
		],
	},
	{
		id: "p8",
		title: "CoralCount",
		category: "CleanTech",
		type: "thesis",
		school: "Silliman Univ.",
		region: "Region VII",
		upvotes: 198,
		verified: false,
		trending: false,
		days: 9,
		hue: 178,
		pitch:
			"Underwater image pipeline that automates coral-reef health surveys for marine biology teams.",
		purpose: "Speed up reef monitoring so conservation can react in time.",
		tech: ["Python", "PyTorch", "QGIS"],
		members: [
			{
				initials: "DM",
				name: "Diego Morales",
				role: "Lead · CV",
				skills: ["CV", "Marine Sci"],
			},
		],
	},
];

export const MOCK_GRANTS: MockGrant[] = [
	{
		id: "g1",
		title: "PalayGuard: rice blast early-warning",
		category: "AgriTech",
		tech: ["IoT", "TinyML", "LoRa"],
		purpose:
			"Field sensors that warn farmers of fungal outbreaks days earlier.",
		target: 180000,
		raised: 118500,
		backers: 14,
		status: "open",
		days: 12,
		members: [{ initials: "LR", name: "Lara Reyes" }],
	},
	{
		id: "g2",
		title: "SignBridge: FSL classroom captioning",
		category: "EdTech",
		tech: ["ML", "Web"],
		purpose: "Live caption + sign overlay for inclusive lectures.",
		target: 120000,
		raised: 120000,
		backers: 21,
		status: "funded",
		days: 0,
		members: [{ initials: "JC", name: "Jon Cruz" }],
	},
	{
		id: "g3",
		title: "AquaPure: solar water purifier thesis",
		category: "CleanTech",
		tech: ["Hardware", "Solar"],
		purpose: "Low-cost UV+solar purifier for off-grid coastal towns.",
		target: 240000,
		raised: 62000,
		backers: 9,
		status: "open",
		days: 20,
		members: [{ initials: "MP", name: "Mia Pascual" }],
	},
	{
		id: "g4",
		title: "MediQ: barangay clinic triage",
		category: "HealthTech",
		tech: ["Mobile", "FastAPI"],
		purpose: "Symptom triage tool for community health workers.",
		target: 150000,
		raised: 34500,
		backers: 6,
		status: "open",
		days: 28,
		members: [{ initials: "RT", name: "Raul Tan" }],
	},
];

export const MOCK_ACTIVITY: MockActivity[] = [
	{ id: "a1", icon: "♥", text: "AralBot crossed 340 upvotes", when: "2h" },
	{
		id: "a2",
		icon: "✦",
		text: "SignBridge grant reached its target",
		when: "5h",
	},
	{ id: "a3", icon: "◉", text: "WattWatch published a new demo", when: "1d" },
	{
		id: "a4",
		icon: "»",
		text: "A sponsor showed interest in LexiSign",
		when: "1d",
	},
];

/**
 * Adapt a showcase `MockProject` to the full `Project` shape the design-template PROJECT
 * DETAIL (`ProjectDetailView`) renders. Gallery projects are published; the MVP links aren't
 * in the mock (real data + links land in P3), so they read empty here.
 */
export function mockToProject(m: MockProject): Project {
	return {
		id: m.id,
		title: m.title,
		category: m.category as Category,
		type: m.type === "thesis" ? "thesis_capstone" : "idea",
		pitch: m.pitch,
		purpose: m.purpose,
		tech: m.tech,
		links: { demo: "", repo: "", video: "" },
		status: "published",
		isTeam: m.members.length > 1,
		members: m.members.map((mem, i) => ({
			id: `${m.id}-m${i}`,
			name: mem.name,
			contribution: mem.role,
			linkedUserId: null,
			consent: "accepted" as const,
		})),
		ownership: { declared: true, thesisPaperName: null },
		returnedNote: null,
		updatedDays: m.days,
		upvotes: m.upvotes,
		hue: m.hue,
		school: m.school,
	};
}

/** Card view-model for a project (what ProjectCard renders). */
export function toProjectCard(p: MockProject): ProjectCardData {
	return {
		id: p.id,
		title: p.title,
		category: p.category,
		pitch: p.pitch,
		school: p.school,
		upvotes: p.upvotes,
		verified: p.verified,
		cover: cover(p.hue),
	};
}

/** Most-recent-first cards (for the landing teaser + P3 "Newest" sort). */
export const RECENT_PROJECT_CARDS: ProjectCardData[] = [...MOCK_PROJECTS]
	.sort((a, b) => a.days - b.days)
	.map(toProjectCard);
