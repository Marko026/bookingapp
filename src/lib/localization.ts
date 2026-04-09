/**
 * Get localized field from an object based on current locale
 * Eliminates manual locale checking logic
 */
export function getLocalizedField<T extends object>(
	obj: T,
	field: string,
	locale: string,
): string {
	// Map locale to field suffix
	const suffix = locale === "en" ? "En" : "";
	const localizedKey = `${field}${suffix}`;

	// Use an internal cast to Record<string, unknown> to allow dynamic access
	// while maintaining 'unknown' safety over 'any'
	const data = obj as Record<string, unknown>;

	// Return localized field, fallback to base field, or empty string
	return (data[localizedKey] as string) || (data[field] as string) || "";
}
