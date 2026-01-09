import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
	if (!html) return "";
	return html
		.replace(/<[^>]*>/g, " ") // Replace tags with space
		.replace(/\s+/g, " ") // Collapse multiple spaces
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.trim();
}
