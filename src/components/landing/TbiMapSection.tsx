import {
	ExternalLink,
	LocateFixed,
	Mail,
	Navigation,
	Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type MapOrigin,
	TbiMapCanvas,
} from "#/components/landing/TbiMapCanvas";
import { Button } from "#/components/ui/button";
import { formatDistance, rankTbis, type Tbi } from "#/lib/tbi/directory";
import { DIRECTORY_PLACES, type Place, searchPlaces } from "#/lib/tbi/places";

const UMAK_TBI: Tbi = {
	id: "umak-ctied",
	name: "UMak Center for Technology Incubation and Enterprise Development",
	host: "University of Makati",
	city: "Makati",
	province: "Metro Manila",
	address: "University of Makati campus",
	lat: 14.5534,
	lng: 121.0565,
	url: "https://www.umak.edu.ph/",
};
const TBIS = [UMAK_TBI];

export function TbiMapSection() {
	const [origin, setOrigin] = useState<MapOrigin | null>(null);
	const [selected, setSelected] = useState<Tbi | null>(null);
	const [focus, setFocus] = useState<{ id: string; revision: number } | null>(
		null,
	);
	const [locating, setLocating] = useState(false);
	const [locationMessage, setLocationMessage] = useState("");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("");
	const [places, setPlaces] = useState<Place[]>([]);
	const [searching, setSearching] = useState(false);
	const [searchMessage, setSearchMessage] = useState("");
	const [city, setCity] = useState("");
	const requests = useRef({
		version: 0,
		lastSearch: 0,
		controller: null as AbortController | null,
	});
	const mounted = useRef(true);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			requests.current.version++;
			requests.current.controller?.abort();
		};
	}, []);
	const ranked = useMemo(
		() =>
			origin
				? rankTbis(origin, TBIS)
				: TBIS.map((tbi) => ({ tbi, distance: null })),
		[origin],
	);
	const nearest = origin ? ranked[0] : null;
	const visible = ranked.filter(({ tbi }) =>
		`${tbi.name} ${tbi.host} ${tbi.city} ${tbi.province}`
			.toLowerCase()
			.includes(filter.trim().toLowerCase()),
	);
	const selectMarker = useCallback((tbi: Tbi) => setSelected(tbi), []);

	function focusTbi(tbi: Tbi) {
		setSelected(tbi);
		setFocus((previous) => ({
			id: tbi.id,
			revision: (previous?.revision ?? 0) + 1,
		}));
	}

	function findMyLocation() {
		if (!navigator.geolocation) {
			setLocationMessage(
				"This browser doesn't support location access. Search for a place below.",
			);
			return;
		}
		requests.current.controller?.abort();
		setSearching(false);
		const version = ++requests.current.version;
		setLocating(true);
		setLocationMessage("");
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (!mounted.current || version !== requests.current.version) {
					return;
				}
				setLocating(false);
				setSelected(null);
				setFocus(null);
				setCity("");
				setPlaces([]);
				setOrigin({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					accuracy: position.coords.accuracy,
					label: "Your location",
					kind: "device",
				});
				setLocationMessage(
					position.coords.accuracy > 1000
						? "Your location is approximate. Results may change with a more accurate position."
						: "",
				);
			},
			(error) => {
				if (!mounted.current || version !== requests.current.version) {
					return;
				}
				setLocating(false);
				setLocationMessage(
					error.code === 1
						? "Location access was denied. Search or choose your city below to find nearby TBIs."
						: error.code === 3
							? "Location lookup timed out. Try again or search for your city below."
							: "Your location couldn't be determined. Search or choose a city below.",
				);
			},
			{ enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
		);
	}

	function choosePlace(place: Place) {
		requests.current.version++;
		requests.current.controller?.abort();
		setSearching(false);
		setLocating(false);
		setSelected(null);
		setFocus(null);
		setOrigin({ ...place, kind: "place" });
		setPlaces([]);
		setLocationMessage("");
	}

	async function submitSearch(event: React.FormEvent) {
		event.preventDefault();
		const value = query.trim();
		if (value.length < 2) {
			setSearchMessage("Enter at least two characters to search for a place.");
			return;
		}
		if (Date.now() - requests.current.lastSearch < 1100) {
			return;
		}
		requests.current.lastSearch = Date.now();
		requests.current.controller?.abort();
		const controller = new AbortController();
		requests.current.controller = controller;
		const version = ++requests.current.version;
		setLocating(false);
		setSearching(true);
		setPlaces([]);
		setSearchMessage("");
		const timeout = window.setTimeout(() => controller.abort(), 10000);
		try {
			const results = await searchPlaces(value, controller.signal);
			if (!mounted.current || version !== requests.current.version) {
				return;
			}
			setPlaces(results);
			setSearchMessage(
				results.length
					? "Select a place to find nearby TBIs."
					: "No Philippine places found. Try a province name or choose a directory city below.",
			);
		} catch {
			if (mounted.current && version === requests.current.version) {
				setSearchMessage(
					"Place search is unavailable. Choose a directory city below or try again.",
				);
			}
		} finally {
			window.clearTimeout(timeout);
			if (mounted.current && version === requests.current.version) {
				setSearching(false);
			}
		}
	}

	return (
		<section
			id="tbi-map"
			className="container-page py-16 sm:py-20"
			aria-labelledby="tbi-heading"
		>
			<div className="flex items-start justify-between gap-4 lg:items-end">
				<div className="max-w-2xl">
					<h2
						id="tbi-heading"
						className="text-3xl leading-tight text-foreground sm:text-4xl"
					>
						Find a Technology Business Incubator
					</h2>
					<p className="mt-2 text-base text-content-soft">
						Find how close you are to our current TBI partner.
					</p>
				</div>
			</div>

			<div className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-card shadow-card lg:grid-cols-[360px_minmax(0,1fr)]">
				<div className="flex min-w-0 flex-col border-b border-line lg:border-r lg:border-b-0">
					<div className="space-y-4 p-5 sm:p-6">
						<Button
							className="w-full"
							size="lg"
							onClick={findMyLocation}
							disabled={locating}
						>
							<LocateFixed className="size-4" aria-hidden />
							{locating ? "Finding your location…" : "Find TBI Near Me"}
						</Button>
						{locationMessage && (
							<output className="block rounded-lg bg-surface-tint p-3 text-sm text-content-strong">
								{locationMessage}
							</output>
						)}
						<form onSubmit={submitSearch} className="space-y-2">
							<label
								htmlFor="tbi-place"
								className="block text-sm text-content-strong"
							>
								Search a place
							</label>
							<div className="flex gap-2">
								<input
									id="tbi-place"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="City, municipality, or province"
									className="tbi-input min-w-0 flex-1"
									maxLength={120}
								/>
								<Button
									variant="secondary"
									type="submit"
									disabled={searching}
									aria-label="Search Philippine places"
								>
									<Search className="size-4" aria-hidden />
								</Button>
							</div>
						</form>
						{(searching || searchMessage) && (
							<output className="block text-sm text-content-soft">
								{searching ? "Searching Philippine places…" : searchMessage}
							</output>
						)}
						{places.length > 0 && (
							<ul
								className="max-h-48 overflow-y-auto rounded-lg border border-line"
								data-lenis-prevent
							>
								{places.map((place) => (
									<li key={place.id}>
										<button
											type="button"
											className="w-full p-3 text-left text-sm text-content-strong hover:bg-surface-tint focus-visible:bg-surface-tint"
											onClick={() => {
												setCity("");
												choosePlace(place);
											}}
										>
											{place.label}
										</button>
									</li>
								))}
							</ul>
						)}
						<div>
							<label htmlFor="tbi-city" className="sr-only">
								Choose a directory city
							</label>
							<select
								id="tbi-city"
								className="tbi-input w-full"
								value={city}
								onChange={(event) => {
									setCity(event.target.value);
									const place = DIRECTORY_PLACES.find(
										(item) => item.id === event.target.value,
									);
									if (place) {
										choosePlace(place);
									}
								}}
							>
								<option value="">Or choose a city</option>
								{DIRECTORY_PLACES.map((place) => (
									<option key={place.id} value={place.id}>
										{place.label}
									</option>
								))}
							</select>
						</div>
						{nearest && nearest.distance !== null && (
							<div
								className="rounded-xl border border-success-bd bg-success-bg p-4"
								aria-live="polite"
							>
								<span className="inline-flex items-center gap-2 text-sm text-success">
									<Navigation className="size-4" aria-hidden />
									Nearest listed TBI
								</span>
								<h3 className="mt-2 text-lg text-content-heading">
									{nearest.tbi.name}
								</h3>
								<p className="mt-1 text-sm text-content-strong">
									{nearest.tbi.city}, {nearest.tbi.province}
								</p>
								<p className="mt-2 text-sm text-success">
									{formatDistance(nearest.distance)}
								</p>
								<p className="mt-1 break-words text-xs text-content-soft">
									From {origin?.label}
								</p>
								<Button
									variant="secondary"
									className="mt-3 w-full"
									onClick={() => focusTbi(nearest.tbi)}
								>
									View Nearest TBI
								</Button>
							</div>
						)}
					</div>
					<div className="border-t border-line p-5 sm:p-6">
						<label htmlFor="tbi-filter" className="sr-only">
							Explore the directory
						</label>
						<input
							id="tbi-filter"
							className="tbi-input w-full"
							placeholder="Search incubators"
							value={filter}
							onChange={(event) => setFilter(event.target.value)}
						/>
						{filter && (
							<p className="mt-3 text-xs text-content-soft" aria-live="polite">
								{visible.length} results
							</p>
						)}
						<div
							className="mt-3 max-h-64 overflow-y-auto overscroll-contain"
							data-lenis-prevent
						>
							<ul className="space-y-2">
								{visible.map(({ tbi, distance }) => (
									<li key={tbi.id}>
										<button
											type="button"
											aria-pressed={selected?.id === tbi.id}
											onClick={() => focusTbi(tbi)}
											className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-action ${selected?.id === tbi.id ? "border-action bg-surface-tint" : "border-transparent hover:border-line hover:bg-surface-sunken"}`}
										>
											<span className="block text-sm text-content-heading">
												{tbi.name}
											</span>
											<span className="mt-1 block text-xs text-content-soft">
												{tbi.city}, {tbi.province}
											</span>
											{distance !== null && (
												<span className="mt-1 block text-xs text-action">
													{formatDistance(distance)}
												</span>
											)}
										</button>
									</li>
								))}
							</ul>
							{visible.length === 0 && (
								<p className="py-4 text-sm text-content-soft">
									No matching TBIs. Try another name or clear your filter.
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="order-first flex min-w-0 flex-col lg:order-none">
					<div className="relative flex flex-1 flex-col">
						<TbiMapCanvas
							tbis={TBIS}
							onSelect={selectMarker}
							selectedId={selected?.id}
							nearestId={nearest?.tbi.id}
							origin={origin}
							focus={focus}
							reset={0}
						/>
					</div>
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-xs text-content-soft">
						<span className="inline-flex items-center gap-2">
							<span className="size-2.5 rounded-full bg-action" />
							TBI
						</span>
						<span className="inline-flex items-center gap-2">
							<span className="size-2.5 rounded-full bg-success" />
							Nearest / selected
						</span>
						<span className="inline-flex items-center gap-2">
							<span className="size-2.5 rounded-full bg-highlight" />
							Search location
						</span>
					</div>
					{selected && (
						<article
							className="border-t border-line bg-surface-sunken p-5"
							aria-live="polite"
						>
							<h3 className="text-xl text-foreground">{selected.name}</h3>
							<p className="mt-2 text-sm text-content-strong">
								{selected.address}, {selected.city}, {selected.province}
							</p>
							<p className="mt-1 text-sm text-content-soft">
								Host: {selected.host}
							</p>
							{selected.description && (
								<p className="mt-3 text-sm leading-relaxed text-content-strong">
									{selected.description}
								</p>
							)}
							<Button asChild variant="secondary" className="mt-4">
								<a
									href={selected.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									View details
									<ExternalLink className="size-3.5" aria-hidden />
								</a>
							</Button>
						</article>
					)}
				</div>
			</div>

			<div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-surface-card p-6 text-center shadow-card sm:p-8">
				<h3 className="text-2xl leading-tight text-content-heading sm:text-3xl">
					Interested in partnering with us?
				</h3>
				<a
					href="mailto:hello@iskolar.io"
					className="mt-3 text-base text-action underline-offset-4 hover:underline"
				>
					hello@iskolar.io
				</a>
				<Button asChild size="lg" className="mt-6 text-on-action!">
					<a href="mailto:hello@iskolar.io?subject=TBI%20partnership%20inquiry">
						<Mail className="size-4" aria-hidden />
						Email Us
					</a>
				</Button>
			</div>
		</section>
	);
}
