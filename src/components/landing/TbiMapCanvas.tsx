import type * as Leaflet from "leaflet";
import { useEffect, useRef, useState } from "react";
import { type Coordinates, TBIS, type Tbi } from "#/lib/tbi/directory";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

export interface MapOrigin extends Coordinates {
	label: string;
	kind: "device" | "place";
	accuracy?: number;
}

interface Props {
	onSelect: (tbi: Tbi) => void;
	selectedId?: string;
	nearestId?: string;
	origin: MapOrigin | null;
	focus: { id: string; revision: number } | null;
	reset: number;
}

const COUNTRY_BOUNDS: Leaflet.LatLngBoundsLiteral = [
	[4.5, 116.7],
	[21.2, 127],
];

export function TbiMapCanvas({
	onSelect,
	selectedId,
	nearestId,
	origin,
	focus,
	reset,
}: Props) {
	const container = useRef<HTMLDivElement>(null);
	const countryView = useRef(true);
	const engine = useRef<{
		L: typeof Leaflet;
		map: Leaflet.Map;
		clusters: Leaflet.MarkerClusterGroup;
		markers: Map<string, Leaflet.Marker>;
	} | null>(null);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState(false);
	const [tileError, setTileError] = useState(false);
	const [attempt, setAttempt] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: attempt explicitly retries initialization after a failed chunk load.
	useEffect(() => {
		let cancelled = false;
		let map: Leaflet.Map | undefined;
		let observer: ResizeObserver | undefined;
		setError(false);
		setReady(false);
		async function initialize() {
			try {
				const { default: L } = await import("leaflet");
				// The cluster plugin's browser build extends the global Leaflet instance.
				(window as Window & { L?: typeof Leaflet }).L = L;
				await import("leaflet.markercluster");
				if (cancelled || !container.current) return;
				map = L.map(container.current, {
					scrollWheelZoom: false,
					zoomSnap: 0.25,
					minZoom: 4,
					maxZoom: 18,
				});
				map.fitBounds(COUNTRY_BOUNDS, { padding: [20, 20] });
				const tiles = L.tileLayer(
					import.meta.env.VITE_TBI_TILE_URL ||
						"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						maxZoom: 19,
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					},
				).addTo(map);
				tiles.on("tileerror", () => {
					if (!cancelled) setTileError(true);
				});
				tiles.on("load", () => {
					if (
						!cancelled &&
						container.current?.querySelector(".leaflet-tile-loaded")
					)
						setTileError(false);
				});
				const clusters = L.markerClusterGroup({
					maxClusterRadius: 45,
					showCoverageOnHover: false,
					animate: !window.matchMedia("(prefers-reduced-motion: reduce)")
						.matches,
					iconCreateFunction: (cluster) =>
						L.divIcon({
							className: "tbi-cluster",
							html: `<span>${cluster.getChildCount()}</span>`,
							iconSize: [42, 42],
						}),
				});
				const markers = new Map<string, Leaflet.Marker>();
				for (const tbi of TBIS) {
					const marker = L.marker([tbi.lat, tbi.lng], {
						icon: markerIcon(L, false),
						title: tbi.name,
						alt: tbi.name,
					});
					// Build popup nodes with textContent, so directory text is never HTML.
					const popup = document.createElement("div");
					popup.className = "tbi-popup";
					for (const [tag, text] of [
						["strong", tbi.name],
						["p", `${tbi.address}, ${tbi.city}, ${tbi.province}`],
						["p", `Host: ${tbi.host}`],
						...(tbi.description ? [["p", tbi.description]] : []),
					]) {
						const node = document.createElement(tag);
						node.textContent = text;
						popup.append(node);
					}
					const link = document.createElement("a");
					link.href = tbi.url;
					link.target = "_blank";
					link.rel = "noopener noreferrer";
					link.textContent = "View details ↗";
					popup.append(link);
					marker.bindPopup(popup, { maxWidth: 290 });
					marker.on("click", () => onSelect(tbi));
					clusters.addLayer(marker);
					markers.set(tbi.id, marker);
				}
				map.addLayer(clusters);
				engine.current = { L, map, clusters, markers };
				observer = new ResizeObserver(() => {
					map?.invalidateSize();
					if (countryView.current)
						map?.fitBounds(COUNTRY_BOUNDS, {
							padding: [20, 20],
							animate: false,
						});
				});
				observer.observe(container.current);
				setReady(true);
			} catch {
				if (!cancelled) {
					map?.remove();
					map = undefined;
					setError(true);
				}
			}
		}
		void initialize();
		return () => {
			cancelled = true;
			observer?.disconnect();
			map?.remove();
			engine.current = null;
		};
	}, [onSelect, attempt]);

	useEffect(() => {
		if (!ready || !engine.current) return;
		const { L, markers } = engine.current;
		for (const [id, marker] of markers)
			marker.setIcon(markerIcon(L, id === selectedId || id === nearestId));
	}, [ready, selectedId, nearestId]);

	useEffect(() => {
		if (!ready || !origin || !engine.current) return;
		countryView.current = false;
		const { L, map } = engine.current;
		const layers = L.layerGroup().addTo(map);
		L.marker([origin.lat, origin.lng], {
			icon: L.divIcon({
				className: "tbi-origin",
				html: "<span></span>",
				iconSize: [22, 22],
			}),
			title: origin.label,
		})
			.bindTooltip(origin.label)
			.addTo(layers);
		if (origin.kind === "device" && origin.accuracy)
			L.circle([origin.lat, origin.lng], {
				radius: origin.accuracy,
				color: "#607ef2",
				weight: 1,
				fillOpacity: 0.08,
			}).addTo(layers);
		const nearest = TBIS.find((tbi) => tbi.id === nearestId);
		if (nearest) {
			// A separate halo keeps the nearest visible even inside a dense cluster.
			L.circleMarker([nearest.lat, nearest.lng], {
				radius: 18,
				color: "#1a8a73",
				weight: 3,
				fillOpacity: 0.12,
			})
				.bindTooltip(`Nearest listed TBI: ${nearest.name}`)
				.addTo(layers);
			map.fitBounds(
				[
					[origin.lat, origin.lng],
					[nearest.lat, nearest.lng],
				],
				{ padding: [60, 60], maxZoom: 13, animate: false },
			);
		}
		return () => {
			layers.remove();
		};
	}, [ready, origin, nearestId]);

	useEffect(() => {
		if (!ready || !focus || !engine.current) return;
		countryView.current = false;
		const { map, clusters, markers } = engine.current;
		const marker = markers.get(focus.id);
		if (!marker) return;
		map.setView(marker.getLatLng(), 13, { animate: false });
		clusters.zoomToShowLayer(marker, () => {
			if (engine.current?.map === map) marker.openPopup();
		});
	}, [ready, focus]);

	useEffect(() => {
		if (!ready || reset === 0 || !engine.current) return;
		countryView.current = true;
		engine.current.map.closePopup();
		engine.current.map.fitBounds(COUNTRY_BOUNDS, {
			padding: [20, 20],
			animate: false,
		});
	}, [ready, reset]);

	return (
		<div className="relative h-[420px] min-w-0 bg-surface-sunken sm:h-[530px] lg:h-auto lg:min-h-[640px] lg:flex-1">
			<section
				ref={container}
				className="tbi-map absolute inset-0 z-0"
				aria-label="Interactive map of Philippine Technology Business Incubators"
				data-lenis-prevent
			/>
			{!ready && (
				<output className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface-sunken px-6 text-center">
					<span className="text-content-soft">
						{error
							? "The map couldn't load. You can still explore the directory."
							: "Loading the Philippines map…"}
					</span>
					{error && (
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => setAttempt((value) => value + 1)}
						>
							Retry map
						</button>
					)}
				</output>
			)}
			{tileError && (
				<output className="absolute inset-x-3 bottom-10 z-10 rounded-lg bg-card p-3 text-sm text-content-strong">
					Map tiles are unavailable. Markers and the directory still work. Check
					your connection.
				</output>
			)}
		</div>
	);
}

function markerIcon(L: typeof Leaflet, highlighted: boolean) {
	return L.divIcon({
		className: `tbi-pin${highlighted ? " tbi-pin-highlight" : ""}`,
		html: "<span></span>",
		iconSize: [26, 32],
		iconAnchor: [13, 32],
		popupAnchor: [0, -30],
	});
}
