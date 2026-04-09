import type { MetadataRoute } from "next";
import { getAllApartmentsPublic } from "@/dal/apartments";
import { getAllAttractions } from "@/dal/attractions";
import { routing } from "@/i18n/routing";

// Adapt this to your domain
const BASE_URL = "https://apartmani-todorovic.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const apartments = await getAllApartmentsPublic();
	const attractions = await getAllAttractions();

	const sitemapEntries: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}`]),
				),
			},
		},
		...routing.locales.map((locale) => ({
			url: `${BASE_URL}/${locale}`,
			lastModified: new Date(),
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((l) => [l, `${BASE_URL}/${l}`]),
				),
			},
		})),
	];

	// Map apartments to sitemap
	apartments.forEach((apt) => {
		sitemapEntries.push({
			url: `${BASE_URL}/en/apartment/${apt.id}`, // Base URL (canonical could be one of the locales or without locale)
			lastModified: new Date(),
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((locale) => [
						locale,
						`${BASE_URL}/${locale}/apartment/${apt.id}`,
					]),
				),
			},
		});
	});

	// Map attractions to sitemap
	attractions.forEach((attr) => {
		sitemapEntries.push({
			url: `${BASE_URL}/en/attraction/${attr.id}`,
			lastModified: new Date(),
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((locale) => [
						locale,
						`${BASE_URL}/${locale}/attraction/${attr.id}`,
					]),
				),
			},
		});
	});

	return sitemapEntries;
}
