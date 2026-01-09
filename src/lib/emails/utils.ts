/**
 * Formats a date string into Serbian Cyrillic format: "пон, 15. јун 2026."
 */
export function formatDateSR(dateString: string): string {
	try {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("sr-Cyrl-RS", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		}).format(date);
	} catch (_error) {
		return dateString;
	}
}
