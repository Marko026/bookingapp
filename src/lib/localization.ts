/**
 * Get localized field from an object based on current locale
 * Eliminates manual locale checking logic
 */
export function getLocalizedField<T extends Record<string, any>>(
	obj: T,
	field: string,
	locale: string,
): string {
	// Map locale to field suffix
	const suffix = locale === "en" ? "En" : "";
	const localizedKey = `${field}${suffix}`;

	// Return localized field, fallback to base field, or empty string
	return (obj[localizedKey] as string) || (obj[field] as string) || "";
}
