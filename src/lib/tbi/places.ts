import { z } from "zod";
import { type Coordinates, TBIS } from "./directory";

export interface Place extends Coordinates {
	id: string;
	label: string;
}

// Offline choices for the cities/municipalities represented in the directory.
// These use approximate campus positions; remote search resolves other places.
export const DIRECTORY_PLACES: Place[] = Array.from(
	new Map(
		TBIS.map((tbi) => [
			`${tbi.city}, ${tbi.province}`,
			{
				id: tbi.id,
				label: `${tbi.city}, ${tbi.province}`,
				lat: tbi.lat,
				lng: tbi.lng,
			},
		]),
	).values(),
).sort((a, b) => a.label.localeCompare(b.label));

const resultsSchema = z.array(
	z.object({
		place_id: z.number(),
		display_name: z.string(),
		lat: z.coerce.number().min(-90).max(90),
		lon: z.coerce.number().min(-180).max(180),
	}),
);

// Explicit submit only: no autocomplete or background geocoder requests.
export async function searchPlaces(
	query: string,
	signal: AbortSignal,
): Promise<Place[]> {
	const params = new URLSearchParams({
		q: query,
		countrycodes: "ph",
		format: "jsonv2",
		limit: "5",
		"accept-language": "en",
	});
	const response = await fetch(
		`${import.meta.env.VITE_TBI_GEOCODER_URL || "https://nominatim.openstreetmap.org/search"}?${params}`,
		{ signal },
	);
	if (!response.ok)
		throw new Error(
			"Place search is unavailable. Choose a directory city below or try again.",
		);
	return resultsSchema.parse(await response.json()).map((place) => ({
		id: String(place.place_id),
		label: place.display_name,
		lat: place.lat,
		lng: place.lon,
	}));
}
