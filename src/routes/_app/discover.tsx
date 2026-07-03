import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { DiscoverCard } from "#/components/discover/DiscoverCard";
import { SponsorRail } from "#/components/discover/SponsorRail";
import { useSession } from "#/hooks/auth/useSession";
import { AcademyRole } from "#/lib/auth/model";
import { MOCK_PROJECTS } from "#/lib/discover/mock";

/**
 * Discover / showcase gallery (SPN-03) — a 1:1 port of the design-template GALLERY:
 * search + Filters (sort + category) toolbar, a result count, and the project card grid.
 * Filtering/sorting run over the mock showcase client-side (same logic as the template);
 * server-backed search + filters land in P3.
 */
export const Route = createFileRoute("/_app/discover")({
	component: Discover,
});

type Sort = "newest" | "trending" | "top";

const SORTS: { key: Sort; label: string }[] = [
	{ key: "newest", label: "Newest" },
	{ key: "trending", label: "Trending" },
	{ key: "top", label: "Top all-time" },
];

const CATEGORIES = [
	"All",
	"EdTech",
	"HealthTech",
	"AgriTech",
	"FinTech",
	"CleanTech",
	"AI/ML",
	"Civic",
];

function Discover() {
	const { role } = useSession();
	const isSponsor = role === AcademyRole.Sponsor;
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<Sort>("newest");
	const [category, setCategory] = useState("All");
	const [filterOpen, setFilterOpen] = useState(false);

	useEffect(() => {
		if (!filterOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setFilterOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [filterOpen]);

	const q = query.trim().toLowerCase();
	let projects = MOCK_PROJECTS.filter((p) => {
		if (category !== "All" && p.category !== category) return false;
		if (!q) return true;
		return `${p.title} ${p.category} ${p.school} ${p.tech.join(" ")} ${p.pitch}`
			.toLowerCase()
			.includes(q);
	});
	projects =
		sort === "trending"
			? [...projects].sort(
					(a, b) =>
						Number(b.trending) - Number(a.trending) || b.upvotes - a.upvotes,
				)
			: sort === "top"
				? [...projects].sort((a, b) => b.upvotes - a.upvotes)
				: [...projects].sort((a, b) => a.days - b.days);

	return (
		<div>
			<div className="mb-[18px] flex items-center gap-3">
				<div className="relative flex-1">
					<Search
						className="-translate-y-1/2 absolute top-1/2 left-4 size-[17px] text-content-ghost"
						aria-hidden
					/>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search projects, tech, schools…"
						className="h-[46px] w-full rounded-[13px] border border-line bg-surface-card pr-4 pl-11 text-[15px] text-content outline-none focus:border-action"
					/>
				</div>

				<div className="relative">
					<button
						type="button"
						aria-expanded={filterOpen}
						onClick={() => setFilterOpen((o) => !o)}
						className="btn btn-secondary h-[46px] rounded-[13px] transition active:scale-95"
					>
						<SlidersHorizontal className="size-4" aria-hidden /> Filters
						{category !== "All" ? (
							<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 font-mono text-[11px] text-white">
								1
							</span>
						) : null}
					</button>

					{filterOpen ? (
						<>
							<button
								type="button"
								aria-label="Close filters"
								className="fixed inset-0 z-40 cursor-default"
								onClick={() => setFilterOpen(false)}
							/>
							<div className="absolute top-[54px] right-0 z-50 w-[320px] origin-top-right animate-pop-in rounded-[18px] border border-[#e3ebfb] bg-[rgba(255,255,255,0.96)] p-[18px] shadow-pop backdrop-blur-md">
								<div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-content-ghost">
									Sort by
								</div>
								<div className="mb-[18px] flex gap-1 rounded-[12px] bg-[#e3ebfb] p-1">
									{SORTS.map((s) => (
										<button
											key={s.key}
											type="button"
											onClick={() => setSort(s.key)}
											className={`h-[34px] flex-1 rounded-[8px] font-sans text-[13.5px] transition ${
												sort === s.key
													? "bg-surface-card text-action shadow-card"
													: "text-content-soft"
											}`}
										>
											{s.label}
										</button>
									))}
								</div>

								<div className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-content-ghost">
									Category
								</div>
								<div className="flex flex-wrap gap-2">
									{CATEGORIES.map((c) => (
										<button
											key={c}
											type="button"
											onClick={() => {
												setCategory(c);
												setFilterOpen(false);
											}}
											className={`h-8 rounded-[8px] border px-[13px] font-mono text-[12px] transition ${
												category === c
													? "border-action bg-action text-white"
													: "border-line bg-surface-card text-content-muted hover:bg-surface-tint"
											}`}
										>
											{c}
										</button>
									))}
								</div>
							</div>
						</>
					) : null}
				</div>
			</div>

			<div className="mb-[18px] flex items-center gap-3">
				<span className="font-mono text-[12.5px] text-content-faint">
					{projects.length} projects
				</span>
				{category !== "All" ? (
					<button
						type="button"
						onClick={() => setCategory("All")}
						className="inline-flex h-7 items-center gap-1.5 rounded-full border border-action bg-action px-[11px] font-mono text-[12px] text-white"
					>
						{category} <span className="opacity-80">✕</span>
					</button>
				) : null}
			</div>

			<div className="flex items-start gap-6">
				<div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-[22px]">
					{projects.map((project) => (
						<DiscoverCard key={project.id} project={project} />
					))}
				</div>
				{isSponsor ? <SponsorRail /> : null}
			</div>
		</div>
	);
}
