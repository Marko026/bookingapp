import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
	// This typically corresponds to the `[locale]` segment
	let locale = await requestLocale;

	// Ensure that a valid locale is used
	if (!locale || !routing.locales.includes(locale as any)) {
		locale = routing.defaultLocale;
	}

	let messages;
	try {
		messages = (await import(`../../messages/${locale}.json`)).default;
	} catch (error) {
		console.error(`Failed to load messages for locale: ${locale}`, error);
		// Fallback to default locale
		messages = (await import(`../../messages/${routing.defaultLocale}.json`))
			.default;
	}

	return {
		locale,
		messages,
		// Enable fallback for missing keys
		onError: (error) => {
			if (process.env.NODE_ENV === "development") {
				console.error("Translation error:", error);
			}
		},
		getMessageFallback: ({ namespace, key }) => {
			// In development, show the key path for debugging
			if (process.env.NODE_ENV === "development") {
				return `${namespace}.${key}`;
			}
			// In production, return empty string to avoid showing technical details
			return "";
		},
	};
});
