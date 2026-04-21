import type { Apartment, Attraction } from "@/types";

const BASE_URL = "https://apartmani-todorovic.com";

export interface LodgingBusinessSchema {
	"@context": "https://schema.org";
	"@type": "LodgingBusiness";
	name: string;
	description: string;
	image: string[];
	address: {
		"@type": "PostalAddress";
		addressLocality: string;
		addressRegion: string;
		addressCountry: string;
	};
	geo?: {
		"@type": "GeoCoordinates";
		latitude: number;
		longitude: number;
	};
	priceRange?: string;
	aggregateRating?: {
		"@type": "AggregateRating";
		ratingValue: number;
		reviewCount: number;
	};
	telephone?: string;
	checkinTime?: string;
	checkoutTime?: string;
	starRating?: {
		"@type": "Rating";
		ratingValue: number;
	};
}

export interface TouristAttractionSchema {
	"@context": "https://schema.org";
	"@type": "TouristAttraction";
	name: string;
	description: string;
	image: string[];
	address?: {
		"@type": "PostalAddress";
		addressLocality: string;
		addressCountry: string;
	};
	geo?: {
		"@type": "GeoCoordinates";
		latitude: number;
		longitude: number;
	};
}

export interface WebSiteSchema {
	"@context": "https://schema.org";
	"@type": "WebSite";
	name: string;
	url: string;
	potentialAction?: {
		"@type": "SearchAction";
		target: {
			"@type": "EntryPoint";
			urlTemplate: string;
		};
		query: string;
	};
}

export function buildLodgingBusinessJSONLD(
	apartment: Apartment,
	locale: string,
): LodgingBusinessSchema {
	const name =
		locale === "en" && apartment.nameEn ? apartment.nameEn : apartment.name;
	const description =
		locale === "en" && apartment.descriptionEn
			? apartment.descriptionEn
			: apartment.description;

	const priceRange = `EUR ${apartment.price}`;

	const schema: LodgingBusinessSchema = {
		"@context": "https://schema.org",
		"@type": "LodgingBusiness",
		name,
		description: description?.substring(0, 500) || "",
		image: apartment.images,
		address: {
			"@type": "PostalAddress",
			addressLocality: "Vinci",
			addressRegion: "Serbia",
			addressCountry: "RS",
		},
		priceRange,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: apartment.rating,
			reviewCount: apartment.reviewsCount,
		},
	};

	if (apartment.latitude && apartment.longitude) {
		schema.geo = {
			"@type": "GeoCoordinates",
			latitude: apartment.latitude,
			longitude: apartment.longitude,
		};
	}

	return schema;
}

export function buildTouristAttractionJSONLD(
	attraction: Attraction,
	locale: string,
): TouristAttractionSchema {
	const name =
		locale === "en" && attraction.titleEn
			? attraction.titleEn
			: attraction.title;
	const description =
		locale === "en" && attraction.descriptionEn
			? attraction.descriptionEn
			: attraction.description || "";

	const schema: TouristAttractionSchema = {
		"@context": "https://schema.org",
		"@type": "TouristAttraction",
		name,
		description: description.substring(0, 500),
		image:
			attraction.gallery.length > 0
				? attraction.gallery
				: attraction.image
					? [attraction.image]
					: [],
	};

	if (attraction.latitude && attraction.longitude) {
		schema.geo = {
			"@type": "GeoCoordinates",
			latitude: attraction.latitude,
			longitude: attraction.longitude,
		};
	}

	return schema;
}

export function buildWebSiteJSONLD(): WebSiteSchema {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Apartmani Todorović",
		url: BASE_URL,
	};
}
