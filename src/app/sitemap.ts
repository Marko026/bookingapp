import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

// Adapt this to your domain
const BASE_URL = "https://apartmani-todorovic.com";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			alternates: {
				languages: Object.fromEntries(
					routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}`]),
				),
			},
		},
		// Loop through locales for the main page entry as well if you want separate entries,
		// but typically one entry with alternates is enough for Google.
		// However, some prefer listing each. Let's list each locale.
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
}
