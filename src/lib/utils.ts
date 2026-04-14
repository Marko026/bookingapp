import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Strips HTML tags and replaces common HTML entities with their plain text equivalents.
 * Optimized for performance using a single-pass regex for entities where possible.
 */
export function stripHtml(html: string) {
	if (!html) return "";

	const entities: Record<string, string> = {
		"&nbsp;": " ",
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": '"',
		"&#39;": "'",
	};

	return html
		.replace(/<[^>]*>/g, " ") // Remove HTML tags
		.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match) // Replace entities
		.replace(/\s+/g, " ") // Collapse multiple spaces
		.trim();
}
