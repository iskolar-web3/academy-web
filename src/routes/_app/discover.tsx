import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { StudentProfileCard } from "#/components/account/StudentProfileCard";
import { DiscoverCard } from "#/components/discover/DiscoverCard";
import { SponsorRail } from "#/components/discover/SponsorRail";
import { AdsPanel } from "#/components/layout/AdsPanel";
import { AppPageLayout } from "#/components/layout/AppPageLayout";
import { useProfilePanel } from "#/hooks/account/useProfilePanel";
import { useSession } from "#/hooks/auth/useSession";
import { useProjectGallery } from "#/hooks/discover/useProjectGallery";
import { AcademyRole } from "#/lib/auth/model";
import { GALLERY_SORTS, type GallerySort } from "#/lib/discover/model";

/**
 * Discover / showcase gallery (SPN-03/04/05) — a 1:1 port of the design-template GALLERY:
 * search + Filters (sort + category) toolbar, a result count, and the project card grid.
 * Search/filter/sort state lives in the **URL search params** (shareable, back-button
 * correct) and runs **server-side** against the published projection. Left column is
 * `SponsorRail` for sponsors or the profile panel for student/admin; right column is the
 * ad slot.
 */

type GallerySearchParams = {
	q?: string;
	category?: string;
	sort?: GallerySort;
};

export const Route = createFileRoute("/_app/discover")({
	validateSearch: (search: Record<string, unknown>): GallerySearchParams => ({
		q: typeof search.q === "string" && search.q ? search.q : undefined,
		category:
			typeof search.category === "string" && search.category
				? search.category
				: undefined,
		sort: GALLERY_SORTS.includes(search.sort as GallerySort)
			? (search.sort as GallerySort)
			: undefined,
	}),
	component: Discover,
});

const SORTS: { key: GallerySort; label: string }[] = [
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
	const panel = useProfilePanel();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const [filterOpen, setFilterOpen] = useState(false);

	const sort = search.sort ?? "newest";
	const category = search.category ?? "All";

	// Local input state debounced into the URL (the query runs off the URL, not keystrokes).
	const [query, setQuery] = useState(search.q ?? "");
	useEffect(() => {
		const t = window.setTimeout(() => {
			navigate({
				search: (prev) => ({ ...prev, q: query.trim() || undefined }),
				replace: true,
			});
		}, 300);
		return () => window.clearTimeout(t);
	}, [query, navigate]);

	const setParam = (patch: Partial<GallerySearchParams>) =>
		navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

	const gallery = useProjectGallery({
		q: search.q,
		category,
		sort,
	});
	const projects = gallery.data ?? [];

	useEffect(() => {
		if (!filterOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setFilterOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [filterOpen]);

	return (
		<AppPageLayout
			left={
				isSponsor ? (
					<SponsorRail />
				) : panel ? (
					<StudentProfileCard profile={panel} />
				) : (
					<div className="h-64 animate-pulse rounded-[18px] bg-surface-card" />
				)
			}
			right={<AdsPanel />}
		>
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
											onClick={() =>
												setParam({
													sort: s.key === "newest" ? undefined : s.key,
												})
											}
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
												setParam({
													category: c === "All" ? undefined : c,
												});
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
					{gallery.isLoading
						? "Loading projects…"
						: gallery.isError
							? "Couldn’t load the showcase."
							: `${projects.length} projects`}
				</span>
				{category !== "All" ? (
					<button
						type="button"
						onClick={() => setParam({ category: undefined })}
						className="inline-flex h-7 items-center gap-1.5 rounded-full border border-action bg-action px-[11px] font-mono text-[12px] text-white"
					>
						{category} <span className="opacity-80">✕</span>
					</button>
				) : null}
			</div>

			{!gallery.isLoading && !gallery.isError && projects.length === 0 ? (
				<div className="card-surface p-10 text-center">
					<p className="text-content-heading">No projects match</p>
					<p className="mt-1.5 text-[14px] text-content-soft">
						Try a different search or clear the category filter.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-[22px]">
					{projects.map((project) => (
						<DiscoverCard key={project.id} project={project} />
					))}
				</div>
			)}
		</AppPageLayout>
	);
}
